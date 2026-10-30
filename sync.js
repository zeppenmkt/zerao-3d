const ZERAO_KEYS = {
  portal: "zerao-life-v1",
  workout: "zerao-workout-v3",
  history: "zerao-history-v2",
};
const ZERAO_META_KEY = "zerao-sync-v1";
// Preenchido pelo deploy; vazio na prévia local, que carrega os arquivos sem versão.
const ZERAO_ASSET_VERSION = "";

const isLocalPreview = ["localhost", "127.0.0.1"].includes(window.location.hostname) || window.location.protocol === "file:";
let syncTimer = null;
let syncInFlight = false;
let scriptsLoaded = false;
// Visitantes só leem; editar exige login. Na prévia local tudo fica liberado.
const zeraoAuth = { loggedIn: isLocalPreview, needsSetup: false, canSetup: false };

function readCachedState() {
  const state = {};
  Object.entries(ZERAO_KEYS).forEach(([name, key]) => {
    try {
      state[name] = JSON.parse(localStorage.getItem(key) || "null");
    } catch {
      state[name] = null;
    }
  });
  return state;
}

function writeCache(state) {
  if (!state || typeof state !== "object") return;
  Object.entries(ZERAO_KEYS).forEach(([name, key]) => {
    if (state[name] === undefined || state[name] === null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(state[name]));
  });
}

// rev: última revisão do servidor conhecida; base: estado do servidor nessa revisão; dirty: há alterações locais não enviadas;
// owner: este aparelho já editou com login, então alterações pendentes são do Zé e devem ser preservadas.
function readMeta() {
  try {
    const meta = JSON.parse(localStorage.getItem(ZERAO_META_KEY) || "null");
    return meta && typeof meta === "object" ? meta : null;
  } catch {
    return null;
  }
}

function writeMeta(meta) {
  localStorage.setItem(ZERAO_META_KEY, JSON.stringify(meta));
}

function sameValue(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function recordKey(item) {
  return isPlainObject(item) ? item.id ?? item.date : undefined;
}

function mergeLists(base, local, remote) {
  if (![...base, ...local, ...remote].every((item) => recordKey(item) !== undefined)) return local;
  const byKey = (list) => new Map(list.map((item) => [recordKey(item), item]));
  const baseMap = byKey(base);
  const localMap = byKey(local);
  const remoteMap = byKey(remote);
  const keys = new Set([...remoteMap.keys(), ...localMap.keys()]);
  return [...keys].map((key) => mergeValues(baseMap.get(key), localMap.get(key), remoteMap.get(key))).filter((item) => item !== undefined);
}

// Mescla em três vias: o que mudou só de um lado prevalece; se os dois mudaram, vale este aparelho.
function mergeValues(base, local, remote) {
  if (sameValue(local, remote)) return local;
  if (sameValue(base, local)) return remote;
  if (sameValue(base, remote)) return local;
  if (Array.isArray(local) && Array.isArray(remote)) return mergeLists(Array.isArray(base) ? base : [], local, remote);
  if (isPlainObject(local) && isPlainObject(remote)) {
    const baseObject = isPlainObject(base) ? base : {};
    const merged = {};
    new Set([...Object.keys(local), ...Object.keys(remote)]).forEach((key) => {
      const value = mergeValues(baseObject[key], local[key], remote[key]);
      if (value !== undefined) merged[key] = value;
    });
    return merged;
  }
  return local;
}

function mergeStates(base, local, remote) {
  const merged = {};
  Object.keys(ZERAO_KEYS).forEach((name) => {
    merged[name] = mergeValues(base?.[name] ?? null, local?.[name] ?? null, remote?.[name] ?? null) ?? null;
  });
  if (Array.isArray(merged.history)) merged.history.sort((a, b) => String(b.date).localeCompare(String(a.date)));
  return merged;
}

function updateSyncBadge(copy, status = "online") {
  const badge = document.querySelector("#sync-badge");
  if (!badge) return;
  badge.classList.toggle("offline", status !== "online");
  badge.innerHTML = `<i></i> ${copy}`;
}

async function apiRequest(action, options = {}) {
  const response = await fetch(`api.php?action=${encodeURIComponent(action)}`, {
    credentials: "same-origin",
    cache: "no-store",
    ...options,
    headers: {
      "X-Zerao-Request": "portal",
      ...(options.headers || {}),
    },
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    const error = new Error(payload.error || `Falha ${response.status}`);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }
  return response;
}

// Junta o estado do servidor com as alterações locais pendentes e grava o resultado neste aparelho.
function absorbRemote(remote, rev) {
  const meta = readMeta();
  const local = readCachedState();
  const merged = meta ? mergeStates(meta.base, local, remote) : mergeStates({}, local, remote);
  writeCache(merged);
  writeMeta({ rev, base: remote, dirty: !sameValue(merged, remote) });
  return !sameValue(merged, local);
}

async function pushState() {
  if (isLocalPreview || syncInFlight) return;
  if (!zeraoAuth.loggedIn) {
    updateSyncBadge("Entre para salvar as alterações", "offline");
    return;
  }
  const meta = readMeta() ?? { rev: 0, base: {}, dirty: true };
  const sent = readCachedState();
  syncInFlight = true;
  updateSyncBadge("Sincronizando…", "pending");
  try {
    const response = await apiRequest("state", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ baseRev: meta.rev, state: sent }),
    });
    const { rev } = await response.json();
    const changedMeanwhile = !sameValue(readCachedState(), sent);
    writeMeta({ rev, base: sent, dirty: changedMeanwhile, owner: true });
    updateSyncBadge("Sincronizado");
    if (changedMeanwhile) scheduleSync();
  } catch (error) {
    if (error.status === 409 && error.payload?.state) {
      // Outro aparelho salvou antes: mescla e recarrega para a tela refletir o estado combinado.
      absorbRemote(error.payload.state, error.payload.rev);
      window.location.reload();
      return;
    }
    if (error.status === 401) {
      setAuth({ loggedIn: false });
      updateSyncBadge("Entre para salvar as alterações", "offline");
      return;
    }
    updateSyncBadge("Alterações salvas neste aparelho", "offline");
  } finally {
    syncInFlight = false;
  }
}

function scheduleSync() {
  if (isLocalPreview) return;
  const meta = readMeta();
  // Visitante: mudanças automáticas da tela ficam só nesta visita e nunca vão para o servidor.
  if (!zeraoAuth.loggedIn && !meta?.owner) return;
  if (meta && !meta.dirty) writeMeta({ ...meta, dirty: true });
  window.clearTimeout(syncTimer);
  syncTimer = window.setTimeout(pushState, 650);
}

async function fetchRemote() {
  const response = await apiRequest("state");
  const payload = await response.json();
  return { state: payload.state || {}, rev: Number(payload.rev) || 0 };
}

async function fetchSession() {
  const response = await apiRequest("session");
  return response.json();
}

function setAuth(next) {
  Object.assign(zeraoAuth, next);
  document.body.classList.toggle("is-visitor", !zeraoAuth.loggedIn);
  const button = document.querySelector("#auth-button");
  if (button) {
    button.innerHTML = zeraoAuth.loggedIn ? '<span aria-hidden="true">●</span> Sair' : '<span aria-hidden="true">→</span> Entrar';
    button.classList.toggle("logged-in", zeraoAuth.loggedIn);
    button.hidden = isLocalPreview;
  }
  document.dispatchEvent(new CustomEvent("zerao:auth", { detail: { ...zeraoAuth } }));
}

async function loadPrivateState() {
  if (isLocalPreview) {
    setAuth({});
    updateSyncBadge("Prévia local", "offline");
    return;
  }
  try {
    const [remote, session] = await Promise.all([fetchRemote(), fetchSession().catch(() => ({ loggedIn: false }))]);
    setAuth(session);
    const meta = readMeta();
    if (!zeraoAuth.loggedIn && !meta?.owner) {
      writeCache(remote.state);
      writeMeta({ rev: remote.rev, base: remote.state, dirty: false });
      updateSyncBadge("Modo visualização", "offline");
      return;
    }
    if (zeraoAuth.loggedIn && meta && !meta.owner) writeMeta({ ...meta, owner: true });
    if (meta?.dirty && meta.rev === remote.rev) {
      await pushState();
      return;
    }
    // Revisão zero ou anterior à conhecida indica arquivo do servidor recriado: mescla em vez de substituir.
    if (meta && !meta.dirty && remote.rev > 0 && remote.rev >= meta.rev) {
      writeCache(remote.state);
      writeMeta({ rev: remote.rev, base: remote.state, dirty: false });
    } else {
      absorbRemote(remote.state, remote.rev);
    }
    if (readMeta().dirty) await pushState();
    else updateSyncBadge(zeraoAuth.loggedIn ? "Sincronizado" : "Modo visualização", zeraoAuth.loggedIn ? "online" : "offline");
  } catch {
    updateSyncBadge("Modo local temporário", "offline");
  }
}

// Ao voltar para a aba, traz o que outro aparelho salvou enquanto ela estava em segundo plano.
async function refreshOnReturn() {
  if (isLocalPreview || !scriptsLoaded || document.visibilityState !== "visible" || syncInFlight) return;
  const meta = readMeta();
  if (meta?.dirty) {
    pushState();
    return;
  }
  try {
    const remote = await fetchRemote();
    if (!meta || remote.rev <= meta.rev) return;
    if (!zeraoAuth.loggedIn && meta.owner && meta.dirty) return;
    writeCache(remote.state);
    writeMeta({ rev: remote.rev, base: remote.state, dirty: false });
    window.location.reload();
  } catch {
    updateSyncBadge("Modo local temporário", "offline");
  }
}

function assetPath(file) {
  return ZERAO_ASSET_VERSION ? file.replace(/\.js$/, `.${ZERAO_ASSET_VERSION}.js`) : file;
}

// Carrega em ordem: a biblioteca de exercícios, o treino, o restante do portal e os painéis.
function loadPortalScripts() {
  if (scriptsLoaded) return;
  scriptsLoaded = true;
  ["exercises.js", "app.js", "portal.js", "dashboard.js"].reduce(
    (previous, file) =>
      previous.then(
        () =>
          new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = assetPath(file);
            script.onload = resolve;
            document.body.append(script);
          }),
      ),
    Promise.resolve(),
  );
}

// Tudo que edita fica bloqueado para visitantes: o clique abre o login e, depois de entrar, a ação continua.
const PUBLIC_CONTROLS = "[data-page-link], a[href], summary, .modal-close, [data-movement], #toggle-animation, [data-open-training], [data-auth], #auth-modal *";
const EDIT_CONTROLS = "button, input, select, textarea, label";
let pendingControl = null;

function lockedControl(target) {
  if (zeraoAuth.loggedIn || !(target instanceof Element)) return null;
  const control = target.closest(EDIT_CONTROLS);
  if (!control || control.closest(PUBLIC_CONTROLS) || !control.closest("main, dialog")) return null;
  return control;
}

function openLogin(control = null) {
  const modal = document.querySelector("#auth-modal");
  if (!modal || modal.open) return;
  pendingControl = control;
  const setup = zeraoAuth.needsSetup;
  document.querySelector("#auth-title").textContent = setup ? "CRIAR SENHA" : "ENTRAR";
  document.querySelector("#auth-copy").textContent = setup
    ? zeraoAuth.canSetup
      ? "Primeiro acesso: crie a senha que vai liberar as edições. Use pelo menos 8 caracteres."
      : "O login ainda não foi configurado neste servidor."
    : control
      ? "Para registrar treinos e editar qualquer informação, entre na sua conta."
      : "Entre para registrar treinos, editar e ver as fotos do shape.";
  document.querySelector("#auth-confirm-row").hidden = !setup;
  document.querySelector("#auth-confirm").required = setup;
  document.querySelector("#auth-password").autocomplete = setup ? "new-password" : "current-password";
  document.querySelector("#auth-submit").textContent = setup ? "Criar e entrar" : "Entrar";
  document.querySelector("#auth-error").textContent = "";
  document.querySelector("#auth-form").reset();
  document.activeElement?.blur?.();
  modal.showModal();
  document.querySelector("#auth-password").focus();
}

function guardEdit(event) {
  const control = lockedControl(event.target);
  if (!control) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  if (event.type === "click" || event.type === "keydown") openLogin(control);
}

document.addEventListener("click", guardEdit, true);
document.addEventListener("submit", guardEdit, true);
document.addEventListener("change", guardEdit, true);
// Evita abrir teclado ou lista de opções antes do login.
document.addEventListener("mousedown", (event) => {
  if (lockedControl(event.target)?.matches("input, select, textarea")) event.preventDefault();
}, true);
document.addEventListener("keydown", (event) => {
  if (["Tab", "Shift", "Escape"].includes(event.key) || !lockedControl(event.target)?.matches("input, select, textarea")) return;
  guardEdit(event);
}, true);

document.querySelector("#auth-button")?.addEventListener("click", async () => {
  if (!zeraoAuth.loggedIn) {
    openLogin();
    return;
  }
  if (readMeta()?.dirty) await pushState();
  await apiRequest("logout", { method: "POST" }).catch(() => {});
  const meta = readMeta();
  if (meta) writeMeta({ ...meta, owner: false });
  setAuth({ loggedIn: false });
  updateSyncBadge("Modo visualização", "offline");
});

document.addEventListener("click", (event) => {
  if (event.target.closest("[data-auth]:not(#auth-button)")) openLogin();
});

document.querySelector("#close-auth")?.addEventListener("click", () => document.querySelector("#auth-modal").close());

document.querySelector("#auth-form")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const password = document.querySelector("#auth-password").value;
  const error = document.querySelector("#auth-error");
  if (zeraoAuth.needsSetup && password !== document.querySelector("#auth-confirm").value) {
    error.textContent = "As senhas não conferem.";
    return;
  }
  const submit = event.target.querySelector("button[type=submit]");
  submit.disabled = true;
  error.textContent = "";
  try {
    await apiRequest("login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
    const meta = readMeta();
    if (meta) writeMeta({ ...meta, owner: true });
    setAuth({ loggedIn: true, needsSetup: false, canSetup: false });
    document.querySelector("#auth-modal").close();
    if (readMeta()?.dirty) pushState();
    else updateSyncBadge("Sincronizado");
    const control = pendingControl;
    pendingControl = null;
    if (control?.isConnected) {
      if (control.matches("input:not([type=checkbox]):not([type=radio]), select, textarea")) control.focus();
      else control.click();
    }
  } catch (failure) {
    error.textContent = failure.message || "Não foi possível entrar.";
  } finally {
    submit.disabled = false;
  }
});

window.zeraoAuth = zeraoAuth;
window.openLogin = openLogin;

window.zeraoSync = {
  schedule: scheduleSync,
  async listShapes() {
    if (isLocalPreview) return [];
    const response = await apiRequest("shapes");
    return (await response.json()).photos || [];
  },
  async uploadShape(formData) {
    if (isLocalPreview) throw new Error("Envio disponível após a publicação privada.");
    const response = await apiRequest("shape", { method: "POST", body: formData });
    return response.json();
  },
  async removeShape(id) {
    if (isLocalPreview) return;
    await apiRequest(`shape&id=${encodeURIComponent(id)}`, { method: "DELETE" });
  },
  shapeUrl(id) {
    return `api.php?action=shape&id=${encodeURIComponent(id)}`;
  },
};

document.addEventListener("visibilitychange", refreshOnReturn);
loadPrivateState().finally(loadPortalScripts);
