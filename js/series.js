const params = new URLSearchParams(window.location.search);
const id = (params.get("id") || "").replace(/\D/g, "");
const page = document.getElementById("movie-page");

const STATUS = {
  "Returning Series": "Davom etmoqda",
  "Ended": "Tugagan",
  "Canceled": "Bekor qilingan",
  "In Production": "Ishlab chiqarilmoqda",
  "Planned": "Rejalashtirilgan"
};

async function loadSeries() {
  if (!id) {
    page.innerHTML = "<p>Serial topilmadi</p>";
    return;
  }

  try {
    const tv = await api(
      `/tv/${id}`,
      "&append_to_response=videos,similar,credits&include_video_language=ru,en,null"
    );

    // Tavsif tilda yo'q bo'lsa, inglizchasini olamiz
    if (!tv.overview) {
      try {
        const en = await fetch(`${BASE_URL}/tv/${id}?api_key=${API_KEY}&language=en-US`).then(function (r) {
          return r.json();
        });
        tv.overview = en.overview || "";
      } catch (e) {}
    }

    renderSeries(tv);
  } catch (error) {
    console.error(error);
    page.innerHTML = "<p>Serialni yuklab bo'lmadi</p>";
  }
}

function countryNames(codes) {
  let names = null;
  try { names = new Intl.DisplayNames(["uz"], { type: "region" }); } catch (e) {}
  return (codes || []).map(function (c) {
    try { return (names && names.of(c)) || c; } catch (e) { return c; }
  }).join(", ");
}

function renderSeries(tv) {
  const item = tvToItem(tv);
  document.title = item.title + " | oracle.uz";

  const year = tv.first_air_date ? tv.first_air_date.slice(0, 4) : "—";
  const genres = (tv.genres || []).map(function (g) { return escHtml(g.name); }).join(", ");
  const rating = Number(tv.vote_average || 0).toFixed(1);
  const runtime = (tv.episode_run_time || [])[0];
  const creators = (tv.created_by || []).map(function (c) { return c.name; }).join(", ");

  const backdrop = tv.backdrop_path
    ? `<div class="backdrop" style="background-image: url('${IMG_BACK + tv.backdrop_path}')"></div>`
    : "";

  const poster = tv.poster_path
    ? `<img data-aos="fade-right" src="${IMG_BIG + tv.poster_path}" alt="${escHtml(item.title)}">`
    : `<div class="poster"></div>`;

  const trailer = ((tv.videos && tv.videos.results) || []).find(function (v) {
    return v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser");
  });
  const trailerHtml = trailer
    ? `<h3>Treyler</h3>
       <div class="trailer">
         <iframe src="https://www.youtube.com/embed/${trailer.key}" allowfullscreen></iframe>
       </div>`
    : `<p class="no-trailer">Bu serial uchun treyler topilmadi.</p>`;

  const facts = [
    ["Yaratuvchi", escHtml(creators)],
    ["Davlat", escHtml(countryNames(tv.origin_country))],
    ["Holati", STATUS[tv.status] || escHtml(tv.status || "")],
    ["Fasllar", tv.number_of_seasons ? String(tv.number_of_seasons) : ""],
    ["Qismlar", tv.number_of_episodes ? String(tv.number_of_episodes) : ""],
    ["Qism davomiyligi", runtime ? runtime + " daq" : ""],
    ["Reyting", `⭐ ${rating}` + (tv.vote_count ? ` (${tv.vote_count} ovoz)` : "")]
  ].filter(function (f) { return f[1]; });

  const factsHtml = facts.map(function (f) {
    return `<div class="fact"><span>${f[0]}</span><strong>${f[1]}</strong></div>`;
  }).join("");

  // Fasllar (0-fasl "Maxsus qismlar" ham chiqadi)
  const seasons = (tv.seasons || []).filter(function (s) { return s.episode_count > 0; });
  const seasonsHtml = seasons.length
    ? `<section class="cast-section" data-aos="fade-up">
         <h2>Fasllar</h2>
         <div class="cast-row">
           ${seasons.map(function (s) {
             const img = s.poster_path
               ? `<img src="${IMG_URL + s.poster_path}" alt="${escHtml(s.name)}" loading="lazy">`
               : `<div class="poster"></div>`;
             const y = s.air_date ? s.air_date.slice(0, 4) + " · " : "";
             return `<div class="season-card">
               ${img}
               <strong>${escHtml(s.name)}</strong>
               <span>${y}${s.episode_count} qism</span>
             </div>`;
           }).join("")}
         </div>
       </section>`
    : "";

  const cast = ((tv.credits && tv.credits.cast) || [])
    .filter(function (p) { return p.profile_path; })
    .slice(0, 15);
  const castHtml = cast.length
    ? `<section class="cast-section" data-aos="fade-up">
         <h2>Aktyorlar</h2>
         <div class="cast-row">
           ${cast.map(function (p) {
             return `<div class="cast-card">
               <img src="${IMG_URL + p.profile_path}" alt="${escHtml(p.name)}" loading="lazy">
               <strong>${escHtml(p.name)}</strong>
               <span>${escHtml(p.character || "")}</span>
             </div>`;
           }).join("")}
         </div>
       </section>`
    : "";

  const similar = ((tv.similar && tv.similar.results) || [])
    .filter(function (m) { return m.poster_path; })
    .slice(0, 12);
  const similarHtml = similar.length
    ? `<section class="row-section similar" data-aos="fade-up">
         <div class="row-head">
           <h2>O'xshash seriallar</h2>
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
        <h2>${escHtml(item.title)}</h2>
        <p class="meta">${year}${genres ? " · " + genres : ""}</p>
        <button id="movie-fav" class="movie-fav" type="button"></button>
        <div class="facts">${factsHtml}</div>
        <p class="overview">${escHtml(tv.overview) || "Tavsif hozircha yo'q."}</p>
        ${trailerHtml}
      </div>
    </div>
    ${seasonsHtml}
    ${castHtml}
    ${similarHtml}
  `;

  const favBtn = document.getElementById("movie-fav");
  function updateFavBtn() {
    favBtn.textContent = isFavorite(item.id, "tv")
      ? "♥ Sevimlilarda"
      : "♡ Sevimlilarga qo'shish";
  }
  updateFavBtn();
  favBtn.addEventListener("click", function () {
    toggleFavorite(item);
    updateFavBtn();
  });

  const row = document.getElementById("similar-row");
  if (row) {
    similar.forEach(function (m) {
      row.appendChild(createCard(tvToItem(m)));
    });
    setupArrows(row.closest(".similar"));
  }

  if (window.AOS) AOS.refreshHard();
}

loadSeries();