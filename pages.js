// Cada página do portal reúne uma ou mais seções e tem endereço próprio (/projetozerao/treino, /projetozerao/nutricao…).
// A troca usa o histórico do navegador; o .htaccess da pasta entrega o index.html quando o endereço é aberto direto.
const ZERAO_PAGES = {
  "visao-geral": { title: "Visão geral", sections: ["visao-geral"] },
  treino: { title: "Treino", sections: ["treino"] },
  nutricao: { title: "Nutrição", sections: ["nutricao"] },
  progresso: { title: "Progresso", sections: ["progresso", "shape"] },
  sono: { title: "Sono", sections: ["sono"] },
  saude: { title: "Saúde", sections: ["saude"] },
};
const ZERAO_LEGACY_PAGES = { inicio: "visao-geral", alimentacao: "nutricao", suplementacao: "nutricao", shape: "progresso" };

function resolvePage(id) {
  return ZERAO_PAGES[id] ? id : ZERAO_LEGACY_PAGES[id];
}

// Pasta do portal: o endereço atual sem o nome da página (ou sem index.html).
const ZERAO_BASE = (() => {
  const path = window.location.pathname;
  const last = path.slice(path.lastIndexOf("/") + 1);
  return resolvePage(last) ? path.slice(0, -last.length) : path.replace(/[^/]*$/, "");
})();

function pageUrl(page) {
  return page === "visao-geral" ? ZERAO_BASE : `${ZERAO_BASE}${page}`;
}

function currentPage() {
  const path = window.location.pathname;
  return resolvePage(path.slice(path.lastIndexOf("/") + 1)) ?? "visao-geral";
}

function showPage() {
  const page = currentPage();
  document.body.dataset.page = page;
  document.querySelectorAll("main > section").forEach((section) => {
    section.hidden = !ZERAO_PAGES[page].sections.includes(section.id);
  });
  const nav = document.querySelector(".module-nav > div");
  document.querySelectorAll(".module-nav [data-page-link]").forEach((link) => {
    const active = link.dataset.pageLink === page;
    link.classList.toggle("active", active);
    if (active) {
      link.setAttribute("aria-current", "page");
      nav.scrollLeft = link.offsetLeft - (nav.clientWidth - link.clientWidth) / 2;
    } else {
      link.removeAttribute("aria-current");
    }
  });
  document.title = page === "visao-geral" ? "ZERÃO — Do Zero ao Zé no Verão" : `${ZERAO_PAGES[page].title} · ZERÃO`;
  window.scrollTo({ top: 0, behavior: "instant" });
}

function goToPage(page) {
  if (page !== currentPage()) window.history.pushState(null, "", pageUrl(page));
  showPage();
}

document.querySelectorAll("[data-page-link]").forEach((link) => {
  link.href = pageUrl(link.dataset.pageLink);
});

document.addEventListener("click", (event) => {
  const link = event.target.closest("[data-page-link]");
  if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  goToPage(link.dataset.pageLink);
});

window.addEventListener("popstate", showPage);

// Links antigos com # (#/treino, #alimentacao…) viram o endereço novo.
function redirectLegacyHash() {
  const page = resolvePage(decodeURIComponent(window.location.hash.replace(/^#\/?/, "")));
  if (page) window.history.replaceState(null, "", pageUrl(page));
}

window.addEventListener("hashchange", () => {
  redirectLegacyHash();
  showPage();
});
redirectLegacyHash();
showPage();
