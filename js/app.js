const grid = document.getElementById("movie-grid");
const title = document.getElementById("grid-title");
const searchInput = document.getElementById("search");
const pagination = document.getElementById("pagination");
const homeSections = document.getElementById("home-sections");
const homeBottom = document.getElementById("home-bottom");

// MANZILDAN FILTRNI O'QISH:
// index.html?genre=28  |  ?year=2024  |  ?collection=horror
// Begona belgilar tozalanadi (manzilga nima yozishsa ham xavfsiz)
const urlParams = new URLSearchParams(window.location.search);
const genreParam = (urlParams.get("genre") || "").replace(/\D/g, "");
const yearParam = (urlParams.get("year") || "").replace(/\D/g, "");
const collectionParam = (urlParams.get("collection") || "").replace(/[^a-z-]/g, "");

const collection = COLLECTIONS.find(function (c) {
  return c.slug === collectionParam;
});

const isFiltered = Boolean(genreParam || yearParam || collection);

// TMDB 500-sahifadan keyingisini bermaydi
const MAX_PAGES = 500;

// HOLAT (state)
let currentPage = 1;
let totalPages = 1;
let requestId = 0;

// 1. FILTR SARLAVHASI: "2024-yil · Jangari kinolari"
function filterTitle() {
  const genre = GENRES.find(function (g) {
    return String(g.id) === genreParam;
  });
  const parts = [];
  if (yearParam) parts.push(yearParam + "-yil");
  if (genre) parts.push(genre.name);
  return parts.join(" · ") + " kinolari";
}

// 2. KINOLARNI YUKLASH (aynan shu sahifani so'raydi va to'rni almashtiradi)
async function loadMovies(page = 1) {
  const myId = ++requestId;
  const query = searchInput.value.trim();

  // Banner, qatorlar va to'plamlar faqat toza bosh sahifada ko'rinadi
  const hideHome = Boolean(query || isFiltered);
  homeSections.hidden = hideHome;
  homeBottom.hidden = hideHome;

  let path;
  let extra;

  if (query) {
    path = "/search/movie";
    extra = `&query=${encodeURIComponent(query)}`;
    title.textContent = `Qidiruv: "${query}"`;
  } else if (collection) {
    path = "/discover/movie";
    extra = collectionQuery(collection);
    title.textContent = collection.title;
  } else if (isFiltered) {
    path = "/discover/movie";
    extra = "&sort_by=popularity.desc";
    if (genreParam) extra += `&with_genres=${genreParam}`;
    if (yearParam) extra += `&primary_release_year=${yearParam}`;
    title.textContent = filterTitle();
    } else {
    path = "/movie/top_rated";
    extra = "";
    title.textContent = "Eng yuqori reyting";
  }

  showSkeleton();
  pagination.innerHTML = "";

  try {
    const data = await api(path, `${extra}&page=${page}`);

    // Eskirgan javobni tashlab yuboramiz
    if (myId !== requestId) return;

    currentPage = data.page;
    totalPages = Math.min(data.total_pages, MAX_PAGES);
    renderMovies(data.results);
    renderPagination();
  } catch (error) {
    if (myId !== requestId) return;
    console.error(error);
    grid.innerHTML = '<p class="status">Kinolarni yuklab bo\'lmadi</p>';
  }
}

// 3. YUKLANISH PAYTIDA KO'RINADIGAN BO'SH KARTOCHKALAR
function showSkeleton() {
  grid.innerHTML = "";
  for (let i = 0; i < 12; i++) {
    const s = document.createElement("div");
    s.className = "card skeleton";
    s.innerHTML = `
      <div class="poster"></div>
      <div class="line"></div>
      <div class="line short"></div>
    `;
    grid.appendChild(s);
  }
}

// 4. EKRANGA CHIQARISH
function renderMovies(list) {
  grid.innerHTML = "";

  if (list.length === 0) {
    grid.innerHTML = '<p class="status">Hech narsa topilmadi</p>';
    return;
  }

  list.forEach(function (movie, i) {
    const wrap = document.createElement("div");
    wrap.setAttribute("data-aos", "fade-up");
    wrap.setAttribute("data-aos-delay", (i % 6) * 60);
    wrap.appendChild(createCard(movie));
    grid.appendChild(wrap);
  });

  if (window.AOS) AOS.refreshHard();
}

// 5. SAHIFALASH: ‹ 1 … 5 6 [7] 8 9 … 500 ›
function pageButton(label, page, className) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "page-btn" + (className ? " " + className : "");
  btn.textContent = label;
  btn.addEventListener("click", function () {
    goToPage(page);
  });
  return btn;
}

function renderPagination() {
  pagination.innerHTML = "";
  if (totalPages <= 1) return;

  // Telefonda joriy sahifaning har yonida 1 tadan, kompyuterda 2 tadan
  const spread = window.innerWidth < 600 ? 1 : 2;

  // Qaysi sahifalar ko'rsatiladi: birinchi, oxirgi va joriy atrofidagilar
  const pages = [];
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || Math.abs(p - currentPage) <= spread) {
      pages.push(p);
    }
  }

  // Orqaga tugmasi
  const prev = pageButton("‹", currentPage - 1);
  prev.disabled = currentPage === 1;
  pagination.appendChild(prev);

  // Raqamlar; orada tushib qolgan sahifalar bo'lsa "…" qo'yamiz
  let last = 0;
  pages.forEach(function (p) {
    if (p - last > 1) {
      const dots = document.createElement("span");
      dots.className = "page-dots";
      dots.textContent = "…";
      pagination.appendChild(dots);
    }
    pagination.appendChild(
      pageButton(p, p, p === currentPage ? "active" : "")
    );
    last = p;
  });

  // Oldinga tugmasi
  const next = pageButton("›", currentPage + 1);
  next.disabled = currentPage === totalPages;
  pagination.appendChild(next);
}

function goToPage(page) {
  loadMovies(page);
  title.scrollIntoView({ behavior: "smooth", block: "start" });
}

// 6. HODISALAR
let timer;

searchInput.addEventListener("input", function () {
  clearTimeout(timer);
  timer = setTimeout(function () {
    loadMovies(1);
  }, 400);
});

// 7. ISHGA TUSHIRISH
loadMovies(1);