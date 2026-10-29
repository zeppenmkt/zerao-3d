const exercises = [
  {
    id: "agachamento",
    name: "Agachamento livre",
    sets: 4,
    reps: "8–10 repetições",
    animation: "squat",
    cue: "Pés firmes na largura dos ombros. Desça levando o quadril para trás, mantenha o peito aberto e os joelhos alinhados com os pés. Suba empurrando o chão.",
  },
  {
    id: "leg-press",
    name: "Leg press 45°",
    sets: 4,
    reps: "10–12 repetições",
    animation: "legPress",
    cue: "Mantenha lombar e quadril apoiados. Desça a plataforma com controle sem deixar os joelhos fecharem e empurre sem travar totalmente as pernas.",
  },
  {
    id: "extensora",
    name: "Cadeira extensora",
    sets: 3,
    reps: "12–15 repetições",
    animation: "legExtension",
    cue: "Ajuste o joelho ao eixo da máquina. Estenda as pernas com controle, faça uma pausa curta no alto e retorne sem soltar o peso.",
  },
  {
    id: "flexora",
    name: "Mesa flexora",
    sets: 3,
    reps: "10–12 repetições",
    animation: "legCurl",
    cue: "Mantenha o quadril apoiado no banco. Flexione os joelhos levando os calcanhares em direção aos glúteos e retorne devagar.",
  },
  {
    id: "stiff",
    name: "Stiff com halteres",
    sets: 3,
    reps: "8–10 repetições",
    animation: "hinge",
    cue: "Joelhos levemente flexionados. Leve o quadril para trás com a coluna neutra, mantendo os pesos perto das pernas, e volte contraindo os glúteos.",
  },
  {
    id: "elevacao-pelvica",
    name: "Elevação pélvica",
    sets: 4,
    reps: "10–12 repetições",
    animation: "hipThrust",
    cue: "Apoie a parte alta das costas, mantenha os pés firmes e eleve o quadril até alinhar ombros, quadril e joelhos. Contraia os glúteos no topo.",
  },
  {
    id: "panturrilha",
    name: "Panturrilha em pé",
    sets: 4,
    reps: "12–15 repetições",
    animation: "calfRaise",
    cue: "Mantenha o corpo estável. Eleve os calcanhares até o máximo confortável, segure um instante no alto e desça controlando toda a amplitude.",
  },
  {
    id: "bulgaro",
    name: "Afundo búlgaro",
    sets: 3,
    reps: "8–10 por perna",
    animation: "lunge",
    cue: "Apoie o pé de trás e firme o pé da frente. Desça o joelho de trás em direção ao chão, mantendo o joelho da frente alinhado, e suba pelo calcanhar.",
  },
];

const STORAGE_KEY = "zerao-workout-v2";
const HISTORY_KEY = "zerao-history-v2";
const state = loadState();
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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
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
    const saved = state[exercise.id]?.[setIndex] ?? {};
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
  const fragment = document.createDocumentFragment();
  exercises.forEach((exercise, index) => fragment.appendChild(createExerciseCard(exercise, index)));
  list.replaceChildren(fragment);
  document.querySelector("#total-sets").textContent = totalSets();
  updateProgress();
}

function totalSets() {
  return exercises.reduce((total, exercise) => total + exercise.sets, 0);
}

function completedSets() {
  return exercises.reduce((total, exercise) => {
    return total + Array.from({ length: exercise.sets }, (_, i) => state[exercise.id]?.[i]?.done).filter(Boolean).length;
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
  state[exerciseId] ??= {};
  state[exerciseId][setIndex] = { ...state[exerciseId][setIndex], ...patch };
  saveState();
  updateProgress();
}

function openMovement(exerciseId) {
  currentExercise = exercises.find((exercise) => exercise.id === exerciseId);
  if (!currentExercise) return;
  const index = exercises.indexOf(currentExercise) + 1;
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
  exercises.forEach((exercise) => {
    loads[exercise.id] = Array.from({ length: exercise.sets }, (_, i) => state[exercise.id]?.[i]?.load ?? "");
  });
  history.unshift({ date: new Date().toISOString(), done, total, loads });
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 30)));

  exercises.forEach((exercise) => {
    state[exercise.id] ??= {};
    for (let i = 0; i < exercise.sets; i += 1) {
      state[exercise.id][i] = { ...state[exercise.id][i], done: false };
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
          <div><strong>Treino de pernas</strong><p>${entry.done} de ${entry.total} séries · ${time}</p></div>
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
