const grid = document.getElementById("movie-grid");
const titleEl = document.getElementById("grid-title");
const pagination = document.getElementById("pagination");
const tabButtons = document.querySelectorAll(".tab");

const TABS = {
  popular: { title: "Mashhur seriallar", path: "/tv/popular" },
  top: { title: "Eng yuqori reyting seriallar", path: "/tv/top_rated" },
  air: { title: "Efirdagi seriallar", path: "/tv/on_the_air" }
};
const MAX_PAGES = 500;

const startTab = (new URLSearchParams(location.search).get("tab") || "").replace(/[^a-z]/g, "");
let currentTab = TABS[startTab] ? startTab : "popular";
let currentPage = 1;
let totalPages = 1;
let requestId = 0;

function showSkeleton() {
  grid.innerHTML = "";
  for (let i = 0; i < 12; i++) {
    const s = document.createElement("div");
    s.className = "card skeleton";
    s.innerHTML = '<div class="poster"></div><div class="line"></div><div class="line short"></div>';
    grid.appendChild(s);
  }
}

async function loadSeries(page) {
  const myId = ++requestId;
  const tab = TABS[currentTab];
  titleEl.textContent = tab.title;
  tabButtons.forEach(function (b) {
    b.classList.toggle("active", b.dataset.tab === currentTab);
  });

  showSkeleton();
  pagination.innerHTML = "";

  try {
    const data = await api(tab.path, "&page=" + page);
    if (myId !== requestId) return;

    currentPage = data.page;
    totalPages = Math.min(data.total_pages, MAX_PAGES);

    grid.innerHTML = "";
    data.results.forEach(function (t, i) {
      const wrap = document.createElement("div");
      wrap.setAttribute("data-aos", "fade-up");
      wrap.setAttribute("data-aos-delay", (i % 6) * 60);
      wrap.appendChild(createCard(tvToItem(t)));
      grid.appendChild(wrap);
    });
    if (window.AOS) AOS.refreshHard();

    renderPagination();
  } catch (error) {
    if (myId !== requestId) return;
    console.error(error);
    grid.innerHTML = '<p class="status">Seriallarni yuklab bo\'lmadi</p>';
  }
}

function pageButton(label, page, className) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "page-btn" + (className ? " " + className : "");
  btn.textContent = label;
  btn.addEventListener("click", function () {
    loadSeries(page);
    titleEl.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  return btn;
}

function renderPagination() {
  pagination.innerHTML = "";
  if (totalPages <= 1) return;

  const spread = window.innerWidth < 600 ? 1 : 2;
  const pages = [];
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || Math.abs(p - currentPage) <= spread) pages.push(p);
  }

  const prev = pageButton("‹", currentPage - 1);
  prev.disabled = currentPage === 1;
  pagination.appendChild(prev);

  let last = 0;
  pages.forEach(function (p) {
    if (p - last > 1) {
      const dots = document.createElement("span");
      dots.className = "page-dots";
      dots.textContent = "…";
      pagination.appendChild(dots);
    }
    pagination.appendChild(pageButton(p, p, p === currentPage ? "active" : ""));
    last = p;
  });

  const next = pageButton("›", currentPage + 1);
  next.disabled = currentPage === totalPages;
  pagination.appendChild(next);
}

tabButtons.forEach(function (b) {
  b.addEventListener("click", function () {
    currentTab = b.dataset.tab;
    history.replaceState(null, "", "series.html?tab=" + currentTab);
    loadSeries(1);
  });
});

loadSeries(1);