const heroEl = document.getElementById("hero");
const heroSlides = document.getElementById("hero-slides");
const heroDots = document.getElementById("hero-dots");

let heroIndex = 0;
let heroTimer;

// 1. MA'LUMOT OLISH
async function loadHero() {
  try {
    const data = await api("/trending/movie/week");
    const list = data.results
      .filter(function (m) { return m.backdrop_path; })
      .slice(0, 5);

    if (list.length === 0) {
      heroEl.style.display = "none";
      return;
    }
    renderHero(list);
  } catch (error) {
    console.error(error);
    heroEl.style.display = "none";
  }
}

// 2. SLAYDLAR VA NUQTALARNI YASASH
function renderHero(list) {
  heroSlides.innerHTML = "";
  heroDots.innerHTML = "";

  list.forEach(function (movie, i) {
    const year = movie.release_date ? movie.release_date.slice(0, 4) : "";
    const rating = movie.vote_average > 0
      ? "⭐ " + movie.vote_average.toFixed(1)
      : "";
    const meta = [year, rating].filter(Boolean).join(" · ");

    const slide = document.createElement("div");
    slide.className = "hero-slide";
    slide.style.backgroundImage = `url('${IMG_BACK + movie.backdrop_path}')`;
    slide.innerHTML = `
      <div class="hero-content">
        <p class="hero-meta">${meta}</p>
        <h2>${movie.title}</h2>
        <p class="hero-overview">${movie.overview || ""}</p>
        <a class="btn" href="movie.html?id=${movie.id}">Batafsil</a>
      </div>
    `;
    heroSlides.appendChild(slide);

    const dot = document.createElement("button");
    dot.className = "hero-dot";
    dot.type = "button";
    dot.setAttribute("aria-label", "Slayd " + (i + 1));
    dot.addEventListener("click", function () {
      showSlide(i);
      startHeroTimer();
    });
    heroDots.appendChild(dot);
  });

  showSlide(0);
  startHeroTimer();
}

// 3. BITTA SLAYDNI KO'RSATISH
function showSlide(i) {
  const slides = heroSlides.children;
  const dots = heroDots.children;
  heroIndex = i;

  for (let k = 0; k < slides.length; k++) {
    slides[k].classList.toggle("active", k === i);
    dots[k].classList.toggle("active", k === i);
  }
}

// 4. AVTOMATIK O'TISH
function startHeroTimer() {
  clearInterval(heroTimer);

  // Animatsiyani yoqtirmaydigan foydalanuvchilarga o'zi almashmaydi
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  heroTimer = setInterval(function () {
    showSlide((heroIndex + 1) % heroSlides.children.length);
  }, 6000);
}

// Sichqoncha ustida turganda to'xtaydi
heroEl.addEventListener("mouseenter", function () {
  clearInterval(heroTimer);
});
heroEl.addEventListener("mouseleave", startHeroTimer);

// 5. ISHGA TUSHIRISH
loadHero();