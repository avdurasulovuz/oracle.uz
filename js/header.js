// Hamma sahifada bir xil header: bitta joyda yoziladi, sahifalarga o'zi joylanadi.
// (function () { ... })() ichida yozilgan: ichidagi nomlar boshqa fayllar bilan to'qnashmaydi
(function () {
  const mount = document.getElementById("site-header");
  if (!mount) return;

  // Janr havolalari
  const genreLinks = GENRES.map(function (g) {
    return `<a href="index.html?genre=${g.id}">${g.name}</a>`;
  }).join("");

  // Yil havolalari: joriy yildan 32 yil orqaga
  let yearLinks = "";
  const thisYear = new Date().getFullYear();
  for (let y = thisYear; y >= thisYear - 31; y--) {
    yearLinks += `<a href="index.html?year=${y}">${y}</a>`;
  }

  mount.innerHTML = `
    <header class="header">
      <div class="header-inner">
        <h1 class="logo"><a href="index.html">oracle<span>.uz</span></a></h1>

        <button class="burger" id="burger" type="button" aria-label="Menyu" aria-expanded="false">☰</button>

        <div class="menu" id="menu">
          <nav class="nav">
            <a class="nav-link" href="index.html">Bosh sahifa</a>

            <details class="dd">
              <summary class="nav-link">Janr</summary>
              <div class="dd-panel">${genreLinks}</div>
            </details>

            <details class="dd">
              <summary class="nav-link">Yil</summary>
              <div class="dd-panel years">${yearLinks}</div>
            </details>

            <a class="nav-link" href="favorites.html">♥ Sevimlilar</a>
          </nav>

          <div class="auth">
            <button class="btn-ghost" type="button">Kirish</button>
            <button class="btn-solid" type="button">Ro'yxatdan o'tish</button>
          </div>
        </div>
      </div>
    </header>
  `;

  // Telefonda menyuni ochish va yopish
  const burger = document.getElementById("burger");
  const menu = document.getElementById("menu");

  burger.addEventListener("click", function () {
    const isOpen = menu.classList.toggle("open");
    burger.setAttribute("aria-expanded", isOpen);
    burger.textContent = isOpen ? "✕" : "☰";
  });

  // Menyudan tashqariga bosilsa, ochiq ro'yxat yopiladi
  document.addEventListener("click", function (e) {
    mount.querySelectorAll("details[open]").forEach(function (d) {
      if (!d.contains(e.target)) d.removeAttribute("open");
    });
  });
})();