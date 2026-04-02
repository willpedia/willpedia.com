// ==========================================
// 1. SELEKTOR UTAMA
// ==========================================
const gameCards = document.querySelectorAll("#gameGrid .joki-card[data-game]");
const itemList = document.getElementById("itemList");
const waBtn = document.getElementById("waBtn");

const menuBtn = document.getElementById("menuBtn");
const drawer = document.getElementById("drawer");
const overlay = document.getElementById("overlay");
const closeBtn = document.getElementById("closeDrawer");

const searchInput = document.getElementById("topupSearch");
const searchOverlay = document.getElementById("searchOverlay");
const searchResults = document.getElementById("searchResults");

// Chips filter - no longer create dynamic, static in HTML now
// const topupCategory = document.getElementById("topupCategory") || document.createElement("div");

// DAFTAR FILE DATA
const allDataFiles = [
  "mobile_legends.json",
  "genshin_impact.json",
  "honkai_star_rail.json",
  "zenless_zone_zero.json",
  "wuthering_waves.json",
  "valorant.json"
];

// ==========================================
// 2. LOGIKA SLIDER (DOTS + MANUAL)
const track = document.querySelector(".slides-track");
const allSlides = document.querySelectorAll(".slide");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const dotsContainer = document.getElementById("sliderDots");

const totalSlides = allSlides.length;
let index = 0;

// Buat titik indikator
if (dotsContainer) {
  dotsContainer.innerHTML = "";
  for (let i = 0; i < totalSlides; i++) {
    const dot = document.createElement("div");
    dot.classList.add("dot");
    if (i === 0) dot.classList.add("active");
    dot.addEventListener("click", () => {
      index = i;
      updateSlider();
      resetAutoSlide();
    });
    dotsContainer.appendChild(dot);
  }
}

function updateDots() {
  const dots = document.querySelectorAll(".dot");
  dots.forEach((dot, i) => dot.classList.toggle("active", i === index));
}

function updateSlider() {
  if (!track) return;
  track.style.transition = "transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)";
  track.style.transform = `translateX(-${index * 100}%)`;
  updateDots();
}

function nextSlide() {
  index = (index + 1) % totalSlides;
  updateSlider();
}
function prevSlide() {
  index = (index - 1 + totalSlides) % totalSlides;
  updateSlider();
}

if (nextBtn) nextBtn.addEventListener("click", () => { nextSlide(); resetAutoSlide(); });
if (prevBtn) prevBtn.addEventListener("click", () => { prevSlide(); resetAutoSlide(); });

let autoSlideInterval = setInterval(nextSlide, 4000);
function resetAutoSlide() {
  clearInterval(autoSlideInterval);
  autoSlideInterval = setInterval(nextSlide, 4000);
}

// ==========================================
// 3. UTIL: BUKA/TUTUP SEARCH OVERLAY & DRAWER
function openSearchOverlay() {
  if (!searchOverlay) return;
  searchOverlay.classList.add("active");
  closeMenu();
}

function closeSearchOverlay() {
  if (!searchOverlay) return;
  searchOverlay.classList.remove("active");
}

function openMenu() {
  if (!drawer || !overlay) return;
  drawer.classList.add("active");
  overlay.classList.add("active");
  closeSearchOverlay();
}

function closeMenu() {
  if (drawer) drawer.classList.remove("active");
  if (overlay) overlay.classList.remove("active");
}

// ==========================================
// 4. GLOBAL SEARCH (DEBOUNCE)
function debounce(fn, delay = 250) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}

async function globalSearch(query) {
  if (!searchOverlay || !searchResults) return;

  const cleanQuery = query.trim().toLowerCase();
  if (cleanQuery.length < 2) {
    closeSearchOverlay();
    searchResults.innerHTML = "";
    return;
  }

  openSearchOverlay();
  searchResults.innerHTML = `<div class="loading"><span class="loader"></span> Mencari...</div>`;

  const fetchPromises = allDataFiles.map(async (file) => {
    try {
      const res = await fetch(`data/${file}`);
      if (!res.ok) return [];
      const data = await res.json();
      const gameTitle = (data.game || "").toLowerCase();
      const found = (data.items || []).filter(item => {
        const name = (item.name || "").toLowerCase();
        return name.includes(cleanQuery) || gameTitle.includes(cleanQuery);
      });
      return found.map(item => ({
        ...item,
        gameSource: data.game || file.replace('.json', '').replace(/_/g, ' ')
      }));
    } catch {
      return [];
    }
  });

  const resultsArray = await Promise.all(fetchPromises);
  const matches = resultsArray.flat();

  renderSearchResults(matches);
}

function renderSearchResults(results) {
  if (!searchResults) return;
  searchResults.innerHTML = "";
  if (results.length === 0) {
    searchResults.innerHTML = `<div class="loading">Tidak ditemukan.</div>`;
    return;
  }
  results.forEach(item => {
    const div = document.createElement("div");
    div.className = "search-item";
    div.innerHTML = `
      <div class="item-info">
        <span class="game-tag">${item.gameSource}</span>
        <span class="item-name">${item.name}</span>
      </div>
      <span class="item-price">Rp ${Number(item.price).toLocaleString()}</span>
    `;
    div.onclick = () => {
      const text = `Halo WILLPEDIA, saya mau order *${item.name}* (${item.gameSource}) Rp${Number(item.price).toLocaleString()}`;
      window.open(`https://wa.me/6281357706121?text=${encodeURIComponent(text)}`, "_blank");
      closeSearchOverlay();
    };
    searchResults.appendChild(div);
  });
}

const debouncedSearch = debounce((val) => globalSearch(val), 250);

// ==========================================
// 5. EVENT DRAWER & SEARCH
if (menuBtn) {
  menuBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    drawer && drawer.classList.contains("active") ? closeMenu() : openMenu();
  });
}

if (closeBtn) closeBtn.addEventListener("click", closeMenu);

if (overlay) overlay.addEventListener("click", () => {
  closeMenu();
  closeSearchOverlay();
});

if (searchInput) {
  searchInput.addEventListener("input", (e) => debouncedSearch(e.target.value));
  searchInput.addEventListener("focus", () => {
    if (searchInput.value.trim().length >= 2) openSearchOverlay();
    closeMenu();
  });
}

// ESC close
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeMenu();
    closeSearchOverlay();
    if (searchInput) searchInput.blur();
  }
});

// Click outside search
document.addEventListener("click", (e) => {
  if (!searchOverlay || !searchInput) return;
  if (!searchInput.contains(e.target) && !searchOverlay.contains(e.target)) {
    closeSearchOverlay();
  }
});

// ==========================================
// 6. GAME SELECT + DYNAMIC PACKAGES + FILTER
let currentGameData = null;
let filteredItems = [];

function renderItemList(items) {
  if (!itemList) return;
  itemList.innerHTML = "";
  items.forEach(item => {
    const div = document.createElement("div");
    div.className = "item-card";
    div.innerHTML = `
      <div class="item-left">
        <span class="item-name">${item.name}</span>
        <small class="item-desc">${item.desc || ''}</small>
      </div>
      <div class="item-right">
        <span class="item-price">Rp ${Number(item.price).toLocaleString()}</span>
        <a class="btn-small-wa" href="https://wa.me/6281357706121?text=Halo%20WILLPEDIA%2C%20saya%20mau%20TopUp%20${encodeURIComponent(item.name)}%20Rp${Number(item.price).toLocaleString()}" target="_blank">
          Order
        </a>
      </div>
    `;
    itemList.appendChild(div);
  });
}

function filterTopup(category) {
  if (category === "Semua") {
    filteredItems = [...currentGameData.items];
  } else {
    filteredItems = currentGameData.items.filter(item => item.category === category.toLowerCase());
  }
  renderItemList(filteredItems);
}

gameCards.forEach(card => {
  card.addEventListener("click", async () => {
    closeSearchOverlay();
    gameCards.forEach(c => c.classList.remove("active"));
    card.classList.add("active");

    const gameId = card.dataset.game;
    if (!itemList) return;

    itemList.innerHTML = `<div class="loading"><span class="loader"></span> Loading...</div>`;
    itemList.scrollIntoView({ behavior: "smooth", block: "start" });

    try {
      const res = await fetch(`data/${gameId}.json`);
      if (!res.ok) throw new Error();
      currentGameData = await res.json();
      filteredItems = [...currentGameData.items];

      // Chips now static in HTML, add click handler once
      const chips = document.getElementById("topupCategory");
      if (chips && !chips.dataset.listenerAdded) {
        chips.dataset.listenerAdded = "true";
        chips.addEventListener("click", (e) => {
          if (e.target.classList.contains("chip")) {
            chips.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
            e.target.classList.add("active");
            filterTopup(e.target.textContent);
          }
        });
      }
      renderItemList(filteredItems);
    } catch {
      itemList.innerHTML = `<div class="error">Data belum tersedia</div>`;
    }
  });
});

// Update WA btn if exists
if (waBtn) {
  waBtn.href = `https://wa.me/6281357706121?text=Saya mau topup game`;
}

// DOM Ready
document.addEventListener("DOMContentLoaded", () => {
  const firstGame = document.querySelector("#gameGrid .joki-card.active") || document.querySelector("#gameGrid .joki-card[data-game]");
  if (firstGame) firstGame.click();
});
