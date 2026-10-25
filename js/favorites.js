const FAV_KEY = "oracle_favorites";

// Saqlangan ro'yxatni olish
function getFavorites() {
  try {
    return JSON.parse(localStorage.getItem(FAV_KEY)) || [];
  } catch (error) {
    return [];
  }
}

// Ro'yxatni saqlash
function saveFavorites(list) {
  localStorage.setItem(FAV_KEY, JSON.stringify(list));
}

// Bu kino sevimlilarda bormi?
function isFavorite(id) {
  return getFavorites().some(function (m) {
    return m.id === id;
  });
}

// Qo'shish yoki olib tashlash. Natija: endi sevimlimi (true/false)
function toggleFavorite(movie) {
  const list = getFavorites();
  const index = list.findIndex(function (m) {
    return m.id === movie.id;
  });

  if (index === -1) {
    list.push({
      id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path,
      release_date: movie.release_date,
      vote_average: movie.vote_average
    });
  } else {
    list.splice(index, 1);
  }

  saveFavorites(list);
  return index === -1;
}