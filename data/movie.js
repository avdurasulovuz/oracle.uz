// 1. MANZILDAN id NI O'QISH
const params = new URLSearchParams(window.location.search);
const id = params.get("id");
const page = document.getElementById("movie-page");

// Matnni HTMLga xavfsiz qo'yish uchun
function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

// 2. KINONI YUKLASH
async function loadMovie() {
  if (!id) {
    page.innerHTML = "<p>Kino topilmadi</p>";
    return;
  }

  try {
    const movie = await api(
      `/movie/${id}`,
      "&append_to_response=videos,similar,translations,credits&include_video_language=ru,en,null"
    );
    renderMovie(movie);
  } catch (error) {
    console.error(error);
    page.innerHTML = "<p>Kinoni yuklab bo'lmadi</p>";
  }
}

// 3. NOM VA TAVSIFNI TANLASH: o'zbekcha -> ruscha -> asosiy
function pickText(movie) {
  const list = (movie.translations && movie.translations.translations) || [];

  function byLang(code) {
    return list.find(function (t) {
      return t.iso_639_1 === code;
    });
  }

  const uz = byLang("uz");
  const ru = byLang("ru");

  const movieTitle = (uz && uz.data.title) || movie.title;
  const overview =
    (uz && uz.data.overview) ||
    (ru && ru.data.overview) ||
    movie.overview ||
    "";

  return { title: movieTitle, overview: overview };
}

// Davomiyligi: 142 -> "2 s 22 daq"
function formatRuntime(min) {
  if (!min) return "";
  const h = Math.floor(min / 60);
  const m = min % 60;
  return (h ? h + " s " : "") + (m ? m + " daq" : "");
}

// Davlat nomi o'zbekcha (brauzer qo'llasa), bo'lmasa inglizcha
function countryNames(list) {
  let names;
  try {
    names = new Intl.DisplayNames(["uz"], { type: "region" });
  } catch (e) {
    names = null;
  }
  return (list || []).map(function (c) {
    try {
      return (names && names.of(c.iso_3166_1)) || c.name;
    } catch (e) {
      return c.name;
    }
  }).join(", ");
}

// 4. EKRANGA CHIQARISH
function renderMovie(movie) {
  const text = pickText(movie);
  document.title = text.title + " — oracle";

  const year = movie.release_date ? movie.release_date.slice(0, 4) : "—";
  const genres = movie.genres.map(function (g) { return esc(g.name); }).join(", ");
  const rating = movie.vote_average.toFixed(1);
  const runtime = formatRuntime(movie.runtime);
  const countries = countryNames(movie.production_countries);

  const credits = movie.credits || { cast: [], crew: [] };
  const director = credits.crew.find(function (p) { return p.job === "Director"; });
  const cast = credits.cast
    .filter(function (p) { return p.profile_path; })
    .slice(0, 15);

  const backdrop = movie.backdrop_path
    ? `<div class="backdrop" style="background-image: url('${IMG_BACK + movie.backdrop_path}')"></div>`
    : "";

  const poster = movie.poster_path
    ? `<img data-aos="fade-right" src="${IMG_BIG + movie.poster_path}" alt="${esc(text.title)}">`
    : `<div class="poster"></div>`;

  const trailer = movie.videos.results.find(function (v) {
    return v.site === "YouTube" && v.type === "Trailer";
  });

  const trailerHtml = trailer
    ? `<h3>Treyler</h3>
       <div class="trailer">
         <iframe src="https://www.youtube.com/embed/${trailer.key}" allowfullscreen></iframe>
       </div>`
    : `<p class="no-trailer">Bu kino uchun treyler topilmadi.</p>`;

  // Qo'shimcha ma'lumotlar jadvali
  const facts = [
    ["Rejissyor", director ? esc(director.name) : ""],
    ["Davlat", esc(countries)],
    ["Davomiyligi", runtime],
    ["Reyting", `⭐ ${rating}` + (movie.vote_count ? ` (${movie.vote_count} ovoz)` : "")]
  ].filter(function (f) { return f[1]; });

  const factsHtml = facts.map(function (f) {
    return `<div class="fact"><span>${f[0]}</span><strong>${f[1]}</strong></div>`;
  }).join("");

  // Aktyorlar
  const castHtml = cast.length
    ? `<section class="cast-section" data-aos="fade-up">
         <h2>Aktyorlar</h2>
         <div class="cast-row">
           ${cast.map(function (p) {
             return `<div class="cast-card">
               <img src="${IMG_URL + p.profile_path}" alt="${esc(p.name)}" loading="lazy">
               <strong>${esc(p.name)}</strong>
               <span>${esc(p.character || "")}</span>
             </div>`;
           }).join("")}
         </div>
       </section>`
    : "";

  // O'xshash kinolar: posteri borlari, eng ko'pi bilan 12 ta
  const similar = movie.similar.results
    .filter(function (m) { return m.poster_path; })
    .slice(0, 12);

  const similarHtml = similar.length
    ? `<section class="row-section similar" data-aos="fade-up">
         <div class="row-head">
           <h2>O'xshash kinolar</h2>
           <div class="row-arrows">
             <button class="arrow" type="button" data-dir="-1" aria-label="Orqaga">‹</button>
             <button class="arrow" type="button" data-dir="1" aria-label="Oldinga">›</button>
           </div>
         </div>
         <div class="row" id="similar-row"></div>
       </section>`
    : "";

  page.innerHTML = `
    ${backdrop}
    <div class="movie">
      ${poster}
      <div class="movie-info" data-aos="fade-left">
        <h2>${esc(text.title)}</h2>
        <p class="meta">${year}${genres ? " · " + genres : ""}</p>
        <button id="movie-fav" class="movie-fav" type="button"></button>
        <div class="facts">${factsHtml}</div>
        <p class="overview">${esc(text.overview) || "Tavsif hozircha yo'q."}</p>
        ${trailerHtml}
      </div>
    </div>
    ${castHtml}
    ${similarHtml}
  `;

  // SEVIMLILAR TUGMASI
  const favBtn = document.getElementById("movie-fav");

  function updateFavBtn() {
    favBtn.textContent = isFavorite(movie.id)
      ? "♥ Sevimlilarda"
      : "♡ Sevimlilarga qo'shish";
  }

  updateFavBtn();

  favBtn.addEventListener("click", function () {
    toggleFavorite(movie);
    updateFavBtn();
  });

  // O'XSHASH KINOLARNI QATORGA JOYLASH
  const row = document.getElementById("similar-row");
  if (row) {
    similar.forEach(function (m) {
      row.appendChild(createCard(m));
    });
    setupArrows(row.closest(".similar"));
  }

  if (window.AOS) AOS.refreshHard();
}

// 5. ISHGA TUSHIRISH
loadMovie();