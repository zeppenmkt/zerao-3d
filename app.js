// Fichas padrão do ciclo. A ficha personalizada de cada treino fica em state.plans; trocas de uma sessão, em state.sessionPlans.
const workouts = {
  A: {
    title: "Peito + ombros",
    focus: "Peitoral superior, peitoral geral e deltoides",
    exercises: [
      { id: "a-supino-inclinado", sets: 4 },
      { id: "a-supino-reto-maquina", sets: 4 },
      { id: "a-peck-deck", sets: 4 },
      { id: "a-elevacao-lateral", sets: 4 },
      { id: "a-crucifixo-inverso", sets: 4 },
    ],
  },
  B: {
    title: "Pernas + panturrilhas",
    focus: "Quadríceps, posteriores, glúteos e panturrilhas",
    exercises: [
      { id: "b-leg-press", sets: 4 },
      { id: "b-extensora", sets: 4 },
      { id: "b-flexora", sets: 4 },
      { id: "b-abdutora", sets: 4 },
      { id: "b-adutora", sets: 4 },
      { id: "b-panturrilha", sets: 4 },
    ],
  },
  C: {
    title: "Costas + abdômen",
    focus: "Largura, espessura, trapézio e estabilidade abdominal",
    exercises: [
      { id: "c-puxada-aberta", sets: 4 },
      { id: "c-puxada-fechada", sets: 4 },
      { id: "c-remada-baixa", sets: 4 },
      { id: "c-remada-articulada", sets: 4 },
      { id: "c-encolhimento", sets: 4 },
      { id: "c-abdominal-maquina", sets: 4 },
      { id: "c-bird-dog", sets: 4 },
    ],
  },
  D: {
    title: "Bíceps + tríceps + antebraço",
    focus: "Bíceps, tríceps, braquial e antebraços",
    exercises: [
      { id: "d-rosca-direta", sets: 4 },
      { id: "d-rosca-alternada", sets: 4 },
      { id: "d-rosca-martelo", sets: 4 },
      { id: "d-triceps-corda", sets: 4 },
      { id: "d-triceps-frances", sets: 4 },
      { id: "d-rosca-inversa", sets: 4 },
    ],
  },
  // Dia só de cardio: fora do ciclo A → B → C → D → descanso.
  CARDIO: {
    title: "Cardio",
    focus: "Dia só de cardio",
    exercises: [{ id: "k-esteira-caminhada" }],
  },
};

const STORAGE_KEY = "zerao-workout-v3";
const HISTORY_KEY = "zerao-history-v2";
const HISTORY_LIMIT = 200;
const SESSION_MODES = { R: "Descanso" };
const CYCLE = ["A", "B", "C", "D", "R"];
const state = loadState();
let selectedWorkoutId = isSelectable(state.selectedWorkoutId) ? state.selectedWorkoutId : "A";
let currentExercise = null;
let toastTimer = null;

const list = document.querySelector("#exercise-list");
const movementModal = document.querySelector("#movement-modal");
const historyModal = document.querySelector("#history-modal");
const pickerModal = document.querySelector("#exercise-picker");
let pickerTarget = null;
const sessionDateInput = document.querySelector("#session-date");

function isSelectable(workoutId) {
  return Boolean(workouts[workoutId] || SESSION_MODES[workoutId]);
}

function sessionLabel(workoutId) {
  if (workoutId === "CARDIO") return "Cardio";
  return workouts[workoutId] ? `Treino ${workoutId} — ${workouts[workoutId].title}` : SESSION_MODES[workoutId];
}

function isCardio(exercise) {
  return exercise?.kind === "cardio";
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return saved && typeof saved === "object" ? saved : {};
  } catch {
    return {};
  }
}

function saveState() {
  state.selectedWorkoutId = selectedWorkoutId;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  window.zeraoSync?.schedule();
}

function currentWorkout() {
  return workouts[selectedWorkoutId];
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char]);
}

function exerciseInfo(exerciseId) {
  return state.customExercises?.[exerciseId] ?? EXERCISE_LIBRARY[exerciseId];
}

function allExercises() {
  return { ...EXERCISE_LIBRARY, ...state.customExercises };
}

function planFor(workoutId) {
  return state.sessionPlans?.[workoutId] ?? state.plans?.[workoutId] ?? workouts[workoutId].exercises;
}

// Ficha efetiva: cada item da ficha ({ id, sets, reps? }) completado com os dados da biblioteca.
function exercisesFor(workoutId) {
  return planFor(workoutId)
    .map((slot) => {
      const info = exerciseInfo(slot.id);
      return info && { ...info, ...slot, sets: isCardio(info) ? 0 : slot.sets ?? 4, reps: slot.reps ?? info.reps };
    })
    .filter(Boolean);
}

function currentExercises() {
  return currentWorkout() ? exercisesFor(selectedWorkoutId) : [];
}

// Cerca de 3,25 min por série, contando o descanso, mais os minutos de cardio (10 quando não informados); de 5 em 5.
function estimatedDuration(exercises) {
  const minutes = exercises.reduce((sum, exercise) => sum + (isCardio(exercise) ? Number(exerciseState(exercise.id).minutes) || 10 : exercise.sets * 3.25), 0);
  return `cerca de ${Math.max(5, Math.round(minutes / 5) * 5)} min`;
}

function exerciseState(exerciseId) {
  state.workouts ??= {};
  state.workouts[selectedWorkoutId] ??= {};
  state.workouts[selectedWorkoutId][exerciseId] ??= {};
  return state.workouts[selectedWorkoutId][exerciseId];
}

function getHistory() {
  try {
    const history = JSON.parse(localStorage.getItem(HISTORY_KEY));
    return Array.isArray(history) ? history : [];
  } catch {
    return [];
  }
}

function saveHistory(history) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, HISTORY_LIMIT)));
  window.zeraoSync?.schedule();
}

function dayKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function entryDay(entry) {
  return entry.day ?? dayKey(new Date(entry.date));
}

function addHistoryEntry(entry) {
  const history = getHistory();
  const retro = entry.day !== dayKey();
  history.push({ id: window.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`, ...entry, ...(retro && { retro }) });
  history.sort((a, b) => String(b.date).localeCompare(String(a.date)));
  saveHistory(history);
}

function restDays() {
  try {
    const daily = JSON.parse(localStorage.getItem("zerao-life-v1"))?.daily ?? {};
    return Object.keys(daily).filter((day) => daily[day]?.rest);
  } catch {
    return [];
  }
}

// Próximo passo do ciclo a partir do último treino de força ou descanso registrado; cardio não avança o ciclo.
function suggestedWorkout() {
  const events = [
    ...getHistory().filter((entry) => CYCLE.includes(entry.workoutId)).map((entry) => ({ day: entryDay(entry), id: entry.workoutId })),
    ...restDays().map((day) => ({ day, id: "R" })),
  ];
  if (!events.length) return "A";
  const latest = events.reduce((last, event) => (event.day > last.day ? event : last));
  return CYCLE[(CYCLE.indexOf(latest.id) + 1) % CYCLE.length];
}

function sessionDay() {
  return sessionDateInput.value || dayKey();
}

// Treino de hoje leva a hora real; registro de outro dia fica ao meio-dia daquela data.
function sessionTimestamp() {
  const day = sessionDay();
  return day === dayKey() ? new Date().toISOString() : new Date(`${day}T12:00:00`).toISOString();
}

function resetSessionDate() {
  sessionDateInput.value = dayKey();
  sessionDateInput.max = dayKey();
}

function relativeDay(day) {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (day === dayKey()) return "hoje";
  if (day === dayKey(yesterday)) return "ontem";
  return formatHistoryDay(`${day}T12:00:00`);
}

function whenCopy(day) {
  const relative = relativeDay(day);
  return relative === "hoje" ? "" : relative === "ontem" ? " ontem" : ` em ${relative}`;
}

function hasLoad(value) {
  return value !== "" && value !== null && value !== undefined;
}

function formatLoad(value) {
  return hasLoad(value) ? Number(value).toLocaleString("pt-BR") : "–";
}

function formatHistoryDay(isoDate) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(new Date(isoDate)).replace(".", "");
}

function loadHistory(exerciseId) {
  return getHistory().filter((entry) => entry.loads?.[exerciseId]?.some(hasLoad));
}

// Cardios de um registro; registros antigos de cardio avulso guardavam um único cardio no próprio registro.
function entryCardio(entry) {
  if (entry.cardio) return entry.cardio;
  return entry.workoutId === "CARDIO" && entry.minutes ? [{ name: entry.workoutTitle, minutes: entry.minutes, distance: entry.distance, intensity: entry.intensity }] : [];
}

function cardioDetail(cardio) {
  return [`${cardio.minutes} min`, cardio.distance ? `${Number(cardio.distance).toLocaleString("pt-BR")} km` : "", cardio.intensity?.toLowerCase()].filter(Boolean).join(" · ");
}

function lastCardio(exerciseId) {
  for (const entry of getHistory()) {
    const cardio = entryCardio(entry).find((item) => item.id === exerciseId);
    if (cardio) return { ...cardio, date: entry.date };
  }
  return null;
}

// Séries e cargas da musculação, cardios feitos e grupos musculares trabalhados (com ao menos uma série).
function sessionSummary(workoutId) {
  const exercises = exercisesFor(workoutId);
  const saved = state.workouts?.[workoutId] ?? {};
  let done = 0;
  let total = 0;
  const loads = {};
  const cardio = [];
  const groups = [];
  exercises.forEach((exercise) => {
    const record = saved[exercise.id] ?? {};
    if (isCardio(exercise)) {
      if (record.done) cardio.push({ id: exercise.id, name: exercise.name, minutes: Number(record.minutes) || 0, distance: Number(record.distance) || 0, intensity: record.intensity || "Moderada" });
      return;
    }
    const doneSets = Array.from({ length: exercise.sets }, (_, i) => record[i]?.done).filter(Boolean).length;
    done += doneSets;
    total += exercise.sets;
    loads[exercise.id] = Array.from({ length: exercise.sets }, (_, i) => record[i]?.load ?? "");
    if (doneSets && !groups.includes(exercise.group)) groups.push(exercise.group);
  });
  return { done, total, loads, cardio, groups };
}

function clearSessionChecks(workoutId) {
  exercisesFor(workoutId).forEach((exercise) => {
    const saved = state.workouts?.[workoutId]?.[exercise.id];
    if (!saved) return;
    if (isCardio(exercise)) {
      saved.done = false;
      return;
    }
    for (let i = 0; i < exercise.sets; i += 1) {
      if (saved[i]) saved[i] = { ...saved[i], done: false };
    }
  });
}

// Séries marcadas em outro dia sem "Concluir treino" viram registro daquele dia, e o treino de hoje começa zerado.
function archiveStaleSession() {
  if (!state.activeDate || state.activeDate === dayKey()) return;
  const history = getHistory();
  Object.keys(state.workouts ?? {}).forEach((workoutId) => {
    if (!workouts[workoutId]) return;
    const summary = sessionSummary(workoutId);
    if (!summary.done && !summary.cardio.length) return;
    history.push({ id: `auto-${state.activeDate}-${workoutId}`, date: new Date(`${state.activeDate}T12:00:00`).toISOString(), day: state.activeDate, workoutId, workoutTitle: workouts[workoutId].title, ...summary, auto: true });
    clearSessionChecks(workoutId);
    delete state.sessionPlans?.[workoutId];
  });
  history.sort((a, b) => String(b.date).localeCompare(String(a.date)));
  delete state.activeDate;
  saveHistory(history);
  saveState();
}

function createCardioCard(exercise, index) {
  const article = document.createElement("article");
  article.className = "exercise-card cardio-card";
  const saved = exerciseState(exercise.id);
  const intensity = saved.intensity || "Moderada";
  const last = lastCardio(exercise.id);
  const lastCopy = last ? `<p class="last-load">Último: <b>${escapeHtml(cardioDetail(last))}</b> · ${formatHistoryDay(last.date)}</p>` : "";
  article.innerHTML = `
    <span class="exercise-number">${String(index + 1).padStart(2, "0")}</span>
    <div class="exercise-name">
      <h3>${escapeHtml(exercise.name)}</h3>
      <p>Cardio · ${escapeHtml(exercise.reps)}</p>
      ${lastCopy}
    </div>
    <div class="set-row">
      <label class="set-control" title="Marcar como feito">
        <input class="set-check cardio-check" type="checkbox" data-exercise="${exercise.id}" ${saved.done ? "checked" : ""} aria-label="Concluir ${escapeHtml(exercise.name)}" />
        <input class="load-input cardio-field" type="number" min="0" max="600" inputmode="numeric" value="${saved.minutes ?? ""}" placeholder="min" data-exercise="${exercise.id}" data-field="minutes" aria-label="Minutos de ${escapeHtml(exercise.name)}" />
        <span class="unit">min</span>
      </label>
      <label class="set-control">
        <input class="load-input cardio-field" type="number" min="0" max="200" step="0.1" inputmode="decimal" value="${saved.distance ?? ""}" placeholder="0" data-exercise="${exercise.id}" data-field="distance" aria-label="Distância de ${escapeHtml(exercise.name)}" />
        <span class="unit">km</span>
      </label>
      <label class="set-control cardio-intensity">
        <select class="cardio-field" data-exercise="${exercise.id}" data-field="intensity" aria-label="Intensidade de ${escapeHtml(exercise.name)}">
          ${["Leve", "Moderada", "Intensa", "Intervalado"].map((level) => `<option ${level === intensity ? "selected" : ""}>${level}</option>`).join("")}
        </select>
      </label>
    </div>
    <div class="exercise-actions">
      <button class="swap-button" type="button" data-swap="${exercise.id}">⇄ Trocar</button>
      <button class="skip-button" type="button" data-skip="${exercise.id}">− Tirar hoje</button>
    </div>
  `;
  return article;
}

function createExerciseCard(exercise, index) {
  if (isCardio(exercise)) return createCardioCard(exercise, index);
  const article = document.createElement("article");
  article.className = "exercise-card";

  const sets = Array.from({ length: exercise.sets }, (_, setIndex) => {
    const saved = exerciseState(exercise.id)[setIndex] ?? {};
    return `
      <label class="set-control" title="Série ${setIndex + 1}">
        <input
          class="set-check"
          type="checkbox"
          data-exercise="${exercise.id}"
          data-set="${setIndex}"
          ${saved.done ? "checked" : ""}
          aria-label="Concluir série ${setIndex + 1} de ${escapeHtml(exercise.name)}"
        />
        <input
          class="load-input"
          type="number"
          min="0"
          max="999"
          step="0.5"
          inputmode="decimal"
          value="${saved.load ?? ""}"
          placeholder="${setIndex + 1}ª"
          data-exercise="${exercise.id}"
          data-set="${setIndex}"
          aria-label="Carga da série ${setIndex + 1} de ${escapeHtml(exercise.name)} em quilos"
        />
        <span class="unit">kg</span>
      </label>
    `;
  }).join("");

  const last = loadHistory(exercise.id)[0];
  const lastCopy = last ? `<p class="last-load">Última: <b>${last.loads[exercise.id].map(formatLoad).join(" · ")} kg</b> · ${formatHistoryDay(last.date)}</p>` : "";
  const tip = exerciseNotes(exercise.id)[0];
  const tipCopy = tip ? `<p class="exercise-tip" title="${escapeHtml(tip.text)}">💡 ${escapeHtml(tip.text)}</p>` : "";

  article.innerHTML = `
    <span class="exercise-number">${String(index + 1).padStart(2, "0")}</span>
    <div class="exercise-name">
      <h3>${escapeHtml(exercise.name)}</h3>
      <p>${exercise.sets} séries · ${escapeHtml(exercise.reps)}</p>
      ${lastCopy}
      ${tipCopy}
    </div>
    <div class="set-row">${sets}</div>
    <div class="exercise-actions">
      <button class="movement-button" type="button" data-movement="${exercise.id}">▶ Ver movimento 3D</button>
      <button class="swap-button" type="button" data-swap="${exercise.id}">⇄ Trocar</button>
      <button class="skip-button" type="button" data-skip="${exercise.id}">− Tirar hoje</button>
    </div>
  `;
  return article;
}

function renderExercises() {
  const workout = currentWorkout();
  const fragment = document.createDocumentFragment();
  currentExercises().forEach((exercise, index) => fragment.appendChild(createExerciseCard(exercise, index)));
  list.replaceChildren(fragment);
  document.querySelector("#strength-panel").hidden = !workout;
  document.querySelector("#finish-panel").hidden = !workout;
  document.querySelector("#rest-panel").hidden = selectedWorkoutId !== "R";
  document.querySelector("#workout-title").textContent = !workout
    ? SESSION_MODES[selectedWorkoutId].toUpperCase()
    : selectedWorkoutId === "CARDIO" ? "CARDIO" : `TREINO ${selectedWorkoutId} — ${workout.title}`;
  const exercises = currentExercises();
  const cardioCount = exercises.filter(isCardio).length;
  const strengthCount = exercises.length - cardioCount;
  const parts = [
    strengthCount ? `${strengthCount} ${strengthCount === 1 ? "exercício" : "exercícios"} · ${totalSets()} séries` : "",
    cardioCount ? `${cardioCount} cardio` : "",
  ].filter(Boolean);
  document.querySelector("#workout-description").textContent = workout
    ? `${workout.focus}. ${parts.join(" + ")} · ${estimatedDuration(exercises)}.`
    : "Dia de recuperação do ciclo. Marque o descanso para o Zerão sugerir o próximo treino certo.";
  const suggested = suggestedWorkout();
  document.querySelectorAll("[data-workout]").forEach((button) => {
    const active = button.dataset.workout === selectedWorkoutId;
    button.classList.toggle("active", active);
    button.classList.toggle("suggested", button.dataset.workout === suggested);
    button.setAttribute("aria-pressed", String(active));
  });
  document.querySelector("#session-hint").innerHTML = `Próximo do ciclo: <b>${sessionLabel(suggested)}</b>. Pode escolher qualquer outro.`;
  if (typeof renderRestPanel === "function") renderRestPanel();
  const planStatus = document.querySelector("#plan-status");
  planStatus.hidden = !workout || !(state.sessionPlans?.[selectedWorkoutId] || state.plans?.[selectedWorkoutId]);
  planStatus.textContent = state.sessionPlans?.[selectedWorkoutId]
    ? "Esta sessão tem trocas que valem só até você concluir o treino."
    : "Ficha personalizada por você.";
  updateProgress();
  if (typeof updateDashboard === "function") updateDashboard();
}

function totalSets() {
  return currentExercises().reduce((total, exercise) => total + exercise.sets, 0);
}

function completedSets() {
  return currentExercises().reduce((total, exercise) => {
    const saved = exerciseState(exercise.id);
    return total + Array.from({ length: exercise.sets }, (_, i) => saved[i]?.done).filter(Boolean).length;
  }, 0);
}

// Progresso conta cada série e cada cardio como uma etapa.
function updateProgress() {
  const cardio = currentExercises().filter(isCardio);
  const cardioDone = cardio.filter((exercise) => exerciseState(exercise.id).done).length;
  const completed = completedSets() + cardioDone;
  const total = totalSets() + cardio.length;
  const percent = total ? Math.round((completed / total) * 100) : 0;
  const unit = !cardio.length ? "séries" : totalSets() ? "séries e cardios" : cardio.length === 1 ? "cardio" : "cardios";
  document.querySelector("#progress-count").innerHTML = `<b>${completed}</b> de <b>${total}</b> ${unit}`;
  document.querySelector("#progress-percent").textContent = `${percent}%`;
  document.querySelector("#progress-bar").style.width = `${percent}%`;
  document.querySelector("#progress-message").textContent =
    percent === 100 ? "Treino completo. Monstro!" : percent >= 70 ? "Tá quase. Mantém o foco." : percent > 0 ? "Boa. Continua assim." : "Começa no seu ritmo.";
}

function updateCardio(exerciseId, patch) {
  Object.assign(exerciseState(exerciseId), patch);
  if (patch.done) state.activeDate = dayKey();
  saveState();
  updateProgress();
  if (typeof updateDashboard === "function") updateDashboard();
}

function updateSet(exerciseId, setIndex, patch) {
  const saved = exerciseState(exerciseId);
  saved[setIndex] = { ...saved[setIndex], ...patch };
  if (patch.done) state.activeDate = dayKey();
  saveState();
  updateProgress();
}

function openMovement(exerciseId) {
  currentExercise = currentExercises().find((exercise) => exercise.id === exerciseId);
  if (!currentExercise) return;
  const index = currentExercises().indexOf(currentExercise) + 1;
  document.querySelector("#modal-index").textContent = String(index).padStart(2, "0");
  document.querySelector("#modal-title").textContent = currentExercise.name;
  document.querySelector("#modal-prescription").textContent = `${currentExercise.sets} séries · ${currentExercise.reps}`;
  document.querySelector("#modal-cue").textContent = currentExercise.cue || "Sem dica de execução cadastrada. Use as anotações abaixo para guardar as orientações que receber.";
  renderLoadHistory(currentExercise);
  renderNotes(currentExercise.id);
  document.querySelector("#youtube-link").href = `https://www.youtube.com/results?search_query=${encodeURIComponent(`Leandro Twin ${currentExercise.name} execução`)}`;
  document.querySelector("#play-icon").textContent = "Ⅱ";
  document.querySelector("#play-label").textContent = "Pausar animação";
  movementModal.showModal();
  document.body.style.overflow = "hidden";
  requestAnimationFrame(() => humanViewer.open(currentExercise.animation));
}

function renderLoadHistory(exercise) {
  const container = document.querySelector("#modal-loads");
  const sessions = loadHistory(exercise.id).slice(0, 6);
  container.hidden = !sessions.length;
  if (!sessions.length) return;
  const peaks = sessions.map((entry) => Math.max(...entry.loads[exercise.id].filter(hasLoad).map(Number)));
  const highest = Math.max(...peaks);
  container.innerHTML = `<span>Evolução de carga</span><ol>${sessions
    .map((entry, i) => `<li><small>${formatHistoryDay(entry.date)}</small><i><u style="width:${highest ? Math.round((peaks[i] / highest) * 100) : 0}%"></u></i><b>${formatLoad(peaks[i])} kg</b></li>`)
    .join("")}</ol>`;
}

function exerciseNotes(exerciseId) {
  return [...(state.exerciseNotes?.[exerciseId] ?? [])].sort((a, b) => String(b.date).localeCompare(String(a.date)));
}

function renderNotes(exerciseId) {
  const notes = exerciseNotes(exerciseId);
  document.querySelector("#notes-list").innerHTML = notes.length
    ? notes
        .map((note) => `<li><small>${formatHistoryDay(`${note.date}T12:00:00`)}${note.source ? ` · ${escapeHtml(note.source)}` : ""}</small><p>${escapeHtml(note.text)}</p><button type="button" data-remove-note="${escapeHtml(note.id)}" aria-label="Remover anotação">×</button></li>`)
        .join("")
    : '<li class="notes-empty">Nenhuma anotação ainda. Guarde aqui as dicas de professores, do fisioterapeuta ou do chat.</li>';
}

function closeMovement() {
  humanViewer.close();
  movementModal.close();
  document.body.style.overflow = "";
}

function showToast(message) {
  const toast = document.querySelector("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2800);
}

function finishWorkout() {
  const summary = sessionSummary(selectedWorkoutId);
  const { done, total, cardio } = summary;
  if (!done && !cardio.length) {
    showToast("Marque pelo menos uma série ou um cardio antes de concluir.");
    return;
  }
  const day = sessionDay();
  addHistoryEntry({ date: sessionTimestamp(), day, workoutId: selectedWorkoutId, workoutTitle: currentWorkout().title, ...summary });

  clearSessionChecks(selectedWorkoutId);
  delete state.sessionPlans?.[selectedWorkoutId];
  if (!Object.keys(workouts).some((workoutId) => sessionSummary(workoutId).done || sessionSummary(workoutId).cardio.length)) delete state.activeDate;
  saveState();
  resetSessionDate();
  renderExercises();
  const when = whenCopy(day);
  const cardioCopy = cardio.length ? ` + ${cardio.reduce((sum, item) => sum + item.minutes, 0)} min de cardio` : "";
  showToast(!total ? `Cardio registrado${when}${cardioCopy}.` : done === total ? `Treino completo registrado${when}${cardioCopy}. Aí sim!` : `Treino registrado${when} com ${done} de ${total} séries${cardioCopy}.`);
}

// Título do dia no histórico: "Treino D + Cardio", juntando todos os registros daquela data.
function historyDayTitle(entries) {
  const parts = entries.filter((entry) => entry.workoutId !== "CARDIO").map((entry) => (entry.workoutId ? `Treino ${entry.workoutId}` : "Treino de pernas"));
  if (entries.some((entry) => entryCardio(entry).length)) parts.push("Cardio");
  return parts.join(" + ");
}

function entryGroups(entry) {
  return entry.groups ?? [...new Set(Object.keys(entry.loads ?? {}).map((id) => exerciseInfo(id)?.group).filter(Boolean))];
}

function renderHistory() {
  const history = getHistory();
  const container = document.querySelector("#history-list");
  if (history.length === 0) {
    container.innerHTML = `<div class="history-empty"><strong>Ainda sem registros.</strong>Conclua seu primeiro treino para começar.</div>`;
    return;
  }

  const days = new Map();
  history.forEach((entry) => {
    const day = entryDay(entry);
    if (!days.has(day)) days.set(day, []);
    days.get(day).push(entry);
  });

  container.innerHTML = [...days.entries()]
    .map(([day, newestFirst]) => {
      const entries = [...newestFirst].reverse();
      const latest = newestFirst[0];
      const cardio = entries.flatMap(entryCardio);
      const groups = [...new Set(entries.flatMap(entryGroups))];
      const done = entries.reduce((sum, entry) => sum + (entry.workoutId === "CARDIO" ? 0 : entry.done || 0), 0);
      const total = entries.reduce((sum, entry) => sum + (entry.workoutId === "CARDIO" ? 0 : entry.total || 0), 0);
      const cardioMinutes = cardio.reduce((sum, item) => sum + Number(item.minutes || 0), 0);
      const when = latest.auto
        ? "registrado automaticamente"
        : latest.retro ? "registrado depois" : new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(new Date(latest.date));
      const details = [...groups, ...cardio.map((item) => `${item.name} ${item.minutes} min`)].map(escapeHtml).join(" · ");
      const summary = [total ? `${done} de ${total} séries` : "", cardioMinutes ? `${cardioMinutes} min de cardio` : "", when].filter(Boolean).join(" · ");
      const score = total ? `${Math.round((done / total) * 100)}%` : `${cardioMinutes}′`;
      return `
        <article class="history-entry">
          <div class="history-date">${formatHistoryDay(`${day}T12:00:00`).toUpperCase().replace(" ", "<br>")}</div>
          <div><strong>${escapeHtml(historyDayTitle(entries))}</strong>${details ? `<p class="history-groups">${details}</p>` : ""}<p>${summary}</p></div>
          <span class="history-score">${score}</span>
          <button class="history-remove" type="button" data-remove-day="${day}" aria-label="Remover registros do dia">×</button>
        </article>
      `;
    })
    .join("");
}

list.addEventListener("change", (event) => {
  const target = event.target;
  if (target.matches(".cardio-check")) {
    updateCardio(target.dataset.exercise, { done: target.checked });
    return;
  }
  if (target.matches(".cardio-field")) {
    updateCardio(target.dataset.exercise, { [target.dataset.field]: target.value });
    return;
  }
  if (target.matches(".set-check")) {
    updateSet(target.dataset.exercise, target.dataset.set, { done: target.checked });
  }
  if (target.matches(".load-input")) {
    updateSet(target.dataset.exercise, target.dataset.set, { load: target.value });
  }
});

list.addEventListener("input", (event) => {
  const target = event.target;
  if (target.matches(".cardio-field")) {
    updateCardio(target.dataset.exercise, { [target.dataset.field]: target.value });
    return;
  }
  if (target.matches(".load-input")) {
    updateSet(target.dataset.exercise, target.dataset.set, { load: target.value });
  }
});

list.addEventListener("click", (event) => {
  const button = event.target.closest("[data-movement]");
  if (button) openMovement(button.dataset.movement);
  const swap = event.target.closest("[data-swap]");
  if (swap) openPicker(swap.dataset.swap);
  const skip = event.target.closest("[data-skip]");
  if (skip) skipExercise(skip.dataset.skip);
});

// Tirar hoje: sai só desta sessão (dia com menos tempo); para tirar da ficha, use "Trocar".
function skipExercise(exerciseId) {
  if (planFor(selectedWorkoutId).length <= 1) {
    showToast("O treino precisa de pelo menos um exercício.");
    return;
  }
  const name = exerciseInfo(exerciseId).name;
  applyPlanChange({ type: "remove", from: exerciseId }, "session");
  showToast(`${name} fora só desta sessão. Volta no próximo treino.`);
}

document.querySelector("#workout-selector").addEventListener("click", (event) => {
  const button = event.target.closest("[data-workout]");
  if (!button || !isSelectable(button.dataset.workout)) return;
  selectedWorkoutId = button.dataset.workout;
  state.selectedDay = dayKey();
  saveState();
  renderExercises();
});

document.querySelector("#history-list").addEventListener("click", (event) => {
  const button = event.target.closest("[data-remove-day]");
  const day = button?.dataset.removeDay;
  if (!day || !window.confirm(`Remover os registros de ${relativeDay(day)} do histórico?`)) return;
  saveHistory(getHistory().filter((entry) => entryDay(entry) !== day));
  renderHistory();
  renderExercises();
  showToast("Registro removido.");
});

document.querySelector("#close-movement").addEventListener("click", closeMovement);
document.querySelector("#toggle-animation").addEventListener("click", () => {
  const playing = humanViewer.toggle();
  document.querySelector("#play-icon").textContent = playing ? "Ⅱ" : "▶";
  document.querySelector("#play-label").textContent = playing ? "Pausar animação" : "Reproduzir animação";
});
document.querySelector("#finish-workout").addEventListener("click", finishWorkout);

document.querySelector("#open-history").addEventListener("click", () => {
  renderHistory();
  historyModal.showModal();
  document.body.style.overflow = "hidden";
});

document.querySelector("#close-history").addEventListener("click", () => {
  historyModal.close();
  document.body.style.overflow = "";
});

document.querySelector("#clear-history").addEventListener("click", () => {
  if (!getHistory().length) return;
  if (window.confirm("Apagar todo o histórico de treinos deste navegador?")) {
    saveHistory([]);
    renderHistory();
    renderExercises();
    showToast("Histórico apagado.");
  }
});

// --- Ficha editável: trocar, adicionar e remover exercícios ---

function normalizeText(value) {
  return String(value).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

function pickerScope() {
  return document.querySelector('input[name="picker-scope"]:checked').value;
}

function editPlan(plan, change) {
  const slots = plan.map((slot) => ({ ...slot }));
  if (change.type === "remove") return slots.filter((slot) => slot.id !== change.from);
  if (change.type === "add") return [...slots, { id: change.to, sets: 4 }];
  const index = slots.findIndex((slot) => slot.id === change.from);
  if (index >= 0) slots[index] = { id: change.to, sets: slots[index].sets };
  return slots;
}

// "session" vale até concluir o treino; "plan" muda a ficha e acompanha a sessão em andamento.
function applyPlanChange(change, scope) {
  const workoutId = selectedWorkoutId;
  if (scope === "plan") {
    state.plans ??= {};
    state.plans[workoutId] = editPlan(state.plans[workoutId] ?? workouts[workoutId].exercises, change);
    if (state.sessionPlans?.[workoutId]) state.sessionPlans[workoutId] = editPlan(state.sessionPlans[workoutId], change);
  } else {
    state.sessionPlans ??= {};
    state.sessionPlans[workoutId] = editPlan(planFor(workoutId), change);
  }
  saveState();
  renderExercises();
}

function renderPickerList() {
  const query = normalizeText(document.querySelector("#picker-search").value.trim());
  const group = document.querySelector("#picker-group").value;
  const inWorkout = new Set(planFor(selectedWorkoutId).map((slot) => slot.id));
  const items = Object.entries(allExercises())
    .filter(([, exercise]) => (!group || exercise.group === group) && (!query || normalizeText([exercise.name, ...(exercise.aliases ?? [])].join(" ")).includes(query)))
    .sort(([, a], [, b]) => EXERCISE_GROUPS.indexOf(a.group) - EXERCISE_GROUPS.indexOf(b.group) || a.name.localeCompare(b.name, "pt-BR"));
  document.querySelector("#picker-list").innerHTML = items.length
    ? items
        .map(([id, exercise]) => {
          const here = inWorkout.has(id);
          const aka = exercise.aliases?.length ? `também: ${exercise.aliases.slice(0, 2).join(", ")}` : "";
          const meta = [exercise.group, exercise.reps, aka, exercise.custom ? "criado por você" : "", here ? "já está no treino" : ""].filter(Boolean).map(escapeHtml).join(" · ");
          return `<button type="button" data-pick="${escapeHtml(id)}" ${here ? "disabled" : ""}><b>${escapeHtml(exercise.name)}</b><small>${meta}</small></button>`;
        })
        .join("")
    : '<p class="picker-empty">Nada encontrado. Crie o exercício logo abaixo.</p>';
}

function openPicker(targetId) {
  pickerTarget = targetId;
  const target = targetId ? exerciseInfo(targetId) : null;
  document.querySelector("#picker-kicker").textContent = sessionLabel(selectedWorkoutId);
  document.querySelector("#picker-title").textContent = target ? "TROCAR EXERCÍCIO" : "ADICIONAR EXERCÍCIO";
  document.querySelector("#picker-current").innerHTML = target
    ? `No lugar de <b>${escapeHtml(target.name)}</b>. As cargas de cada exercício ficam guardadas separadas.`
    : "Escolha um exercício para incluir neste treino.";
  document.querySelector("#picker-search").value = "";
  document.querySelector("#picker-group").value = target?.group ?? "";
  document.querySelector("#new-exercise-group").value = target?.group ?? EXERCISE_GROUPS[0];
  document.querySelector('input[name="picker-scope"][value="session"]').checked = true;
  document.querySelector("#picker-create").open = false;
  document.querySelector("#picker-remove").hidden = !target;
  const reset = document.querySelector("#picker-reset");
  reset.hidden = !state.plans?.[selectedWorkoutId] && !state.sessionPlans?.[selectedWorkoutId];
  reset.textContent = `Restaurar a ficha padrão do Treino ${selectedWorkoutId}`;
  renderPickerList();
  pickerModal.showModal();
  document.body.style.overflow = "hidden";
}

function closePicker() {
  pickerModal.close();
  document.body.style.overflow = "";
}

function pickExercise(exerciseId) {
  const scope = pickerScope();
  applyPlanChange(pickerTarget ? { type: "replace", from: pickerTarget, to: exerciseId } : { type: "add", to: exerciseId }, scope);
  closePicker();
  const name = exerciseInfo(exerciseId).name;
  showToast(`${name} ${pickerTarget ? "entrou no lugar" : "adicionado"} ${scope === "plan" ? "na ficha" : "só nesta sessão"}.`);
}

document.querySelector("#picker-group").innerHTML = `<option value="">Todos os grupos</option>${EXERCISE_GROUPS.map((group) => `<option>${group}</option>`).join("")}`;
document.querySelector("#new-exercise-group").innerHTML = EXERCISE_GROUPS.map((group) => `<option>${group}</option>`).join("");
document.querySelector("#picker-search").addEventListener("input", renderPickerList);
document.querySelector("#picker-group").addEventListener("change", renderPickerList);
document.querySelector("#close-picker").addEventListener("click", closePicker);
document.querySelector("#add-exercise").addEventListener("click", () => openPicker(null));

document.querySelector("#picker-list").addEventListener("click", (event) => {
  const button = event.target.closest("[data-pick]");
  if (button) pickExercise(button.dataset.pick);
});

document.querySelector("#picker-create-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const name = document.querySelector("#new-exercise-name").value.trim();
  if (!name) return;
  const group = document.querySelector("#new-exercise-group").value;
  const slug = normalizeText(name).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);
  const id = `c-${slug}-${Date.now().toString(36)}`;
  state.customExercises ??= {};
  state.customExercises[id] = {
    name,
    group,
    animation: GROUP_ANIMATIONS[group],
    ...(group === "Cardio" && { kind: "cardio" }),
    reps: document.querySelector("#new-exercise-reps").value.trim() || (group === "Cardio" ? "duração livre" : "10–12 repetições"),
    cue: document.querySelector("#new-exercise-cue").value.trim(),
    custom: true,
  };
  event.currentTarget.reset();
  pickExercise(id);
});

document.querySelector("#picker-remove").addEventListener("click", () => {
  if (planFor(selectedWorkoutId).length <= 1) {
    showToast("O treino precisa de pelo menos um exercício.");
    return;
  }
  const scope = pickerScope();
  const name = exerciseInfo(pickerTarget).name;
  applyPlanChange({ type: "remove", from: pickerTarget }, scope);
  closePicker();
  showToast(`${name} removido ${scope === "plan" ? "da ficha" : "só desta sessão"}.`);
});

document.querySelector("#picker-reset").addEventListener("click", () => {
  if (!window.confirm(`Voltar o Treino ${selectedWorkoutId} para a ficha padrão? As cargas registradas continuam no histórico.`)) return;
  delete state.plans?.[selectedWorkoutId];
  delete state.sessionPlans?.[selectedWorkoutId];
  saveState();
  renderExercises();
  closePicker();
  showToast("Ficha padrão restaurada.");
});

document.querySelector("#note-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const text = document.querySelector("#note-text").value.trim();
  if (!text || !currentExercise) return;
  state.exerciseNotes ??= {};
  state.exerciseNotes[currentExercise.id] ??= [];
  state.exerciseNotes[currentExercise.id].push({
    id: window.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    date: dayKey(),
    text,
    source: document.querySelector("#note-source").value.trim(),
  });
  saveState();
  event.currentTarget.reset();
  renderNotes(currentExercise.id);
  renderExercises();
  showToast("Anotação salva neste exercício.");
});

document.querySelector("#notes-list").addEventListener("click", (event) => {
  const button = event.target.closest("[data-remove-note]");
  if (!button || !currentExercise || !window.confirm("Remover esta anotação?")) return;
  state.exerciseNotes[currentExercise.id] = state.exerciseNotes[currentExercise.id].filter((note) => note.id !== button.dataset.removeNote);
  saveState();
  renderNotes(currentExercise.id);
  renderExercises();
});

[movementModal, historyModal, pickerModal].forEach((modal) => {
  modal.addEventListener("click", (event) => {
    if (event.target !== modal) return;
    if (modal === movementModal) closeMovement();
    else {
      modal.close();
      document.body.style.overflow = "";
    }
  });
  modal.addEventListener("cancel", (event) => {
    event.preventDefault();
    if (modal === movementModal) closeMovement();
    else {
      modal.close();
      document.body.style.overflow = "";
    }
  });
});

const humanViewer = (() => {
  let renderer;
  let scene;
  let camera;
  let root;
  let body;
  let raf;
  let clock;
  let animationType = "squat";
  let playing = true;
  let dragging = false;
  let lastX = 0;
  let rotationY = -0.25;

  const limbs = {};

  function buildLimb(parent, name, length, radius, material, direction = -1) {
    const pivot = new THREE.Group();
    pivot.name = `${name}Pivot`;
    parent.add(pivot);
    const mesh = new THREE.Mesh(new THREE.CapsuleGeometry(radius, Math.max(0.02, length - radius * 2), 8, 14), material);
    mesh.position.y = (length / 2) * direction;
    if (direction === 1) mesh.rotation.z = Math.PI;
    mesh.castShadow = true;
    pivot.add(mesh);
    limbs[name] = pivot;
    return { pivot, end: mesh.position.y * 2 };
  }

  function createHuman() {
    const skin = new THREE.MeshStandardMaterial({ color: 0xd7a47e, roughness: 0.7 });
    const shirt = new THREE.MeshStandardMaterial({ color: 0xf6c900, roughness: 0.52 });
    const shorts = new THREE.MeshStandardMaterial({ color: 0x171a21, roughness: 0.78 });
    const shoe = new THREE.MeshStandardMaterial({ color: 0xeeeeea, roughness: 0.68 });

    body = new THREE.Group();
    body.position.y = 0;
    root.add(body);

    const pelvis = new THREE.Mesh(new THREE.CapsuleGeometry(0.28, 0.28, 8, 16), shorts);
    pelvis.scale.set(1.08, 0.75, 0.78);
    pelvis.position.y = 1.68;
    pelvis.castShadow = true;
    body.add(pelvis);
    limbs.pelvis = pelvis;

    const torsoPivot = new THREE.Group();
    torsoPivot.position.y = 1.82;
    body.add(torsoPivot);
    limbs.torso = torsoPivot;
    const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.34, 0.63, 10, 18), shirt);
    torso.position.y = 0.39;
    torso.scale.set(1.03, 1, 0.67);
    torso.castShadow = true;
    torsoPivot.add(torso);

    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.12, 0.19, 16), skin);
    neck.position.y = 0.88;
    torsoPivot.add(neck);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.25, 24, 18), skin);
    head.position.y = 1.12;
    head.scale.set(0.86, 1.08, 0.9);
    head.castShadow = true;
    torsoPivot.add(head);

    [-1, 1].forEach((side) => {
      const prefix = side < 0 ? "left" : "right";
      const shoulder = new THREE.Group();
      shoulder.position.set(side * 0.43, 0.64, 0);
      torsoPivot.add(shoulder);
      limbs[`${prefix}Shoulder`] = shoulder;
      const upper = new THREE.Mesh(new THREE.CapsuleGeometry(0.105, 0.38, 8, 12), skin);
      upper.position.y = -0.29;
      upper.castShadow = true;
      shoulder.add(upper);
      const elbow = new THREE.Group();
      elbow.position.y = -0.58;
      shoulder.add(elbow);
      limbs[`${prefix}Elbow`] = elbow;
      const lower = new THREE.Mesh(new THREE.CapsuleGeometry(0.085, 0.36, 8, 12), skin);
      lower.position.y = -0.27;
      lower.castShadow = true;
      elbow.add(lower);
      const hand = new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 12), skin);
      hand.position.y = -0.54;
      hand.scale.set(0.78, 1.05, 0.7);
      elbow.add(hand);

      const hip = new THREE.Group();
      hip.position.set(side * 0.2, 1.61, 0);
      body.add(hip);
      limbs[`${prefix}Hip`] = hip;
      const thigh = new THREE.Mesh(new THREE.CapsuleGeometry(0.16, 0.63, 9, 14), shorts);
      thigh.position.y = -0.42;
      thigh.castShadow = true;
      hip.add(thigh);
      const knee = new THREE.Group();
      knee.position.y = -0.84;
      hip.add(knee);
      limbs[`${prefix}Knee`] = knee;
      const lowerLeg = new THREE.Mesh(new THREE.CapsuleGeometry(0.125, 0.62, 9, 14), skin);
      lowerLeg.position.y = -0.41;
      lowerLeg.castShadow = true;
      knee.add(lowerLeg);
      const ankle = new THREE.Group();
      ankle.position.y = -0.82;
      knee.add(ankle);
      limbs[`${prefix}Ankle`] = ankle;
      const foot = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.3, 8, 14), shoe);
      foot.rotation.x = Math.PI / 2;
      foot.position.set(0, -0.04, 0.16);
      foot.scale.set(1, 1, 0.75);
      foot.castShadow = true;
      ankle.add(foot);
    });

    addEquipment();
  }

  function addEquipment() {
    const dark = new THREE.MeshStandardMaterial({ color: 0x30343c, roughness: 0.6, metalness: 0.42 });
    const weight = new THREE.MeshStandardMaterial({ color: 0x0e1015, roughness: 0.62, metalness: 0.48 });
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.35, 14), dark);
    bar.rotation.z = Math.PI / 2;
    bar.position.set(0, 2.58, -0.13);
    bar.name = "barbell";
    body.add(bar);
    [-0.72, 0.72].forEach((x) => {
      const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.08, 20), weight);
      plate.rotation.z = Math.PI / 2;
      plate.position.set(x, 2.58, -0.13);
      plate.name = "barbell";
      body.add(plate);
    });
  }

  function init() {
    if (!window.THREE) throw new Error("Three.js unavailable");
    const container = document.querySelector("#three-viewer");
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(34, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(4.4, 2.8, 6.6);
    camera.lookAt(0, 1.55, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xfff4cc, 0x20232b, 2.1));
    const key = new THREE.DirectionalLight(0xffdf62, 4.2);
    key.position.set(3.5, 6, 4);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x6c8cff, 2.2);
    rim.position.set(-4, 3, -4);
    scene.add(rim);

    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(3.2, 64),
      new THREE.MeshStandardMaterial({ color: 0x0e1015, roughness: 0.91, metalness: 0.05, transparent: true, opacity: 0.96 }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    const ring = new THREE.Mesh(
      new THREE.RingGeometry(1.35, 1.38, 72),
      new THREE.MeshBasicMaterial({ color: 0xf6c900, transparent: true, opacity: 0.48, side: THREE.DoubleSide }),
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.012;
    scene.add(ring);

    root = new THREE.Group();
    root.rotation.y = rotationY;
    scene.add(root);
    createHuman();
    clock = new THREE.Clock();

    container.addEventListener("pointerdown", (event) => {
      dragging = true;
      lastX = event.clientX;
      container.setPointerCapture(event.pointerId);
    });
    container.addEventListener("pointermove", (event) => {
      if (!dragging) return;
      rotationY += (event.clientX - lastX) * 0.012;
      lastX = event.clientX;
    });
    container.addEventListener("pointerup", () => { dragging = false; });
    container.addEventListener("pointercancel", () => { dragging = false; });
    window.addEventListener("resize", resize);
  }

  function resize() {
    if (!renderer) return;
    const container = document.querySelector("#three-viewer");
    if (!container.clientWidth || !container.clientHeight) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  }

  function resetPose() {
    if (!body) return;
    body.position.set(0, 0, 0);
    body.rotation.set(0, 0, 0);
    Object.values(limbs).forEach((part) => part.rotation.set(0, 0, 0));
    limbs.leftShoulder.position.y = 0.64;
    limbs.rightShoulder.position.y = 0.64;
    limbs.leftShoulder.rotation.z = -0.1;
    limbs.rightShoulder.rotation.z = 0.1;
    body.traverse((object) => {
      if (object.name === "barbell") object.visible = animationType === "squat";
    });
  }

  function phase(t) {
    return (1 - Math.cos(t * Math.PI * 2 * 0.42)) / 2;
  }

  function animatePose(t) {
    const p = phase(t);
    resetPose();
    const hipAngle = (angle) => {
      limbs.leftHip.rotation.x = angle;
      limbs.rightHip.rotation.x = angle;
    };
    const kneeAngle = (angle) => {
      limbs.leftKnee.rotation.x = angle;
      limbs.rightKnee.rotation.x = angle;
    };

    switch (animationType) {
      case "squat":
        body.position.y = -0.53 * p;
        hipAngle(-0.75 * p);
        kneeAngle(1.4 * p);
        limbs.torso.rotation.x = -0.16 * p;
        limbs.leftShoulder.rotation.x = -0.65;
        limbs.rightShoulder.rotation.x = -0.65;
        limbs.leftElbow.rotation.x = -1.4;
        limbs.rightElbow.rotation.x = -1.4;
        break;
      case "legPress":
        body.rotation.x = -1.0;
        body.position.set(0, 0.92, -0.25);
        hipAngle(-0.2 - 0.85 * p);
        kneeAngle(0.18 + 1.25 * p);
        break;
      case "legExtension":
        body.position.y = 0.55;
        hipAngle(-1.15);
        kneeAngle(1.38 * (1 - p));
        limbs.torso.rotation.x = -0.08;
        break;
      case "legCurl":
        body.rotation.x = -Math.PI / 2;
        body.position.set(0, 1.85, -0.35);
        hipAngle(0.05);
        kneeAngle(1.75 * p);
        limbs.leftShoulder.rotation.x = -1.25;
        limbs.rightShoulder.rotation.x = -1.25;
        break;
      case "hinge":
        hipAngle(-0.08 * p);
        limbs.torso.rotation.x = 1.1 * p;
        body.position.y = -0.12 * p;
        limbs.leftShoulder.rotation.x = -0.18;
        limbs.rightShoulder.rotation.x = -0.18;
        break;
      case "hipThrust":
        body.rotation.x = -Math.PI / 2;
        body.position.set(0, 1.22 + 0.44 * p, 0.1);
        hipAngle(-1.2 + 0.62 * p);
        kneeAngle(1.22);
        limbs.torso.rotation.x = 0.15;
        break;
      case "calfRaise":
        body.position.y = 0.17 * p;
        limbs.leftAnkle.rotation.x = -0.28 * p;
        limbs.rightAnkle.rotation.x = -0.28 * p;
        break;
      case "lunge":
        body.position.y = -0.42 * p;
        limbs.leftHip.rotation.x = -0.48 * p;
        limbs.leftKnee.rotation.x = 1.18 * p;
        limbs.rightHip.rotation.x = 0.52 + 0.42 * p;
        limbs.rightKnee.rotation.x = 1.25 + 0.3 * p;
        limbs.torso.rotation.x = -0.08 * p;
        break;
      case "chestPress":
        body.rotation.x = -Math.PI / 2;
        body.position.set(0, 1.4, 0);
        limbs.leftShoulder.rotation.z = -1.15;
        limbs.rightShoulder.rotation.z = 1.15;
        limbs.leftShoulder.rotation.x = -0.45 + 0.75 * p;
        limbs.rightShoulder.rotation.x = -0.45 + 0.75 * p;
        limbs.leftElbow.rotation.x = -1.4 * (1 - p);
        limbs.rightElbow.rotation.x = -1.4 * (1 - p);
        break;
      case "chestFly":
        limbs.leftShoulder.rotation.z = -0.2 - 1.2 * p;
        limbs.rightShoulder.rotation.z = 0.2 + 1.2 * p;
        limbs.leftElbow.rotation.x = -0.25;
        limbs.rightElbow.rotation.x = -0.25;
        break;
      case "lateralRaise":
      case "reverseFly":
        limbs.leftShoulder.rotation.z = -0.12 - 1.42 * p;
        limbs.rightShoulder.rotation.z = 0.12 + 1.42 * p;
        limbs.torso.rotation.x = animationType === "reverseFly" ? 0.55 : 0;
        break;
      case "abduction":
        limbs.leftHip.rotation.z = -0.42 * p;
        limbs.rightHip.rotation.z = 0.42 * p;
        break;
      case "adduction":
        limbs.leftHip.rotation.z = -0.42 * (1 - p);
        limbs.rightHip.rotation.z = 0.42 * (1 - p);
        break;
      case "latPulldown":
        limbs.leftShoulder.rotation.z = -1.7 + 0.82 * p;
        limbs.rightShoulder.rotation.z = 1.7 - 0.82 * p;
        limbs.leftElbow.rotation.x = -1.25 * p;
        limbs.rightElbow.rotation.x = -1.25 * p;
        limbs.torso.rotation.x = -0.08 * p;
        break;
      case "row":
        limbs.torso.rotation.x = 0.42;
        limbs.leftShoulder.rotation.x = -1.05 + 0.82 * p;
        limbs.rightShoulder.rotation.x = -1.05 + 0.82 * p;
        limbs.leftElbow.rotation.x = -1.35 * p;
        limbs.rightElbow.rotation.x = -1.35 * p;
        break;
      case "shrug":
        body.position.y = 0.08 * p;
        limbs.leftShoulder.position.y = 0.64 + 0.16 * p;
        limbs.rightShoulder.position.y = 0.64 + 0.16 * p;
        break;
      case "crunch":
        body.position.y = 0.45;
        hipAngle(-1.1);
        kneeAngle(1.15);
        limbs.torso.rotation.x = 0.1 + 0.72 * p;
        limbs.leftShoulder.rotation.x = -0.7;
        limbs.rightShoulder.rotation.x = -0.7;
        break;
      case "birdDog":
        body.rotation.x = -Math.PI / 2;
        body.position.set(0, 1.2, 0);
        limbs.leftShoulder.rotation.x = -1.4 * p;
        limbs.rightHip.rotation.x = 1.15 * p;
        limbs.rightKnee.rotation.x = 0.18 * (1 - p);
        break;
      case "curl":
      case "hammerCurl":
      case "reverseCurl":
        limbs.leftElbow.rotation.x = -1.75 * p;
        limbs.rightElbow.rotation.x = -1.75 * p;
        limbs.leftShoulder.rotation.z = -0.1;
        limbs.rightShoulder.rotation.z = 0.1;
        break;
      case "tricepsPushdown":
        limbs.leftShoulder.rotation.x = -0.15;
        limbs.rightShoulder.rotation.x = -0.15;
        limbs.leftElbow.rotation.x = -1.45 * (1 - p);
        limbs.rightElbow.rotation.x = -1.45 * (1 - p);
        break;
      case "tricepsExtension":
        limbs.leftShoulder.rotation.x = -2.7;
        limbs.rightShoulder.rotation.x = -2.7;
        limbs.leftElbow.rotation.x = -1.5 * (1 - p);
        limbs.rightElbow.rotation.x = -1.5 * (1 - p);
        break;
    }
  }

  function loop() {
    const t = clock.getElapsedTime();
    if (playing) animatePose(t);
    if (!dragging) rotationY += 0.0016;
    root.rotation.y = rotationY;
    renderer.render(scene, camera);
    raf = requestAnimationFrame(loop);
  }

  function open(type) {
    document.querySelector("#viewer-fallback").hidden = true;
    try {
      if (!renderer) init();
      animationType = type;
      playing = true;
      resetPose();
      resize();
      if (!raf) {
        clock.start();
        loop();
      }
    } catch (error) {
      console.error(error);
      document.querySelector("#viewer-fallback").hidden = false;
    }
  }

  function close() {
    if (raf) cancelAnimationFrame(raf);
    raf = null;
  }

  function toggle() {
    playing = !playing;
    return playing;
  }

  return { open, close, toggle };
})();

resetSessionDate();
archiveStaleSession();
// Num dia novo, sem treino em andamento, já abre no próximo do ciclo.
if (state.selectedDay !== dayKey() && !Object.keys(workouts).some((workoutId) => sessionSummary(workoutId).done)) {
  selectedWorkoutId = suggestedWorkout();
}
renderExercises();
