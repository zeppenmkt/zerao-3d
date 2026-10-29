const PORTAL_STORAGE_KEY = "zerao-life-v1";
const NUTRITION_TARGETS = { calories: 2300, protein: 190, carbs: 205, fat: 80 };
let shapePhotos = [];
let selectedShapeIds = [];

function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function loadPortalState() {
  const fallback = { daily: {}, meals: [], weights: [], sleeps: [], supplements: [], healthNotes: [] };
  try {
    const saved = JSON.parse(localStorage.getItem(PORTAL_STORAGE_KEY));
    if (!saved || typeof saved !== "object") return fallback;
    return {
      daily: saved.daily && typeof saved.daily === "object" ? saved.daily : {},
      meals: Array.isArray(saved.meals) ? saved.meals : [],
      weights: Array.isArray(saved.weights) ? saved.weights : [],
      sleeps: Array.isArray(saved.sleeps) ? saved.sleeps : [],
      supplements: Array.isArray(saved.supplements) ? saved.supplements : [],
      healthNotes: Array.isArray(saved.healthNotes) ? saved.healthNotes : [],
    };
  } catch {
    return fallback;
  }
}

const portalState = loadPortalState();
const portalToday = localDateKey();
portalState.daily[portalToday] ??= { water: false, supplements: {} };
portalState.daily[portalToday].supplements ??= {};

function savePortalState() {
  localStorage.setItem(PORTAL_STORAGE_KEY, JSON.stringify(portalState));
  window.zeraoSync?.schedule();
}

function makeId() {
  return window.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function escapeMarkup(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function notifyPortal(message) {
  if (typeof showToast === "function") showToast(message);
}

function formatShortDate(dateValue) {
  const [year, month, day] = String(dateValue).split("-").map(Number);
  if (!year || !month || !day) return dateValue;
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(new Date(year, month - 1, day));
}

function todayMeals() {
  return portalState.meals.filter((meal) => localDateKey(new Date(meal.createdAt)) === portalToday);
}

function mealTotal(meals, key) {
  return meals.reduce((sum, meal) => sum + (Number(meal[key]) || 0), 0);
}

// Refeições do dia + doses de suplemento marcadas: tudo soma na mesma meta de macros.
function todayIntake() {
  const checked = portalState.daily[portalToday].supplements;
  return [...todayMeals(), ...portalState.supplements.filter((item) => checked[item.id])];
}

function macroCopy(source) {
  return [
    source.calories ? `${Number(source.calories).toLocaleString("pt-BR")} kcal` : "",
    source.protein ? `${Number(source.protein).toLocaleString("pt-BR")} g prot.` : "",
  ].filter(Boolean).join(" · ");
}

function todaySleep() {
  return portalState.sleeps.find((entry) => entry.date === portalToday);
}

function workoutNumbers() {
  const done = document.querySelectorAll(".set-check:checked").length;
  const total = document.querySelectorAll(".set-check").length;
  return { done, total };
}

function supplementStatus() {
  if (!portalState.supplements.length) return { applicable: false, done: false, count: 0 };
  const checked = portalState.daily[portalToday].supplements;
  const count = portalState.supplements.filter((item) => checked[item.id]).length;
  return { applicable: true, done: count === portalState.supplements.length, count };
}

function renderMeals() {
  const meals = todayMeals().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const list = document.querySelector("#meal-list");
  document.querySelector("#meal-count").textContent = `${meals.length} ${meals.length === 1 ? "registro" : "registros"}`;
  document.querySelector("#metric-meals").textContent = meals.length;
  renderNutritionTargets(todayIntake());

  if (!meals.length) {
    list.innerHTML = '<div class="empty-state"><b>Seu prato ainda está vazio por aqui.</b><span>Registre a primeira refeição do dia.</span></div>';
    return;
  }

  list.innerHTML = meals
    .map((meal) => {
      const time = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(new Date(meal.createdAt));
      const macros = macroCopy(meal);
      return `<article class="log-entry">
        <span class="entry-time">${time}</span>
        <div><strong>${escapeMarkup(meal.type)}</strong><p>${escapeMarkup(meal.description)}</p></div>
        ${macros ? `<em>${escapeMarkup(macros)}</em>` : ""}
        <button type="button" data-remove-meal="${escapeMarkup(meal.id)}" aria-label="Remover refeição">×</button>
      </article>`;
    })
    .join("");
}

function renderNutritionTargets(sources) {
  Object.entries(NUTRITION_TARGETS).forEach(([key, target]) => {
    const total = mealTotal(sources, key);
    const unit = key === "calories" ? "kcal" : "g";
    const label = document.querySelector(`#nutrition-${key}`);
    const bar = document.querySelector(`[data-nutrient="${key}"] u`);
    if (label) label.textContent = `${Math.round(total).toLocaleString("pt-BR")} / ${target.toLocaleString("pt-BR")} ${unit}`;
    if (bar) {
      bar.style.width = `${Math.min(100, (total / target) * 100)}%`;
      bar.closest("div")?.classList.toggle("over", total > target * 1.05);
    }
  });
}

function renderShapeComparison() {
  const container = document.querySelector("#shape-compare");
  const selected = selectedShapeIds.map((id) => shapePhotos.find((photo) => photo.id === id)).filter(Boolean);
  if (selected.length !== 2) {
    container.hidden = true;
    container.innerHTML = "";
    return;
  }
  container.hidden = false;
  container.innerHTML = `<div class="shape-compare-head"><span>Comparação lado a lado</span><button type="button" data-clear-comparison>Fechar</button></div>
    <div class="shape-compare-grid">${selected.map((photo) => `<figure><img src="${window.zeraoSync.shapeUrl(photo.id)}" alt="Shape em ${escapeMarkup(formatShortDate(photo.date))}, ${escapeMarkup(photo.view)}" /><figcaption><b>${escapeMarkup(formatShortDate(photo.date))}</b><span>${escapeMarkup(photo.view)}</span></figcaption></figure>`).join("")}</div>`;
}

async function renderShapes() {
  const gallery = document.querySelector("#shape-gallery");
  if (!gallery) return;
  gallery.innerHTML = '<div class="empty-state shape-loading"><b>Carregando evolução…</b></div>';
  try {
    shapePhotos = await window.zeraoSync.listShapes();
  } catch {
    gallery.innerHTML = '<div class="empty-state"><b>Galeria indisponível.</b><span>Tente novamente quando a conexão voltar.</span></div>';
    return;
  }
  document.querySelector("#shape-count").textContent = `${shapePhotos.length} ${shapePhotos.length === 1 ? "foto" : "fotos"}`;
  if (!shapePhotos.length) {
    gallery.innerHTML = `<div class="empty-state"><b>A evolução visual começa na primeira foto.</b><span>${isLocalPreview ? "O envio será liberado na área privada publicada." : "Use luz, distância e posição parecidas para comparar melhor."}</span></div>`;
    renderShapeComparison();
    return;
  }
  gallery.innerHTML = shapePhotos.map((photo) => `<article class="shape-photo ${selectedShapeIds.includes(photo.id) ? "selected" : ""}">
    <img src="${window.zeraoSync.shapeUrl(photo.id)}" alt="Foto de evolução do shape em ${escapeMarkup(formatShortDate(photo.date))}" loading="lazy" />
    <div><span><b>${escapeMarkup(formatShortDate(photo.date))}</b><small>${escapeMarkup(photo.view)}</small></span>
      ${photo.note ? `<p>${escapeMarkup(photo.note)}</p>` : ""}
      <div class="shape-photo-actions"><button type="button" data-compare-shape="${escapeMarkup(photo.id)}">${selectedShapeIds.includes(photo.id) ? "Selecionada" : "Comparar"}</button><button type="button" data-remove-shape="${escapeMarkup(photo.id)}">Remover</button></div>
    </div>
  </article>`).join("");
  renderShapeComparison();
}

function renderWeights() {
  const entries = [...portalState.weights].sort((a, b) => a.date.localeCompare(b.date)).slice(-10);
  const chartData = document.querySelector("#weight-chart-data");

  if (!entries.length) {
    chartData.innerHTML = '<text x="360" y="112" text-anchor="middle">Sua tendência aparecerá aqui</text>';
    document.querySelector("#weight-current").textContent = "— kg";
    document.querySelector("#weight-change").textContent = "Registre seu primeiro peso";
    document.querySelector("#metric-weight").textContent = "—";
    return;
  }

  const values = entries.map((entry) => Number(entry.value));
  const min = Math.min(...values);
  const max = Math.max(...values);
  const spread = Math.max(max - min, 1);
  const points = entries.map((entry, index) => {
    const x = entries.length === 1 ? 360 : 35 + (index / (entries.length - 1)) * 650;
    const y = 180 - ((Number(entry.value) - min) / spread) * 130;
    return { x, y, value: Number(entry.value) };
  });
  const polyline = points.map((point) => `${point.x},${point.y}`).join(" ");
  chartData.innerHTML = `<polyline points="${polyline}"></polyline>${points
    .map((point) => `<circle cx="${point.x}" cy="${point.y}" r="5"></circle>`)
    .join("")}`;

  const latest = entries.at(-1);
  const difference = Number(latest.value) - Number(entries[0].value);
  const [year, month, day] = latest.date.split("-").map(Number);
  const weekStart = localDateKey(new Date(year, month - 1, day - 6));
  const week = entries.filter((entry) => entry.date >= weekStart);
  const weekAverage = week.reduce((sum, entry) => sum + Number(entry.value), 0) / week.length;
  const kg = (value) => value.toLocaleString("pt-BR", { maximumFractionDigits: 1 });
  document.querySelector("#weight-current").textContent = `${Number(latest.value).toLocaleString("pt-BR")} kg`;
  document.querySelector("#metric-weight").textContent = Number(latest.value).toLocaleString("pt-BR");
  document.querySelector("#weight-change").textContent =
    entries.length === 1
      ? "Primeiro ponto registrado"
      : `${difference > 0 ? "+" : ""}${kg(difference)} kg no período${week.length > 1 ? ` · média 7 dias: ${kg(weekAverage)} kg` : ""}`;
  document.querySelector("#chart-start").textContent = formatShortDate(entries[0].date);
  document.querySelector("#chart-end").textContent = formatShortDate(latest.date);
}

function renderSleep() {
  const latest = [...portalState.sleeps].sort((a, b) => b.date.localeCompare(a.date))[0];
  if (!latest) {
    document.querySelector("#last-sleep-hours").textContent = "—";
    document.querySelector("#metric-sleep").textContent = "—";
    document.querySelector("#recovery-bar").style.width = "0%";
    document.querySelector("#sleep-insight").textContent = "Registre uma noite para começar a entender seu padrão.";
    return;
  }

  const hours = Number(latest.hours);
  const score = Math.min(100, Math.round((hours / 8) * 70 + (Number(latest.quality) / 5) * 30));
  document.querySelector("#last-sleep-hours").textContent = hours.toLocaleString("pt-BR");
  document.querySelector("#metric-sleep").textContent = hours.toLocaleString("pt-BR");
  document.querySelector("#recovery-bar").style.width = `${score}%`;
  document.querySelector("#sleep-insight").textContent =
    hours >= 7 && Number(latest.quality) >= 4
      ? "Boa base de recuperação. Observe como isso aparece no treino e na disposição."
      : hours >= 6
        ? "Noite registrada. Tente buscar mais regularidade e perceba a qualidade ao acordar."
        : "Recuperação curta. Vale proteger a próxima noite e reduzir a cobrança no treino se necessário.";
}

function renderSupplements() {
  const list = document.querySelector("#supplement-list");
  const checked = portalState.daily[portalToday].supplements;
  document.querySelector("#supplement-count").textContent = `${portalState.supplements.length} ${portalState.supplements.length === 1 ? "item" : "itens"}`;

  if (!portalState.supplements.length) {
    list.innerHTML = '<div class="empty-state"><b>Nenhuma rotina cadastrada.</b><span>Adicione apenas itens já orientados para você.</span></div>';
    return;
  }

  list.innerHTML = portalState.supplements
    .map((item) => `<article class="supplement-item ${checked[item.id] ? "done" : ""}">
      <label><input type="checkbox" data-supplement-check="${escapeMarkup(item.id)}" ${checked[item.id] ? "checked" : ""} /><i>✓</i><span><strong>${escapeMarkup(item.name)}</strong><small>${escapeMarkup([item.instruction || "Sem horário informado", macroCopy(item)].filter(Boolean).join(" · "))}</small></span></label>
      <button type="button" data-remove-supplement="${escapeMarkup(item.id)}" aria-label="Remover suplemento">×</button>
    </article>`)
    .join("");
}

function renderHealthNotes() {
  const list = document.querySelector("#health-list");
  const notes = [...portalState.healthNotes].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 12);
  if (!notes.length) {
    list.innerHTML = '<div class="empty-state"><b>Nenhuma observação salva.</b><span>Use este espaço para preparar melhor suas conversas com profissionais.</span></div>';
    return;
  }

  list.innerHTML = notes
    .map((note) => `<article class="health-entry">
      <span>${escapeMarkup(formatShortDate(note.date))}</span><div><strong>${escapeMarkup(note.category)}</strong><p>${escapeMarkup(note.note)}</p></div>
      <button type="button" data-remove-health="${escapeMarkup(note.id)}" aria-label="Remover observação">×</button>
    </article>`)
    .join("");
}

function updateDashboard() {
  const meals = todayMeals();
  const sleep = todaySleep();
  const workout = workoutNumbers();
  const supplements = supplementStatus();
  const water = Boolean(portalState.daily[portalToday].water);
  const rest = Boolean(portalState.daily[portalToday].rest);
  const sessions = getHistory().filter((entry) => entryDay(entry) === portalToday);
  const protein = mealTotal(todayIntake(), "protein");
  // Com proteína registrada, a meta conta; sem estimativas, vale a regularidade de 3 refeições. Suplementos cadastrados precisam ser tomados.
  const foodDone = protein > 0 ? protein >= NUTRITION_TARGETS.protein * 0.9 : meals.length >= 3;
  const pillars = {
    workout: workout.done > 0 || sessions.length > 0 || rest,
    nutrition: foodDone && (!supplements.applicable || supplements.done),
    water,
    sleep: Boolean(sleep),
  };

  const activeKeys = Object.keys(pillars);
  const completed = activeKeys.filter((key) => pillars[key]).length;
  const score = Math.round((completed / activeKeys.length) * 100);

  document.querySelector("#overall-score").textContent = `${score}%`;
  document.querySelector("#overall-bar").style.width = `${score}%`;
  document.querySelector("#overall-message").textContent =
    score === 100 ? "Dia completo. É assim que o projeto vira resultado." : score >= 60 ? "Boa construção. Ainda dá para fechar mais um pilar." : score > 0 ? "O Zerão já começou hoje. Mantém o movimento." : "Seu próximo passo começa aqui.";

  Object.entries(pillars).forEach(([key, done]) => {
    const element = document.querySelector(`[data-pillar="${key}"]`);
    element?.classList.toggle("done", done);
  });

  document.querySelector('[data-check="water"]').classList.toggle("done", water);
  document.querySelector('[data-derived="nutrition"]').classList.toggle("done", pillars.nutrition);
  document.querySelector('[data-derived="sleep"]').classList.toggle("done", pillars.sleep);
  document.querySelector('[data-derived="workout"]').classList.toggle("done", pillars.workout);
  const nutritionParts = [
    meals.length ? `${meals.length} ${meals.length === 1 ? "refeição" : "refeições"}` : "",
    supplements.applicable ? `${supplements.count}/${portalState.supplements.length} suplementos` : "",
    protein > 0 ? `${Math.round(protein)} de ${NUTRITION_TARGETS.protein} g de proteína` : "",
  ].filter(Boolean);
  document.querySelector("#nutrition-task-copy").textContent = nutritionParts.length ? nutritionParts.join(" · ") : "Nada registrado ainda";
  document.querySelector("#sleep-task-copy").textContent = sleep ? `${Number(sleep.hours).toLocaleString("pt-BR")} horas registradas` : "Sono ainda não registrado";
  const sessionNames = sessions.map((entry) => (entry.workoutId === "CARDIO" ? `cardio ${entry.minutes} min` : `treino ${entry.workoutId}`));
  document.querySelector("#workout-task-copy").textContent = workout.done
    ? `${workout.done} de ${workout.total} séries concluídas`
    : sessionNames.length
      ? `Registrado: ${sessionNames.join(" + ")}`
      : rest ? "Dia de descanso" : "Treino ainda não iniciado";
  document.querySelector("#metric-workout").textContent = `${workout.done}/${workout.total || 28}`;
}

function renderPortal() {
  renderMeals();
  renderWeights();
  renderSleep();
  renderSupplements();
  renderHealthNotes();
  renderRestPanel();
  updateDashboard();
  renderShapes();
}

document.querySelector("#today-label").textContent = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "2-digit", month: "short" }).format(new Date());
document.querySelector("#weight-date").value = portalToday;
document.querySelector("#health-date").value = portalToday;
document.querySelector("#shape-date").value = portalToday;
document.querySelector("#sleep-date").value = portalToday;
document.querySelector("#sleep-date").max = portalToday;

// O descanso vale para a data escolhida no treino, então dá para marcar o de ontem.
function renderRestPanel() {
  const day = document.querySelector("#session-date").value || portalToday;
  const rest = Boolean(portalState.daily[day]?.rest);
  const label = relativeDay(day);
  document.querySelector("#rest-toggle").innerHTML = rest ? `Descanso de ${escapeMarkup(label)} marcado ✓ <span>×</span>` : `Marcar descanso de ${escapeMarkup(label)} <span>→</span>`;
}

document.querySelector("#rest-toggle").addEventListener("click", () => {
  const day = document.querySelector("#session-date").value || portalToday;
  portalState.daily[day] ??= { water: false, supplements: {} };
  portalState.daily[day].rest = !portalState.daily[day].rest;
  savePortalState();
  renderExercises();
  notifyPortal(portalState.daily[day].rest ? "Descanso marcado. Recuperar também é treino." : "Descanso desmarcado.");
});

document.querySelector("#session-date").addEventListener("change", renderRestPanel);

document.querySelector('[data-check="water"]').addEventListener("click", () => {
  portalState.daily[portalToday].water = !portalState.daily[portalToday].water;
  savePortalState();
  updateDashboard();
  notifyPortal(portalState.daily[portalToday].water ? "Hidratação marcada. Boa!" : "Hidratação desmarcada.");
});

document.querySelector("#meal-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const description = document.querySelector("#meal-description").value.trim();
  if (!description) return;
  portalState.meals.push({
    id: makeId(),
    type: document.querySelector("#meal-type").value,
    description,
    calories: document.querySelector("#meal-calories").value,
    protein: document.querySelector("#meal-protein").value,
    carbs: document.querySelector("#meal-carbs").value,
    fat: document.querySelector("#meal-fat").value,
    createdAt: new Date().toISOString(),
  });
  portalState.meals = portalState.meals.slice(-120);
  savePortalState();
  event.currentTarget.reset();
  renderMeals();
  updateDashboard();
  notifyPortal("Refeição registrada.");
});

document.querySelector("#meal-list").addEventListener("click", (event) => {
  const button = event.target.closest("[data-remove-meal]");
  if (!button || !window.confirm("Remover esta refeição do diário?")) return;
  portalState.meals = portalState.meals.filter((meal) => meal.id !== button.dataset.removeMeal);
  savePortalState();
  renderMeals();
  updateDashboard();
});

document.querySelector("#weight-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const value = Number(document.querySelector("#weight-value").value);
  const date = document.querySelector("#weight-date").value;
  if (!value || !date) return;
  const existing = portalState.weights.find((entry) => entry.date === date);
  if (existing) existing.value = value;
  else portalState.weights.push({ id: makeId(), value, date });
  portalState.weights = portalState.weights.sort((a, b) => a.date.localeCompare(b.date)).slice(-90);
  savePortalState();
  document.querySelector("#weight-value").value = "";
  renderWeights();
  updateDashboard();
  notifyPortal("Peso salvo na curva de evolução.");
});

document.querySelector("#shape-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const file = document.querySelector("#shape-photo").files[0];
  if (!file) return;
  const button = event.currentTarget.querySelector("button[type='submit']");
  const originalCopy = button.innerHTML;
  button.disabled = true;
  button.textContent = "Guardando foto…";
  const formData = new FormData();
  formData.append("photo", file);
  formData.append("date", document.querySelector("#shape-date").value);
  formData.append("view", document.querySelector("#shape-view").value);
  formData.append("note", document.querySelector("#shape-note").value.trim());
  try {
    await window.zeraoSync.uploadShape(formData);
    event.currentTarget.reset();
    document.querySelector("#shape-date").value = portalToday;
    await renderShapes();
    notifyPortal("Foto guardada na sua galeria privada.");
  } catch (error) {
    notifyPortal(error.message || "Não foi possível guardar a foto.");
  } finally {
    button.disabled = false;
    button.innerHTML = originalCopy;
  }
});

document.querySelector("#shape-gallery").addEventListener("click", async (event) => {
  const compareButton = event.target.closest("[data-compare-shape]");
  if (compareButton) {
    const id = compareButton.dataset.compareShape;
    if (selectedShapeIds.includes(id)) selectedShapeIds = selectedShapeIds.filter((item) => item !== id);
    else selectedShapeIds = [...selectedShapeIds.slice(-1), id];
    renderShapes();
    return;
  }
  const removeButton = event.target.closest("[data-remove-shape]");
  if (!removeButton || !window.confirm("Remover esta foto da evolução? Esta ação não pode ser desfeita.")) return;
  try {
    await window.zeraoSync.removeShape(removeButton.dataset.removeShape);
    selectedShapeIds = selectedShapeIds.filter((id) => id !== removeButton.dataset.removeShape);
    await renderShapes();
    notifyPortal("Foto removida da galeria privada.");
  } catch {
    notifyPortal("Não foi possível remover a foto.");
  }
});

document.querySelector("#shape-compare").addEventListener("click", (event) => {
  if (!event.target.closest("[data-clear-comparison]")) return;
  selectedShapeIds = [];
  renderShapes();
});

const qualityLabels = { 1: "1 · ruim", 2: "2 · fraca", 3: "3 · razoável", 4: "4 · boa", 5: "5 · excelente" };
document.querySelector("#sleep-quality").addEventListener("input", (event) => {
  document.querySelector("#sleep-quality-label").textContent = qualityLabels[event.target.value];
});

document.querySelector("#sleep-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const hours = Number(document.querySelector("#sleep-hours").value);
  const quality = Number(document.querySelector("#sleep-quality").value);
  const bedtime = document.querySelector("#sleep-time").value;
  const date = document.querySelector("#sleep-date").value || portalToday;
  const existing = portalState.sleeps.find((entry) => entry.date === date);
  const record = { id: existing?.id ?? makeId(), date, hours, quality, bedtime };
  if (existing) Object.assign(existing, record);
  else portalState.sleeps.push(record);
  portalState.sleeps = portalState.sleeps.sort((a, b) => a.date.localeCompare(b.date)).slice(-90);
  savePortalState();
  renderSleep();
  updateDashboard();
  notifyPortal("Sono registrado. Recuperação também faz parte.");
});

document.querySelector("#supplement-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const name = document.querySelector("#supplement-name").value.trim();
  if (!name) return;
  portalState.supplements.push({
    id: makeId(),
    name,
    instruction: document.querySelector("#supplement-instruction").value.trim(),
    calories: document.querySelector("#supplement-calories").value,
    protein: document.querySelector("#supplement-protein").value,
    carbs: document.querySelector("#supplement-carbs").value,
    fat: document.querySelector("#supplement-fat").value,
  });
  savePortalState();
  event.currentTarget.reset();
  renderSupplements();
  renderMeals();
  updateDashboard();
  notifyPortal("Item adicionado à rotina.");
});

document.querySelector("#supplement-list").addEventListener("change", (event) => {
  const input = event.target.closest("[data-supplement-check]");
  if (!input) return;
  portalState.daily[portalToday].supplements[input.dataset.supplementCheck] = input.checked;
  savePortalState();
  renderSupplements();
  renderMeals();
  updateDashboard();
});

document.querySelector("#supplement-list").addEventListener("click", (event) => {
  const button = event.target.closest("[data-remove-supplement]");
  if (!button || !window.confirm("Remover este item da rotina?")) return;
  portalState.supplements = portalState.supplements.filter((item) => item.id !== button.dataset.removeSupplement);
  delete portalState.daily[portalToday].supplements[button.dataset.removeSupplement];
  savePortalState();
  renderSupplements();
  renderMeals();
  updateDashboard();
});

document.querySelector("#health-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const note = document.querySelector("#health-note").value.trim();
  const date = document.querySelector("#health-date").value;
  if (!note || !date) return;
  portalState.healthNotes.push({ id: makeId(), category: document.querySelector("#health-category").value, date, note });
  portalState.healthNotes = portalState.healthNotes.slice(-100);
  savePortalState();
  document.querySelector("#health-note").value = "";
  renderHealthNotes();
  notifyPortal("Observação de saúde salva.");
});

document.querySelector("#health-list").addEventListener("click", (event) => {
  const button = event.target.closest("[data-remove-health]");
  if (!button || !window.confirm("Remover esta observação?")) return;
  portalState.healthNotes = portalState.healthNotes.filter((note) => note.id !== button.dataset.removeHealth);
  savePortalState();
  renderHealthNotes();
});

document.querySelector("#exercise-list").addEventListener("change", () => window.setTimeout(updateDashboard));
document.querySelector("#finish-workout").addEventListener("click", () => window.setTimeout(updateDashboard));

const observedSections = [...document.querySelectorAll(".module-section, #visao-geral")];
const navLinks = [...document.querySelectorAll(".module-nav a")];
const sectionObserver = new IntersectionObserver(
  (entries) => {
    const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    navLinks.forEach((link) => link.classList.toggle("active", link.getAttribute("href") === `#${visible.target.id}`));
  },
  { rootMargin: "-20% 0px -65%", threshold: [0.05, 0.25] },
);
observedSections.forEach((section) => sectionObserver.observe(section));

// Aba aberta desde ontem: recarrega para o "hoje" valer de novo (sem interromper quem está digitando).
function reloadOnNewDay() {
  if (document.visibilityState !== "visible" || localDateKey() === portalToday) return;
  if (document.activeElement?.matches("input, textarea, select")) return;
  window.location.reload();
}
document.addEventListener("visibilitychange", reloadOnNewDay);
window.setInterval(reloadOnNewDay, 60_000);

renderPortal();
