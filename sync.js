const ZERAO_KEYS = {
  portal: "zerao-life-v1",
  workout: "zerao-workout-v3",
  history: "zerao-history-v2",
};
const ZERAO_ASSET_VERSION = "20261029-2";

const isLocalPreview = ["localhost", "127.0.0.1"].includes(window.location.hostname) || window.location.protocol === "file:";
let syncTimer = null;
let scriptsLoaded = false;

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

function hydrateCache(state) {
  if (!state || typeof state !== "object") return;
  Object.entries(ZERAO_KEYS).forEach(([name, key]) => {
    if (state[name] !== undefined && state[name] !== null) localStorage.setItem(key, JSON.stringify(state[name]));
  });
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
    throw new Error(payload.error || `Falha ${response.status}`);
  }
  return response;
}

async function pushState() {
  if (isLocalPreview) return;
  updateSyncBadge("Sincronizando…", "pending");
  try {
    await apiRequest("state", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(readCachedState()),
    });
    updateSyncBadge("Privado e sincronizado");
  } catch {
    updateSyncBadge("Alterações salvas neste aparelho", "offline");
  }
}

function scheduleSync() {
  if (isLocalPreview) return;
  window.clearTimeout(syncTimer);
  syncTimer = window.setTimeout(pushState, 650);
}

async function loadPrivateState() {
  if (isLocalPreview) {
    updateSyncBadge("Prévia local", "offline");
    return;
  }
  try {
    const response = await apiRequest("state");
    const payload = await response.json();
    if (payload.state && Object.keys(payload.state).length) hydrateCache(payload.state);
    else if (Object.values(readCachedState()).some(Boolean)) await pushState();
    updateSyncBadge("Privado e sincronizado");
  } catch {
    updateSyncBadge("Modo local temporário", "offline");
  }
}

function loadPortalScripts() {
  if (scriptsLoaded) return;
  scriptsLoaded = true;
  const appScript = document.createElement("script");
  appScript.src = `app.js?v=${ZERAO_ASSET_VERSION}`;
  appScript.onload = () => {
    const portalScript = document.createElement("script");
    portalScript.src = `portal.js?v=${ZERAO_ASSET_VERSION}`;
    document.body.append(portalScript);
  };
  document.body.append(appScript);
}

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

loadPrivateState().finally(loadPortalScripts);

