// Yurakcha belgisini va rangini o'rnatish
function setHeart(btn, active) {
  btn.textContent = active ? "♥" : "♡";
  btn.classList.toggle("active", active);
}

// Bitta kino kartochkasini yasab qaytaradi
// onToggle: yurakcha bosilgandan keyin chaqiriladigan funksiya (ixtiyoriy)
function createCard(movie, onToggle) {
  const year = movie.release_date ? movie.release_date.slice(0, 4) : "—";
  const rating = Number(movie.vote_average || 0).toFixed(1);
  const ratingHtml = movie.vote_average > 0
    ? `<span>⭐ ${rating}</span>`
    : "";

  const poster = movie.poster_path
    ? `<img src="${IMG_URL + movie.poster_path}" alt="${movie.title}">`
    : `<div class="poster"></div>`;

  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML = `
    <a class="card-link" href="movie.html?id=${movie.id}">
      ${poster}
      <h3>${movie.title}</h3>
      <p>${year}</p>
      <span>⭐ ${rating}</span>
    </a>
    <button class="fav-btn" type="button" aria-label="Sevimlilarga qo'shish"></button>
  `;

  const btn = card.querySelector(".fav-btn");
  setHeart(btn, isFavorite(movie.id));

  btn.addEventListener("click", function () {
    const now = toggleFavorite(movie);
    setHeart(btn, now);
    if (onToggle) onToggle(movie, now);
  });

  return card;
}

// Gorizontal qatordagi ‹ › tugmalarini ishga tushiradi.
// section: ichida .row (kartochkalar yo'li) va .arrow tugmalari bor element
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