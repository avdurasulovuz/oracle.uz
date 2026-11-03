(function () {
  const mount = document.getElementById("site-header");
  if (!mount) return;

  const svg = function (inner) {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;
  };
  const icons = {
    home: svg('<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>'),
    film: svg('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M8 4l-2 5M14 4l-2 5M20 4l-2 5"/>'),
    tv: svg('<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M8 2l4 4 4-4"/>'),
    genre: svg('<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>'),
    year: svg('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>'),
    toon: svg('<circle cx="12" cy="12" r="9"/><path d="M8 14c1 2 7 2 8 0"/><circle cx="9" cy="10" r="0.6"/><circle cx="15" cy="10" r="0.6"/>'),
    collection: svg('<path d="M4 8h16v12H4z"/><path d="M7 5h10M9 2h6"/>'),
    saved: svg('<path d="M6 3h12v18l-6-4-6 4z"/>'),
    search: svg('<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>'),
    send: svg('<path d="M21 3L3 11l7 2 2 7 3-5 6 3z"/>'),
    sun: svg('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5"/>'),
    user: svg('<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>')
  };

  // Faol bo'limni aniqlash
  const path = location.pathname.split("/").pop() || "index.html";
  const params = new URLSearchParams(location.search);
  const onIndex = path === "index.html";
  const active = {
    home: onIndex && !params.has("genre") && !params.has("year") && !location.hash,
    kino: onIndex && location.hash === "#grid-title",
    series: path === "series.html" || path === "series-page.html",
    genre: onIndex && params.has("genre") && params.get("genre") !== "16",
    year: onIndex && params.has("year"),
    toon: onIndex && params.get("genre") === "16",
    collection: onIndex && location.hash === "#home-bottom",
    saved: path === "favorites.html"
  };
  const cls = function (n) { return "nav-link" + (active[n] ? " active" : ""); };

  const genreLinks = GENRES.map(function (g) {
    return `<a href="index.html?genre=${g.id}">${g.name}</a>`;
  }).join("");

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
            <a class="${cls("home")}" href="index.html">${icons.home}<span>Asosiy</span></a>
            <a class="${cls("kino")}" href="index.html#grid-title">${icons.film}<span>Kino</span></a>
            <a class="${cls("series")}" href="series.html">${icons.tv}<span>Serial</span></a>

            <details class="dd">
              <summary class="${cls("genre")}">${icons.genre}<span>Janr</span></summary>
              <div class="dd-panel">${genreLinks}</div>
            </details>

            <details class="dd">
              <summary class="${cls("year")}">${icons.year}<span>Yil</span></summary>
              <div class="dd-panel years">${yearLinks}</div>
            </details>

            <a class="${cls("toon")}" href="index.html?genre=16">${icons.toon}<span>Multfilm</span></a>
            <a class="${cls("collection")}" href="index.html#home-bottom">${icons.collection}<span>To'plam</span></a>
          </nav>

          <label class="hdr-search">
            ${icons.search}
            <input type="search" id="hdr-search-input" placeholder="Kino qidirish..." autocomplete="off">
            <kbd>/</kbd>
          </label>

          <div class="actions">
            <a class="icon-btn${active.saved ? " active" : ""}" href="favorites.html" aria-label="Sevimlilar" title="Sevimlilar">${icons.saved}</a>
            <a class="icon-btn" href="https://t.me/esladdjx" target="_blank" rel="noopener" aria-label="Telegram" title="Telegram">${icons.send}</a>
            <button class="icon-btn" id="theme-btn" type="button" aria-label="Rejim" title="Yorug' / qorong'u">${icons.sun}</button>
            <button class="btn-ghost btn-icon" type="button">${icons.user}<span>Kirish</span></button>
          </div>
        </div>
      </div>
    </header>
  `;

  // Telefonda menyu
  const burger = document.getElementById("burger");
  const menu = document.getElementById("menu");
  burger.addEventListener("click", function () {
    const isOpen = menu.classList.toggle("open");
    burger.setAttribute("aria-expanded", isOpen);
    burger.textContent = isOpen ? "✕" : "☰";
  });

  // ===== JONLI QIDIRUV =====
  const hdrSearch = document.getElementById("hdr-search-input");
  const live = document.createElement("div");
  live.className = "live-results";
  live.hidden = true;
  hdrSearch.closest(".hdr-search").appendChild(live);

  let liveTimer;
  let liveReq = 0;

  function hideLive() {
    live.hidden = true;
    live.innerHTML = "";
  }

  function showLive(list) {
    live.innerHTML = "";
    if (!list.length) {
      const empty = document.createElement("div");
      empty.className = "live-empty";
      empty.textContent = "Hech narsa topilmadi";
      live.appendChild(empty);
    }
    list.forEach(function (m) {
      const isTv = m.media_type === "tv";
      const a = document.createElement("a");
      a.className = "live-item";
      a.href = (isTv ? "series-page.html?id=" : "movie.html?id=") + m.id;

      const img = document.createElement("img");
      img.alt = "";
      img.loading = "lazy";
      if (m.poster_path) img.src = IMG_URL + m.poster_path;

      const info = document.createElement("div");
      const name = document.createElement("strong");
      name.textContent = m.title || m.name || "";
      const meta = document.createElement("span");
      const year = (m.release_date || m.first_air_date || "").slice(0, 4);
      const rate = m.vote_average ? "★ " + m.vote_average.toFixed(1) : "";
      meta.textContent = [isTv ? "Serial" : "Kino", year, rate].filter(Boolean).join(" · ");

      info.appendChild(name);
      info.appendChild(meta);
      a.appendChild(img);
      a.appendChild(info);
      live.appendChild(a);
    });
    live.hidden = false;
  }

  hdrSearch.addEventListener("input", function () {
    clearTimeout(liveTimer);
    const q = hdrSearch.value.trim();

    if (!q) {
      hideLive();
      const s = document.getElementById("search");
      if (s && s.value) {
        s.value = "";
        s.dispatchEvent(new Event("input", { bubbles: true }));
      }
      return;
    }
    if (q.length < 2) return;

    liveTimer = setTimeout(async function () {
      const myId = ++liveReq;
      try {
        const data = await api("/search/multi", "&query=" + encodeURIComponent(q) + "&page=1");
        if (myId !== liveReq) return;
        const items = data.results.filter(function (m) {
          return (m.media_type === "movie" || m.media_type === "tv") && m.poster_path;
        });
        showLive(items.slice(0, 6));
      } catch (err) {
        hideLive();
      }
    }, 300);
  });

  hdrSearch.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      hideLive();
      hdrSearch.blur();
    }
    if (e.key === "Enter") {
      clearTimeout(liveTimer);
      liveReq++;
      hideLive();
      const s = document.getElementById("search");
      if (s) {
        s.value = hdrSearch.value;
        s.dispatchEvent(new Event("input", { bubbles: true }));
      } else {
        location.href = "index.html";
      }
    }
  });

  // "/" tugmasi qidiruvga o'tkazadi
  document.addEventListener("keydown", function (e) {
    const tag = (document.activeElement && document.activeElement.tagName) || "";
    if (e.key === "/" && tag !== "INPUT" && tag !== "TEXTAREA") {
      e.preventDefault();
      hdrSearch.focus();
    }
  });

  // YORUG' / QORONG'U rejim
  const themeBtn = document.getElementById("theme-btn");
  try {
    if (localStorage.getItem("theme") === "light") {
      document.documentElement.setAttribute("data-theme", "light");
    }
  } catch (e) {}
  themeBtn.addEventListener("click", function () {
    const light = document.documentElement.getAttribute("data-theme") === "light";
    if (light) document.documentElement.removeAttribute("data-theme");
    else document.documentElement.setAttribute("data-theme", "light");
    try { localStorage.setItem("theme", light ? "dark" : "light"); } catch (e) {}
  });

  // Tashqariga bosilsa, ochiq ro'yxatlar va qidiruv natijalari yopiladi
  document.addEventListener("click", function (e) {
    mount.querySelectorAll("details[open]").forEach(function (d) {
      if (!d.contains(e.target)) d.removeAttribute("open");
    });
    if (!e.target.closest(".hdr-search")) hideLive();
  });

  // Telefonda Janr/Yil ro'yxati header ostida ochiladi
  mount.querySelectorAll("details.dd").forEach(function (d) {
    d.addEventListener("toggle", function () {
      const p = d.querySelector(".dd-panel");
      if (!p) return;
      if (d.open && window.innerWidth < 900) {
        p.style.top = (mount.getBoundingClientRect().bottom + 6) + "px";
      } else {
        p.style.top = "";
      }
    });
  });
})();