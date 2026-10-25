const rowsEl = document.getElementById("rows");

// Qatorlar ro'yxati: nomi, TMDB manzili, qo'shimcha parametr
const ROW_LIST = [
  { title: "Premyeralar", path: "/movie/now_playing" },
];

// 1. BITTA QATORNING BO'SH QOLIPINI YASASH
function buildRow(info) {
  const section = document.createElement("section");
  section.className = "row-section";
  section.setAttribute("data-aos", "fade-up");
  section.innerHTML = `
    <div class="row-head">
      <h2>${info.title}</h2>
      <div class="row-arrows">
        <button class="arrow" type="button" data-dir="-1" aria-label="Orqaga">‹</button>
        <button class="arrow" type="button" data-dir="1" aria-label="Oldinga">›</button>
      </div>
    </div>
    <div class="row"></div>
  `;

  setupArrows(section);

  return { section: section, track: section.querySelector(".row") };
}

// 2. QATORNI KINOLAR BILAN TO'LDIRISH
async function fillRow(info, section, track) {
  try {
    const data = await api(info.path, (info.extra || "") + "&page=1");

    data.results
      .filter(function (m) { return m.poster_path; })
      .slice(0, 16)
      .forEach(function (m) {
        track.appendChild(createCard(m));
      });

    if (window.AOS) AOS.refreshHard();
  } catch (error) {
    console.error(error);
    section.remove();
  }
}

// 3. ISHGA TUSHIRISH
ROW_LIST.forEach(function (info) {
  const built = buildRow(info);
  rowsEl.appendChild(built.section);
  fillRow(info, built.section, built.track);
});