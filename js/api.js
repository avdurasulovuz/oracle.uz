const API_KEY = "e1c0eeec5fb722091f433c3fe732f4fa";
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_URL = "https://image.tmdb.org/t/p/w342";
const IMG_BIG = "https://image.tmdb.org/t/p/w500";
const IMG_BACK = "https://image.tmdb.org/t/p/w1280";

// MATN TILI: faqat shu yerda o'zgartiriladi (butun sayt shundan foydalanadi)
const LANG = "en-US";

// Har safar fetch yozmaslik uchun bitta yordamchi funksiya
async function api(path, extra = "") {
  const response = await fetch(
    `${BASE_URL}${path}?api_key=${API_KEY}&language=${LANG}${extra}`
  );
  if (!response.ok) {
    throw new Error("Server xatosi: " + response.status);
  }
  return response.json();
}

// JANRLAR: TMDB kinolar uchun doimiy ro'yxat
const GENRES = [
  { id: 28, name: "Jangari" },
  { id: 12, name: "Sarguzasht" },
  { id: 16, name: "Multfilm" },
  { id: 35, name: "Komediya" },
  { id: 80, name: "Kriminal" },
  { id: 99, name: "Hujjatli" },
  { id: 18, name: "Drama" },
  { id: 10751, name: "Oilaviy" },
  { id: 14, name: "Fentezi" },
  { id: 36, name: "Tarixiy" },
  { id: 27, name: "Qo'rqinchli" },
  { id: 10402, name: "Musiqiy" },
  { id: 9648, name: "Detektiv" },
  { id: 10749, name: "Melodrama" },
  { id: 878, name: "Fantastika" },
  { id: 53, name: "Triller" },
  { id: 10752, name: "Harbiy" },
  { id: 37, name: "Vestern" }
];

// TO'PLAMLAR: mavzuli kinolar to'plami.
// query: TMDB qidiruv shartlari. "," degani "va", %7C degani "yoki"
const COLLECTIONS = [
  {
    slug: "action-thriller",
    title: "Jangari va triller kechasi",
    text: "Quvish, portlash va kutilmagan burilishlarga boy kinolar.",
    query: "&with_genres=28,53"
  },
  {
    slug: "family-animation",
    title: "Oilaviy multfilmlar",
    text: "Butun oila birga ko'radigan quvnoq va mehrli multfilmlar.",
    query: "&with_genres=16,10751"
  },
  {
    slug: "horror",
    title: "Qo'rqinchli kechalar",
    text: "Chiroqni o'chirib ko'rishga jur'at etsangiz.",
    query: "&with_genres=27"
  },
  {
    slug: "scifi-fantasy",
    title: "Fantastika olami",
    text: "Kelajak, koinot va sehrli dunyolar haqidagi hikoyalar.",
    query: "&with_genres=878%7C14"
  },
  {
    slug: "detective-crime",
    title: "Detektiv va jinoyat",
    text: "Sirli voqealar, tergov va jinoyatchilarni qidirish.",
    query: "&with_genres=9648%7C80"
  },
  {
    slug: "history-war",
    title: "Tarix va urush",
    text: "Haqiqiy voqealar va katta janglar asosidagi kuchli kinolar.",
    query: "&with_genres=36%7C10752"
  }
];

// To'plam so'rovini bir joyda yig'amiz (bosh sahifa ham, to'plam sahifasi ham shuni ishlatadi)
function collectionQuery(c) {
  return c.query + "&sort_by=popularity.desc&vote_count.gte=50";
}