// Cada página do portal reúne uma ou mais seções e é escolhida pelo endereço (#/treino, #/nutricao…).
// O formato "#/" evita que o navegador role até a âncora ao abrir o link.
const ZERAO_PAGES = {
  "visao-geral": { title: "Visão geral", sections: ["visao-geral"] },
  treino: { title: "Treino", sections: ["treino"] },
  nutricao: { title: "Nutrição", sections: ["nutricao"] },
  progresso: { title: "Progresso", sections: ["progresso", "shape"] },
  sono: { title: "Sono", sections: ["sono"] },
  saude: { title: "Saúde", sections: ["saude"] },
};
const ZERAO_LEGACY_PAGES = { inicio: "visao-geral", alimentacao: "nutricao", suplementacao: "nutricao", shape: "progresso" };

function currentPage() {
  const id = decodeURIComponent(window.location.hash.replace(/^#\/?/, ""));
  if (ZERAO_PAGES[id]) return id;
  return ZERAO_LEGACY_PAGES[id] ?? "visao-geral";
}

function showPage() {
  const page = currentPage();
  document.body.dataset.page = page;
  document.querySelectorAll("main > section").forEach((section) => {
    section.hidden = !ZERAO_PAGES[page].sections.includes(section.id);
  });
  const nav = document.querySelector(".module-nav > div");
  document.querySelectorAll(".module-nav a").forEach((link) => {
    const active = link.getAttribute("href") === `#/${page}`;
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

window.addEventListener("hashchange", showPage);
showPage();
