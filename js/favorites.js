const FAV_KEY = "oracle_favorites";

function getFavorites() {
  try {
    return JSON.parse(localStorage.getItem(FAV_KEY)) || [];
  } catch (error) {
    return [];
  }
}

function saveFavorites(list) {
  localStorage.setItem(FAV_KEY, JSON.stringify(list));
}

// type: "movie" (standart) yoki "tv"
function isFavorite(id, type) {
  const t = type || "movie";
  return getFavorites().some(function (m) {
    return m.id === id && (m.type || "movie") === t;
  });
}

// Qo'shish yoki olib tashlash. Natija: endi sevimlimi (true/false)
function toggleFavorite(item) {
  const type = item.type || "movie";
  const list = getFavorites();
  const index = list.findIndex(function (m) {
    return m.id === item.id && (m.type || "movie") === type;
  });

  if (index === -1) {
    list.push({
      id: item.id,
      type: type,
      title: item.title,
      poster_path: item.poster_path,
      release_date: item.release_date,
      vote_average: item.vote_average
    });
  } else {
    list.splice(index, 1);
  }

  saveFavorites(list);
  return index === -1;
}