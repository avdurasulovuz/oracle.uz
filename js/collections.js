const collectionsEl = document.getElementById("collections");

// Bitta to'plam kartochkasi: avval bo'sh joy band qilinadi (tartib saqlanadi),
// keyin ma'lumot kelganda to'ldiriladi
async function buildCollection(c) {
  const card = document.createElement("a");
  card.className = "collection";
  card.href = `index.html?collection=${c.slug}`;
  collectionsEl.appendChild(card);

  try {
    const data = await api("/discover/movie", collectionQuery(c) + "&page=1");

    // Kollaj uchun posteri bor eng mashhur 5 ta kino
    const posters = data.results
      .filter(function (m) { return m.poster_path; })
      .slice(0, 5)
      .map(function (m) {
        return `<img src="${IMG_URL + m.poster_path}" alt="" loading="lazy">`;
      })
      .join("");

    // 3427 -> "3 427"
    const count = String(data.total_results).replace(/\B(?=(\d{3})+(?!\d))/g, " ");

    card.innerHTML = `
      <div class="collage">${posters}</div>
      <div class="collection-body">
        <h3>${c.title}</h3>
        <p>${c.text}</p>
        <span class="collection-count">${count} ta kontent ›</span>
      </div>
    `;
  } catch (error) {
    console.error(error);
    card.remove();
  }
}

COLLECTIONS.forEach(buildCollection);