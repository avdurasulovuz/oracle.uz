const grid = document.getElementById("movie-grid");

function render() {
  const list = getFavorites();
  grid.innerHTML = "";

  if (list.length === 0) {
    grid.innerHTML =
      '<p class="status">Hali sevimli kino yo\'q. Kartochkadagi ♡ ni bosing.</p>';
    return;
  }

  list.forEach(function (movie) {
    grid.appendChild(createCard(movie, render));
  });
}

render();