const workouts = {
  A: {
    title: "Peito + ombros",
    focus: "Peitoral superior, peitoral geral e deltoides",
    duration: "cerca de 45 min",
    exercises: [
      { id: "a-supino-inclinado", name: "Supino inclinado com halteres", sets: 3, reps: "8–12 repetições", animation: "chestPress", cue: "Mantenha os pés firmes, escápulas apoiadas e os punhos alinhados. Desça os halteres com controle e empurre sem bater os pesos no alto." },
      { id: "a-supino-reto-maquina", name: "Supino reto na máquina", sets: 3, reps: "8–12 repetições", animation: "chestPress", cue: "Ajuste o banco para as alças ficarem na linha do peito. Empurre mantendo ombros baixos e retorne devagar sem perder o apoio das costas." },
      { id: "a-peck-deck", name: "Crucifixo na máquina (Peck Deck)", sets: 3, reps: "10–12 repetições", animation: "chestFly", cue: "Apoie bem as costas e mantenha leve flexão nos cotovelos. Feche os braços contraindo o peitoral e abra apenas até uma amplitude confortável." },
      { id: "a-elevacao-lateral", name: "Elevação lateral com halteres", sets: 3, reps: "10–12 repetições", animation: "lateralRaise", cue: "Eleve os braços para os lados com cotovelos levemente flexionados, sem encolher os ombros ou usar impulso. Desça controlando." },
      { id: "a-crucifixo-inverso", name: "Crucifixo inverso na máquina", sets: 2, reps: "12–15 repetições", animation: "reverseFly", cue: "Mantenha o peito apoiado e abra os braços levando os cotovelos para trás. Evite arquear a lombar ou acelerar a volta." },
    ],
  },
  B: {
    title: "Pernas + panturrilhas",
    focus: "Quadríceps, posteriores, glúteos e panturrilhas",
    duration: "cerca de 50 min",
    exercises: [
      { id: "b-leg-press", name: "Leg press 45°", sets: 3, reps: "10–12 repetições", animation: "legPress", cue: "Mantenha lombar e quadril apoiados. Desça a plataforma com controle sem deixar os joelhos fecharem e empurre sem travar totalmente as pernas." },
      { id: "b-extensora", name: "Cadeira extensora", sets: 3, reps: "10–12 repetições", animation: "legExtension", cue: "Ajuste o joelho ao eixo da máquina. Estenda as pernas com controle, faça uma pausa curta no alto e retorne sem soltar o peso." },
      { id: "b-flexora", name: "Mesa flexora", sets: 3, reps: "10–12 repetições", animation: "legCurl", cue: "Mantenha o quadril apoiado. Flexione os joelhos levando os calcanhares em direção aos glúteos e retorne devagar." },
      { id: "b-abdutora", name: "Cadeira abdutora", sets: 2, reps: "12–15 repetições", animation: "abduction", cue: "Mantenha quadril e costas apoiados. Abra os joelhos com controle, sem impulso, e retorne resistindo ao peso." },
      { id: "b-adutora", name: "Cadeira adutora", sets: 2, reps: "12–15 repetições", animation: "adduction", cue: "Ajuste uma amplitude confortável. Feche as pernas controlando a carga e retorne sem deixar as placas baterem." },
      { id: "b-panturrilha", name: "Panturrilha sentada", sets: 3, reps: "12–15 repetições", animation: "calfRaise", cue: "Use toda a amplitude confortável: desça os calcanhares, eleve até contrair a panturrilha e pause brevemente no alto." },
    ],
  },
  C: {
    title: "Costas + abdômen",
    focus: "Largura, espessura, trapézio e estabilidade abdominal",
    duration: "cerca de 50 min",
    exercises: [
      { id: "c-puxada-aberta", name: "Puxada alta aberta", sets: 3, reps: "10–12 repetições", animation: "latPulldown", cue: "Segure a barra com pegada aberta, mantenha o peito elevado e puxe em direção à parte superior do peito levando os cotovelos para baixo." },
      { id: "c-puxada-fechada", name: "Puxada alta fechada", sets: 3, reps: "10–12 repetições", animation: "latPulldown", cue: "Use a pegada neutra, mantenha o tronco estável e puxe o triângulo em direção ao peito sem balançar o corpo." },
      { id: "c-remada-baixa", name: "Remada baixa no cabo", sets: 3, reps: "10–12 repetições", animation: "row", cue: "Mantenha a coluna neutra e puxe levando os cotovelos para trás. Evite transformar o movimento em um balanço do tronco." },
      { id: "c-remada-articulada", name: "Remada articulada com apoio", sets: 3, reps: "10–12 repetições", animation: "row", cue: "Apoie o peito, mantenha os ombros longe das orelhas e conduza os cotovelos para trás, apertando as costas no final." },
      { id: "c-encolhimento", name: "Encolhimento com halteres", sets: 3, reps: "12–15 repetições", animation: "shrug", cue: "Eleve os ombros em direção às orelhas, segure um instante e desça lentamente. Não gire os ombros durante o movimento." },
      { id: "c-abdominal-maquina", name: "Abdominal na máquina", sets: 3, reps: "12–15 repetições", animation: "crunch", cue: "Inicie o movimento pelo abdômen, aproximando costelas e quadril. Não puxe apenas com os braços e não prenda a respiração." },
      { id: "c-bird-dog", name: "Bird dog", sets: 2, reps: "8–10 por lado", animation: "birdDog", cue: "Em quatro apoios, estenda braço e perna opostos sem girar o quadril. Pause, retorne com controle e alterne os lados." },
    ],
  },
  D: {
    title: "Bíceps + tríceps + antebraço",
    focus: "Bíceps, tríceps, braquial e antebraços",
    duration: "cerca de 45 min",
    exercises: [
      { id: "d-rosca-direta", name: "Rosca direta com barra W", sets: 3, reps: "8–12 repetições", animation: "curl", cue: "Mantenha os cotovelos próximos ao corpo e suba a barra sem balançar o tronco. Desça controlando toda a amplitude." },
      { id: "d-rosca-alternada", name: "Rosca alternada com halteres", sets: 3, reps: "10–12 repetições", animation: "curl", cue: "Flexione um braço por vez mantendo o ombro estável. Gire a palma para cima durante a subida e evite usar impulso." },
      { id: "d-rosca-martelo", name: "Rosca martelo com halteres", sets: 2, reps: "10–12 repetições", animation: "hammerCurl", cue: "Mantenha as palmas voltadas uma para a outra e os cotovelos fixos. Suba e desça os halteres de forma controlada." },
      { id: "d-triceps-corda", name: "Tríceps na polia com corda", sets: 3, reps: "10–12 repetições", animation: "tricepsPushdown", cue: "Fixe os cotovelos ao lado do corpo, estenda os braços e afaste levemente as pontas da corda no final sem inclinar o tronco." },
      { id: "d-triceps-frances", name: "Tríceps francês unilateral", sets: 2, reps: "10–12 repetições", animation: "tricepsExtension", cue: "Mantenha o braço apontado para cima e flexione apenas o cotovelo, levando o peso atrás da cabeça. Estenda sem abrir o cotovelo." },
      { id: "d-rosca-inversa", name: "Rosca inversa com barra W", sets: 2, reps: "12–15 repetições", animation: "reverseCurl", cue: "Segure a barra com as palmas para baixo, cotovelos junto ao corpo e punhos firmes. Suba sem balançar e desça devagar." },
    ],
  },
};

const STORAGE_KEY = "zerao-workout-v3";
const HISTORY_KEY = "zerao-history-v2";
const state = loadState();
let selectedWorkoutId = state.selectedWorkoutId && workouts[state.selectedWorkoutId] ? state.selectedWorkoutId : "A";
let currentExercise = null;
let toastTimer = null;

const list = document.querySelector("#exercise-list");
const movementModal = document.querySelector("#movement-modal");
const historyModal = document.querySelector("#history-modal");

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

function currentExercises() {
  return currentWorkout().exercises;
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

function createExerciseCard(exercise, index) {
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
          aria-label="Concluir série ${setIndex + 1} de ${exercise.name}"
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
          aria-label="Carga da série ${setIndex + 1} de ${exercise.name} em quilos"
        />
        <span class="unit">kg</span>
      </label>
    `;
  }).join("");

  article.innerHTML = `
    <span class="exercise-number">${String(index + 1).padStart(2, "0")}</span>
    <div class="exercise-name">
      <h3>${exercise.name}</h3>
      <p>${exercise.sets} séries · ${exercise.reps}</p>
    </div>
    <div class="set-row">${sets}</div>
    <button class="movement-button" type="button" data-movement="${exercise.id}">▶ Ver movimento 3D</button>
  `;
  return article;
}

function renderExercises() {
  const workout = currentWorkout();
  const fragment = document.createDocumentFragment();
  currentExercises().forEach((exercise, index) => fragment.appendChild(createExerciseCard(exercise, index)));
  list.replaceChildren(fragment);
  document.querySelector("#workout-title").textContent = `TREINO ${selectedWorkoutId} — ${workout.title}`;
  document.querySelector("#workout-description").textContent = `${workout.focus}. ${currentExercises().length} exercícios · ${totalSets()} séries · ${workout.duration}.`;
  document.querySelectorAll("[data-workout]").forEach((button) => {
    const active = button.dataset.workout === selectedWorkoutId;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  document.querySelector("#total-sets").textContent = totalSets();
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

function updateProgress() {
  const completed = completedSets();
  const total = totalSets();
  const percent = Math.round((completed / total) * 100);
  document.querySelector("#completed-sets").textContent = completed;
  document.querySelector("#progress-percent").textContent = `${percent}%`;
  document.querySelector("#progress-bar").style.width = `${percent}%`;
  document.querySelector("#progress-message").textContent =
    percent === 100 ? "Treino completo. Monstro!" : percent >= 70 ? "Tá quase. Mantém o foco." : percent > 0 ? "Boa. Continua assim." : "Começa no seu ritmo.";
}

function updateSet(exerciseId, setIndex, patch) {
  const saved = exerciseState(exerciseId);
  saved[setIndex] = { ...saved[setIndex], ...patch };
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
  document.querySelector("#modal-cue").textContent = currentExercise.cue;
  document.querySelector("#youtube-link").href = `https://www.youtube.com/results?search_query=${encodeURIComponent(`Leandro Twin ${currentExercise.name} execução`)}`;
  document.querySelector("#play-icon").textContent = "Ⅱ";
  document.querySelector("#play-label").textContent = "Pausar animação";
  movementModal.showModal();
  document.body.style.overflow = "hidden";
  requestAnimationFrame(() => humanViewer.open(currentExercise.animation));
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
  const done = completedSets();
  if (done === 0) {
    showToast("Marque pelo menos uma série antes de concluir.");
    return;
  }
  const total = totalSets();
  const history = getHistory();
  const loads = {};
  currentExercises().forEach((exercise) => {
    const saved = exerciseState(exercise.id);
    loads[exercise.id] = Array.from({ length: exercise.sets }, (_, i) => saved[i]?.load ?? "");
  });
  history.unshift({ date: new Date().toISOString(), workoutId: selectedWorkoutId, workoutTitle: currentWorkout().title, done, total, loads });
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 30)));
  window.zeraoSync?.schedule();

  currentExercises().forEach((exercise) => {
    const saved = exerciseState(exercise.id);
    for (let i = 0; i < exercise.sets; i += 1) {
      saved[i] = { ...saved[i], done: false };
    }
  });
  saveState();
  renderExercises();
  showToast(done === total ? "Treino completo registrado. Aí sim!" : `Treino registrado com ${done} de ${total} séries.`);
}

function renderHistory() {
  const history = getHistory();
  const container = document.querySelector("#history-list");
  if (history.length === 0) {
    container.innerHTML = `<div class="history-empty"><strong>Ainda sem registros.</strong>Conclua seu primeiro treino para começar.</div>`;
    return;
  }

  container.innerHTML = history
    .map((entry) => {
      const date = new Date(entry.date);
      const day = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(date).replace(".", "").toUpperCase();
      const time = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(date);
      const score = Math.round((entry.done / entry.total) * 100);
      return `
        <article class="history-entry">
          <div class="history-date">${day.replace(" ", "<br>")}</div>
          <div><strong>${entry.workoutId ? `Treino ${entry.workoutId} — ${entry.workoutTitle}` : "Treino de pernas"}</strong><p>${entry.done} de ${entry.total} séries · ${time}</p></div>
          <span class="history-score">${score}%</span>
        </article>
      `;
    })
    .join("");
}

list.addEventListener("change", (event) => {
  const target = event.target;
  if (target.matches(".set-check")) {
    updateSet(target.dataset.exercise, target.dataset.set, { done: target.checked });
  }
  if (target.matches(".load-input")) {
    updateSet(target.dataset.exercise, target.dataset.set, { load: target.value });
  }
});

list.addEventListener("input", (event) => {
  const target = event.target;
  if (target.matches(".load-input")) {
    updateSet(target.dataset.exercise, target.dataset.set, { load: target.value });
  }
});

list.addEventListener("click", (event) => {
  const button = event.target.closest("[data-movement]");
  if (button) openMovement(button.dataset.movement);
});

document.querySelector("#workout-selector").addEventListener("click", (event) => {
  const button = event.target.closest("[data-workout]");
  if (!button || !workouts[button.dataset.workout]) return;
  selectedWorkoutId = button.dataset.workout;
  saveState();
  renderExercises();
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
    localStorage.removeItem(HISTORY_KEY);
    window.zeraoSync?.schedule();
    renderHistory();
    showToast("Histórico apagado.");
  }
});

[movementModal, historyModal].forEach((modal) => {
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

renderExercises();
