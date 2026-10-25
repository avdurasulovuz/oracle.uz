// 1. MANZILDAN id NI O'QISH
const params = new URLSearchParams(window.location.search);
const id = params.get("id");
const page = document.getElementById("movie-page");

// 2. KINONI YUKLASH
async function loadMovie() {
  if (!id) {
    page.innerHTML = "<p>Kino topilmadi</p>";
    return;
  }

  try {
    const movie = await api(
      `/movie/${id}`,
      "&append_to_response=videos,similar,translations&include_video_language=ru,en,null"
    );
    renderMovie(movie);
  } catch (error) {
    console.error(error);
    page.innerHTML = "<p>Kinoni yuklab bo'lmadi</p>";
  }
}

// 3. NOM VA TAVSIFNI TANLASH: o'zbekcha -> ruscha -> asosiy (inglizcha)
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

// 4. EKRANGA CHIQARISH
function renderMovie(movie) {
  const text = pickText(movie);
  document.title = text.title + " — oracle";

  const year = movie.release_date ? movie.release_date.slice(0, 4) : "—";
  const genres = movie.genres.map(function (g) { return g.name; }).join(", ");
  const rating = movie.vote_average.toFixed(1);

  const backdrop = movie.backdrop_path
    ? `<div class="backdrop" style="background-image: url('${IMG_BACK + movie.backdrop_path}')"></div>`
    : "";

  const poster = movie.poster_path
    ? `<img data-aos="fade-right" src="${IMG_BIG + movie.poster_path}" alt="${text.title}">`
    : `<div class="poster"></div>`;

  const trailer = movie.videos.results.find(function (v) {
    return v.site === "YouTube" && v.type === "Trailer";
  });

  const trailerHtml = trailer
    ? `<h3>Treyler</h3>
       <div class="trailer">
         <iframe src="https://www.youtube.com/embed/${trailer.key}" allowfullscreen></iframe>
       </div>`
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
        <h2>${text.title}</h2>
        <p class="meta">${year} · ${genres} · ${movie.runtime} daq · ⭐ ${rating}</p>
        <button id="movie-fav" class="movie-fav" type="button"></button>
        <p class="overview">${text.overview || "Tavsif hozircha yo'q."}</p>
        ${trailerHtml}
      </div>
    </div>
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
}

// 5. ISHGA TUSHIRISH
loadMovie();