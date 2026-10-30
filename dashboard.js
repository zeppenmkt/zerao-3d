// Painéis do Zerão: resumo do treino (página Treino) e metas e progresso do dia (Visão geral).
// Só lê o que app.js e portal.js já carregaram; não guarda dados próprios.

const WEEKS_SHOWN = 8;
const SLEEP_TARGET = 7;
const SVG_NS = "http://www.w3.org/2000/svg";

function dayFromKey(key) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function addDays(date, days) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

// Semanas começam na segunda-feira.
function weekStart(date) {
  const day = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return addDays(day, -((day.getDay() + 6) % 7));
}

function shortDate(date) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(date).replace(".", "");
}

function formatNumber(value, digits = 0) {
  return Number(value).toLocaleString("pt-BR", { maximumFractionDigits: digits });
}

function svgElement(name, attributes = {}) {
  const element = document.createElementNS(SVG_NS, name);
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
  return element;
}

function historyDays() {
  const days = new Map();
  getHistory().forEach((entry) => {
    const day = entryDay(entry);
    if (!days.has(day)) days.set(day, []);
    days.get(day).push(entry);
  });
  return days;
}

function daySummary(entries) {
  const strength = entries.filter((entry) => entry.workoutId !== "CARDIO");
  return {
    title: historyDayTitle([...entries].reverse()),
    groups: [...new Set(entries.flatMap(entryGroups))],
    cardio: entries.flatMap(entryCardio),
    done: strength.reduce((sum, entry) => sum + (entry.done || 0), 0),
    total: strength.reduce((sum, entry) => sum + (entry.total || 0), 0),
  };
}

function weeklyTraining() {
  const current = weekStart(new Date());
  const weeks = Array.from({ length: WEEKS_SHOWN }, (_, index) => ({ start: addDays(current, -7 * (WEEKS_SHOWN - 1 - index)), days: new Set(), sets: 0, cardio: 0 }));
  getHistory().forEach((entry) => {
    const day = dayFromKey(entryDay(entry));
    const week = weeks.find((item) => day >= item.start && day < addDays(item.start, 7));
    if (!week) return;
    week.days.add(entryDay(entry));
    if (entry.workoutId !== "CARDIO") week.sets += entry.done || 0;
    week.cardio += entryCardio(entry).reduce((sum, item) => sum + Number(item.minutes || 0), 0);
  });
  return weeks.map((week) => ({
    label: shortDate(week.start),
    range: `${shortDate(week.start)} a ${shortDate(addDays(week.start, 6))}`,
    days: week.days.size,
    sets: week.sets,
    cardio: week.cardio,
  }));
}

function trainedDaysBetween(fromDaysAgo, toDaysAgo) {
  const today = dayFromKey(dayKey());
  const from = addDays(today, -fromDaysAgo);
  const to = addDays(today, -toDaysAgo);
  return [...historyDays().keys()].filter((day) => dayFromKey(day) > from && dayFromKey(day) <= to).length;
}

// --- Gráficos: colunas com tooltip por coluna e minilinha de tendência ---

const chartTip = Object.assign(document.createElement("div"), { className: "chart-tip", hidden: true });
document.body.append(chartTip);

function showTip(target, value, label) {
  chartTip.replaceChildren(Object.assign(document.createElement("b"), { textContent: value }), Object.assign(document.createElement("span"), { textContent: label }));
  chartTip.hidden = false;
  const box = target.getBoundingClientRect();
  const left = Math.min(window.innerWidth - chartTip.offsetWidth - 8, Math.max(8, box.left + box.width / 2 - chartTip.offsetWidth / 2));
  chartTip.style.left = `${left}px`;
  chartTip.style.top = `${Math.max(8, box.top - chartTip.offsetHeight - 8)}px`;
}

function hideTip() {
  chartTip.hidden = true;
}

// Topo do eixo em número redondo (5, 10, 20, 25, 50, 100…).
function niceCeil(value) {
  if (value <= 5) return Math.ceil(value);
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 2.5, 5, 10].find((factor) => factor * magnitude >= value);
  return step * magnitude;
}

function columnChart({ title, unit, data, key }) {
  const figure = document.createElement("figure");
  figure.className = "mini-chart";
  const caption = document.createElement("figcaption");
  const current = data.at(-1)[key];
  caption.append(Object.assign(document.createElement("span"), { textContent: title }), Object.assign(document.createElement("b"), { textContent: `esta semana: ${formatNumber(current)} ${unit}` }));
  figure.append(caption);

  const width = 320;
  const height = 132;
  const plot = { left: 26, right: 6, top: 14, bottom: 20 };
  const max = niceCeil(Math.max(1, ...data.map((item) => item[key])));
  const band = (width - plot.left - plot.right) / data.length;
  const barWidth = Math.min(24, band * 0.62);
  const base = height - plot.bottom;
  const scale = (value) => ((base - plot.top) * value) / max;
  const svg = svgElement("svg", { viewBox: `0 0 ${width} ${height}`, role: "img", "aria-label": `${title}: ${data.map((item) => `${item.range}, ${formatNumber(item[key])} ${unit}`).join("; ")}` });

  [0, max].forEach((tick) => {
    const y = base - scale(tick);
    svg.append(svgElement("line", { x1: plot.left, x2: width - plot.right, y1: y, y2: y, class: "chart-grid" }));
    const label = svgElement("text", { x: plot.left - 6, y: y + 3, class: "chart-axis", "text-anchor": "end" });
    label.textContent = formatNumber(tick);
    svg.append(label);
  });

  data.forEach((item, index) => {
    const value = item[key];
    const x = plot.left + band * index + (band - barWidth) / 2;
    const barHeight = scale(value);
    if (value > 0) {
      const radius = Math.min(4, barHeight, barWidth / 2);
      const top = base - barHeight;
      svg.append(svgElement("path", {
        d: `M${x},${base} V${top + radius} Q${x},${top} ${x + radius},${top} H${x + barWidth - radius} Q${x + barWidth},${top} ${x + barWidth},${top + radius} V${base} Z`,
        class: index === data.length - 1 ? "chart-bar current" : "chart-bar",
      }));
    }
    if (index % 2 === 1 || index === data.length - 1) {
      const label = svgElement("text", { x: x + barWidth / 2, y: height - 5, class: "chart-axis", "text-anchor": "middle" });
      label.textContent = item.label;
      svg.append(label);
    }
    const hit = svgElement("rect", { x: plot.left + band * index, y: plot.top, width: band, height: base - plot.top, class: "chart-hit", tabindex: 0 });
    const tip = () => showTip(hit, `${formatNumber(value)} ${unit}`, `Semana de ${item.range}`);
    hit.addEventListener("pointerenter", tip);
    hit.addEventListener("focus", tip);
    hit.addEventListener("pointerleave", hideTip);
    hit.addEventListener("blur", hideTip);
    svg.append(hit);
  });

  if (current > 0) {
    const x = plot.left + band * (data.length - 1) + band / 2;
    const label = svgElement("text", { x, y: base - scale(current) - 5, class: "chart-value", "text-anchor": "middle" });
    label.textContent = formatNumber(current);
    svg.append(label);
  }
  figure.append(svg);
  return figure;
}

function sparkline(values) {
  if (values.length < 2) return null;
  const width = 120;
  const height = 34;
  const min = Math.min(...values);
  const span = Math.max(...values) - min || 1;
  const points = values.map((value, index) => [4 + (index * (width - 8)) / (values.length - 1), height - 5 - ((value - min) / span) * (height - 10)]);
  const svg = svgElement("svg", { viewBox: `0 0 ${width} ${height}`, class: "sparkline", "aria-hidden": "true" });
  svg.append(svgElement("polyline", { points: points.map((point) => point.join(",")).join(" "), class: "spark-line" }));
  const [x, y] = points.at(-1);
  svg.append(svgElement("circle", { cx: x, cy: y, r: 4, class: "spark-dot" }));
  return svg;
}

// --- Página Treino ---

function nextLoad(top) {
  return top + (top >= 40 ? 5 : top >= 10 ? 2.5 : 1);
}

function loadGoals(workoutId) {
  return exercisesFor(workoutId)
    .filter((exercise) => !isCardio(exercise))
    .map((exercise) => {
      const last = loadHistory(exercise.id)[0];
      if (!last) return null;
      const top = Math.max(...last.loads[exercise.id].filter(hasLoad).map(Number));
      return { name: exercise.name, top, next: nextLoad(top) };
    })
    .filter(Boolean)
    .slice(0, 4);
}

function sessionMinutes(workoutId) {
  return exercisesFor(workoutId).reduce((sum, exercise) => sum + (isCardio(exercise) ? 10 : exercise.sets * 3.25), 0);
}

function renderTrainingToday() {
  const card = document.querySelector("#dash-today");
  const todayEntries = historyDays().get(dayKey()) ?? [];
  const suggested = suggestedWorkout();
  const doneToday = todayEntries.length ? daySummary(todayEntries) : null;
  let body;
  if (suggested === "R") {
    body = `<h3>Descanso</h3><p class="dash-meta">Pelo ciclo, hoje é dia de recuperar.</p><p class="dash-goal">Meta: dormir bem e, se quiser, só um cardio leve, como caminhada.</p>`;
  } else {
    const exercises = exercisesFor(suggested);
    const sets = exercises.reduce((sum, exercise) => sum + exercise.sets, 0);
    const goals = loadGoals(suggested);
    const goalList = goals.length
      ? `<p class="dash-goal">Meta de carga: repita a última e, se fechar todas as séries com boa técnica, suba.</p><ul class="load-goals">${goals
          .map((goal) => `<li><span>${escapeHtml(goal.name)}</span><b>${formatNumber(goal.top, 1)} → ${formatNumber(goal.next, 1)} kg</b></li>`)
          .join("")}</ul>`
      : `<p class="dash-goal">Meta: registrar as cargas de cada série. A partir do próximo treino o Zerão sugere quanto subir.</p>`;
    body = `<h3>${escapeHtml(sessionLabel(suggested))}</h3><p class="dash-meta">${exercises.length} exercícios · ${sets} séries · cerca de ${Math.round(sessionMinutes(suggested) / 5) * 5} min</p>${goalList}`;
  }
  const action = suggested !== "R" && selectedWorkoutId !== suggested ? `<button class="dash-start" type="button" data-start-workout="${suggested}">Começar ${escapeHtml(sessionLabel(suggested).split(" — ")[0])} →</button>` : "";
  const done = doneToday ? `<p class="dash-done">✓ Feito hoje: ${escapeHtml(doneToday.title)}</p>` : "";
  card.innerHTML = `<span class="card-label">${doneToday ? "Próximo do ciclo" : "Hoje · sugerido pelo ciclo"}</span>${done}${body}${action}`;
}

function renderTrainingLast() {
  const card = document.querySelector("#dash-last");
  const [day, entries] = [...historyDays().entries()][0] ?? [];
  if (!day) {
    card.innerHTML = `<span class="card-label">Último treino</span><h3>Nenhum ainda</h3><p class="dash-meta">Conclua o primeiro treino e ele aparece aqui.</p>`;
    return;
  }
  const summary = daySummary(entries);
  const details = [...summary.groups, ...summary.cardio.map((item) => `${item.name} ${item.minutes} min`)];
  const sets = summary.total ? `${summary.done} de ${summary.total} séries (${Math.round((summary.done / summary.total) * 100)}%)` : "";
  card.innerHTML = `<span class="card-label">Último treino · ${escapeHtml(relativeDay(day))}</span><h3>${escapeHtml(summary.title)}</h3>${details.length ? `<p class="dash-tags">${details.map(escapeHtml).join(" · ")}</p>` : ""}${sets ? `<p class="dash-meta">${sets}</p>` : ""}`;
}

function renderTrainingPace(weeks) {
  const card = document.querySelector("#dash-pace");
  const week = trainedDaysBetween(7, 0);
  const previous = trainedDaysBetween(14, 7);
  const month = trainedDaysBetween(30, 0);
  const delta = week - previous;
  const current = weeks.at(-1);
  card.innerHTML = `<span class="card-label">Ritmo</span>
    <div class="pace-hero"><strong>${week}</strong><span>${week === 1 ? "dia treinado" : "dias treinados"} nos últimos 7 dias</span></div>
    <p class="dash-meta">${delta === 0 ? "igual aos 7 dias anteriores" : `${delta > 0 ? "+" : ""}${delta} em relação aos 7 dias anteriores`} · ${month} nos últimos 30 dias</p>
    <p class="dash-meta">Nesta semana: ${current.sets} séries · ${current.cardio} min de cardio</p>`;
}

function renderTrainingCharts(weeks) {
  const container = document.querySelector("#training-charts");
  const table = `<details class="chart-table"><summary>Ver em tabela</summary><table><thead><tr><th>Semana</th><th>Dias</th><th>Séries</th><th>Cardio</th></tr></thead><tbody>${weeks
    .map((week) => `<tr><td>${week.range}</td><td>${week.days}</td><td>${week.sets}</td><td>${week.cardio} min</td></tr>`)
    .join("")}</tbody></table></details>`;
  container.replaceChildren(
    columnChart({ title: "Dias treinados por semana", unit: "dias", data: weeks, key: "days" }),
    columnChart({ title: "Séries concluídas por semana", unit: "séries", data: weeks, key: "sets" }),
    columnChart({ title: "Minutos de cardio por semana", unit: "min", data: weeks, key: "cardio" }),
  );
  container.insertAdjacentHTML("beforeend", table);
}

// --- Visão geral ---

function meter(value, target, unit) {
  const percent = Math.min(100, Math.round((value / target) * 100));
  return `<div class="goal-meter"><i><u style="width:${percent}%"></u></i><small>${formatNumber(value)} de ${formatNumber(target)} ${unit}</small></div>`;
}

function renderTodayGoals() {
  const todayEntries = historyDays().get(dayKey()) ?? [];
  const suggested = suggestedWorkout();
  const rest = Boolean(portalState.daily[portalToday]?.rest);
  const training = todayEntries.length
    ? `<p class="goal-status">✓ ${escapeHtml(daySummary(todayEntries).title)}</p>`
    : rest || suggested === "R"
      ? `<p class="goal-status">${rest ? "✓ Descanso marcado" : "Descanso pelo ciclo"}</p>`
      : `<p>${escapeHtml(sessionLabel(suggested))}</p><button class="goal-link" type="button" data-start-workout="${suggested}" data-open-training>Abrir treino →</button>`;
  const intake = todayIntake();
  const sleep = todaySleep();
  const sleepCopy = sleep
    ? meter(Number(sleep.hours), SLEEP_TARGET, "h")
    : `<p class="goal-hint">Registre como dormiu esta noite.</p>`;
  document.querySelector("#today-goals").innerHTML = `
    <div class="goal-item"><span>Treino</span>${training}</div>
    <div class="goal-item"><span>Nutrição</span>${meter(mealTotal(intake, "protein"), NUTRITION_TARGETS.protein, "g de proteína")}${meter(mealTotal(intake, "calories"), NUTRITION_TARGETS.calories, "kcal")}</div>
    <div class="goal-item"><span>Sono · meta de ${SLEEP_TARGET} h ou mais</span>${sleepCopy}</div>`;
}

function proteinByDay() {
  const days = new Map();
  portalState.meals.forEach((meal) => {
    const day = localDateKey(new Date(meal.createdAt));
    days.set(day, (days.get(day) ?? 0) + (Number(meal.protein) || 0));
  });
  Object.entries(portalState.daily).forEach(([day, record]) => {
    portalState.supplements.forEach((item) => {
      if (record.supplements?.[item.id] && Number(item.protein)) days.set(day, (days.get(day) ?? 0) + Number(item.protein));
    });
  });
  return [...days.entries()].filter(([, value]) => value > 0).sort(([a], [b]) => a.localeCompare(b));
}

function statTile({ label, value, unit, detail, trend }) {
  const tile = document.createElement("article");
  tile.className = "stat-tile";
  tile.innerHTML = `<span>${label}</span><strong>${value}<small>${unit}</small></strong><p>${detail}</p>`;
  const line = sparkline(trend);
  if (line) tile.append(line);
  return tile;
}

function renderProgressTiles(weeks) {
  const weights = [...portalState.weights].sort((a, b) => a.date.localeCompare(b.date));
  const latestWeight = weights.at(-1);
  const monthAgo = localDateKey(addDays(new Date(), -30));
  const weightBase = weights.find((entry) => entry.date >= monthAgo) ?? weights[0];
  const weightDelta = latestWeight && weightBase ? Number(latestWeight.value) - Number(weightBase.value) : 0;

  const sleeps = [...portalState.sleeps].sort((a, b) => a.date.localeCompare(b.date));
  const lastSleeps = sleeps.slice(-7);
  const sleepAverage = lastSleeps.length ? lastSleeps.reduce((sum, entry) => sum + Number(entry.hours), 0) / lastSleeps.length : 0;

  const protein = proteinByDay();
  const lastProtein = protein.slice(-7);
  const proteinAverage = lastProtein.length ? lastProtein.reduce((sum, [, value]) => sum + value, 0) / lastProtein.length : 0;

  const trained = trainedDaysBetween(7, 0);
  document.querySelector("#progress-tiles").replaceChildren(
    statTile({
      label: "Peso",
      value: latestWeight ? formatNumber(latestWeight.value, 1) : "—",
      unit: "kg",
      detail: weights.length > 1 ? `${weightDelta > 0 ? "+" : ""}${formatNumber(weightDelta, 1)} kg desde ${formatShortDate(weightBase.date)}` : "Registre o peso para ver a tendência",
      trend: weights.slice(-12).map((entry) => Number(entry.value)),
    }),
    statTile({
      label: "Treino",
      value: String(trained),
      unit: trained === 1 ? "dia" : "dias",
      detail: "treinados nos últimos 7 dias",
      trend: weeks.map((week) => week.days),
    }),
    statTile({
      label: "Sono",
      value: lastSleeps.length ? formatNumber(sleepAverage, 1) : "—",
      unit: "h",
      detail: lastSleeps.length ? `média das últimas ${lastSleeps.length} noites` : "Registre suas noites de sono",
      trend: sleeps.slice(-12).map((entry) => Number(entry.hours)),
    }),
    statTile({
      label: "Proteína",
      value: lastProtein.length ? formatNumber(proteinAverage) : "—",
      unit: "g/dia",
      detail: lastProtein.length ? `média de ${lastProtein.length} dias · meta ${NUTRITION_TARGETS.protein} g` : "Registre a proteína das refeições",
      trend: protein.slice(-12).map(([, value]) => value),
    }),
  );
}

function renderInsights() {
  const weeks = weeklyTraining();
  renderTrainingToday();
  renderTrainingLast();
  renderTrainingPace(weeks);
  renderTrainingCharts(weeks);
  renderTodayGoals();
  renderProgressTiles(weeks);
}

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-start-workout]");
  if (!button) return;
  selectedWorkoutId = button.dataset.startWorkout;
  state.selectedDay = dayKey();
  saveState();
  renderExercises();
  if (button.hasAttribute("data-open-training")) goToPage("treino");
  else document.querySelector(".session-bar").scrollIntoView({ behavior: "smooth", block: "start" });
});

window.renderInsights = renderInsights;
renderInsights();
