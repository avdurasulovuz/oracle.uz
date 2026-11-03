// Matnni HTMLga xavfsiz qo'yish
function escHtml(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

// TMDB serialini kino shakliga keltiradi (name -> title, first_air_date -> release_date)
function tvToItem(t) {
  return Object.assign({}, t, {
    type: "tv",
    title: t.name || t.original_name || "",
    release_date: t.first_air_date || ""
  });
}

function setHeart(btn, active) {
  btn.textContent = active ? "♥" : "♡";
  btn.classList.toggle("active", active);
}

// Kino yoki serial kartochkasi (item.type === "tv" bo'lsa serial)
function createCard(movie, onToggle) {
  const type = movie.type || "movie";
  const page = type === "tv" ? "series-page.html" : "movie.html";
  const year = movie.release_date ? movie.release_date.slice(0, 4) : "—";
  const ratingHtml = movie.vote_average > 0
    ? `<span>⭐ ${Number(movie.vote_average).toFixed(1)}</span>`
    : "";

  const poster = movie.poster_path
    ? `<img src="${IMG_URL + movie.poster_path}" alt="${escHtml(movie.title)}">`
    : `<div class="poster"></div>`;

  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML = `
    <a class="card-link" href="${page}?id=${movie.id}">
      ${poster}
      <h3>${escHtml(movie.title)}</h3>
      <p>${year}</p>
      ${ratingHtml}
    </a>
    <button class="fav-btn" type="button" aria-label="Sevimlilarga qo'shish"></button>
  `;

  const btn = card.querySelector(".fav-btn");
  setHeart(btn, isFavorite(movie.id, type));

  btn.addEventListener("click", function () {
    const now = toggleFavorite(movie);
    setHeart(btn, now);
    if (onToggle) onToggle(movie, now);
  });

  return card;
}

function setupArrows(section) {
  const track = section.querySelector(".row");

  section.querySelectorAll(".arrow").forEach(function (btn) {
    btn.addEventListener("click", function () {
      track.scrollBy({
        left: Number(btn.dataset.dir) * track.clientWidth * 0.8,
        behavior: "smooth"
      });
    });
  });
}