// ===============================
// DRAWER (MENU)
const menuBtn = document.getElementById("menuBtn");
const drawer = document.getElementById("drawer");
const overlay = document.getElementById("overlay");
const closeBtn = document.getElementById("closeDrawer");

function openMenu(){
  if (!drawer || !overlay) return;
  drawer.classList.add("active");
  overlay.classList.add("active");
}

function closeMenu(){
  if (drawer) drawer.classList.remove("active");
  if (overlay) overlay.classList.remove("active");
}

if (menuBtn){
  menuBtn.addEventListener("click", () => {
    drawer.classList.contains("active") ? closeMenu() : openMenu();
  });
}
if (closeBtn) closeBtn.addEventListener("click", closeMenu);
if (overlay) overlay.addEventListener("click", closeMenu);

// ===============================
// SLIDER
// ===============================
const track = document.querySelector(".slides-track");
const slides = document.querySelectorAll(".slide");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const dotsContainer = document.getElementById("sliderDots");

let index = 0;
const total = slides.length;

// dots
if (dotsContainer){
  dotsContainer.innerHTML = "";
  for (let i = 0; i < total; i++){
    const dot = document.createElement("div");
    dot.className = "dot" + (i === 0 ? " active" : "");
    dot.addEventListener("click", () => {
      index = i;
      update();
      resetAuto();
    });
    dotsContainer.appendChild(dot);
  }
}

function updateDots(){
  document.querySelectorAll(".dot").forEach((d, i) => {
    d.classList.toggle("active", i === index);
  });
}

function update(){
  if (!track) return;
  track.style.transform = `translateX(-${index * 100}%)`;
  updateDots();
}

function next(){
  index = (index + 1) % total;
  update();
}
function prev(){
  index = (index - 1 + total) % total;
  update();
}

if (nextBtn) nextBtn.addEventListener("click", () => { next(); resetAuto(); });
if (prevBtn) prevBtn.addEventListener("click", () => { prev(); resetAuto(); });

let timer = setInterval(next, 4000);
function resetAuto(){
  clearInterval(timer);
  timer = setInterval(next, 4000);
}

// ====================
// UTILITIES
// ====================
function debounce(fn, delay = 250) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}

function openJokiSearchOverlay() {
  if (!jokiSearchOverlay) return;
  jokiSearchOverlay.classList.add('active');
}

// ===============================
// JOKI GAME LOGIC - Dynamic Load + WA Order
// ===============================
const WA_NUMBER = '6281357706121';
const jokiDataFiles = [
  "genshin_impact_joki.json",
  "honkai_star_rail_joki.json", 
  "zenless_zone_zero_joki.json",
  "wuthering_waves_joki.json"
];
const jokiGameGrid = document.getElementById('jokiGameGrid');
const jokiCategory = document.getElementById('jokiCategory');
const itemList = document.getElementById('itemList');

let currentGame = null;
let allPackages = [];
let filteredPackages = [];
let currentCategory = 'Semua';
const jokiSearchOverlay = document.getElementById('jokiSearchOverlay');
const jokiSearchResults = document.getElementById('jokiSearchResults');
const searchInput = document.getElementById('jokiSearch');

async function jokiGlobalSearch(query) {
  if (!jokiSearchOverlay || !jokiSearchResults) return;

  const cleanQuery = query.trim().toLowerCase();
  if (cleanQuery.length < 2) {
    jokiSearchResults.innerHTML = "";
    return;
  }

  jokiSearchOverlay.classList.add('active');
  jokiSearchResults.innerHTML = `<div class="loading"><span class="loader"></span> Mencari...</div>`;

  const fetchPromises = jokiDataFiles.map(async (file) => {
    try {
      const res = await fetch(`data/${file}`);
      if (!res.ok) return [];
      const data = await res.json();
      const gameTitle = (data.game || "").toLowerCase();
      const found = (data.items || []).filter(item => {
        const name = (item.name || "").toLowerCase();
        const desc = (item.desc || "").toLowerCase();
        return name.includes(cleanQuery) || desc.includes(cleanQuery) || gameTitle.includes(cleanQuery);
      });
      return found.map(item => ({
        ...item,
        gameSource: data.game || file.replace('_joki.json', '').replace(/_/g, ' ')
      }));
    } catch {
      return [];
    }
  });

  const resultsArray = await Promise.all(fetchPromises);
  const matches = resultsArray.flat();

  renderJokiSearchResults(matches);
}

function renderJokiSearchResults(results) {
  if (!jokiSearchResults) return;
  jokiSearchResults.innerHTML = '';
  if (results.length === 0) {
    jokiSearchResults.innerHTML = `<div class="loading">Tidak ditemukan.</div>`;
    return;
  }
  results.forEach((pkg, index) => {
    const div = document.createElement("div");
    div.className = "search-item";
    div.style.animationDelay = `${index * 0.05}s`;
    div.innerHTML = `
      <div class="item-info">
        <span class="game-tag">${pkg.gameSource}</span>
        <span class="item-name">${pkg.name}</span>
      </div>
      <span class="item-price">Rp ${Number(pkg.price).toLocaleString()}</span>
    `;
    div.onclick = () => {
      const text = `Halo WILLPEDIA, saya mau order joki *${pkg.name}* (${pkg.gameSource}) Rp${Number(pkg.price).toLocaleString()}`;
      window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`, "_blank");
      closeJokiSearchOverlay();
    };
    jokiSearchResults.appendChild(div);
  });
}

function closeJokiSearchOverlay() {
  if (jokiSearchOverlay) jokiSearchOverlay.classList.remove('active');
}

function filterData() {
  let temp = [...allPackages];
  if (currentCategory !== 'Semua') {
    temp = temp.filter(pkg => pkg.category === currentCategory.toLowerCase());
  }
  filteredPackages = temp;
  renderPackages();
}

async function loadGamePackages(gameId) {
  try {
    const response = await fetch(`data/${gameId}.json`);
    const data = await response.json();
    allPackages = data.items;
    currentCategory = 'Semua';
    closeJokiSearchOverlay();
    filterData();
    const badgeEl = document.querySelector('.badge');
    if (badgeEl) badgeEl.textContent = data.game;
  } catch (error) {
  console.error('Error loading packages:', error);
  itemList.innerHTML = '<p class="error">Data paket belum tersedia</p>';
}
}

function renderPackages() {
  itemList.innerHTML = '';
  filteredPackages.forEach(pkg => {
    const item = document.createElement('div');
    item.className = 'item-card';
    item.innerHTML = `
      <div class="item-left">
        <span class="badge">${currentGame?.game || 'Game'}</span>
        <span class="item-name">${pkg.name}</span>
        <small class="item-desc">${pkg.desc || 'Layanan joki profesional & aman'}</small>
      </div>
      <div class="item-right">
        <span class="item-price">Rp ${Number(pkg.price).toLocaleString()}</span>
        <a class="btn-order" href="https://wa.me/${WA_NUMBER}?text=Saya%20mau%20order%20*${pkg.name}*%20(${currentGame?.game || 'Game'})%20Rp${Number(pkg.price).toLocaleString()}%0ASilakan%20konfirmasi" target="_blank">Order</a>
      </div>
    `;
    itemList.appendChild(item);
  });
}

function filterCategory(category) {
  currentCategory = category;
  filterData();
}

const debouncedJokiSearch = debounce((val) => {
  const cleanQuery = val.trim();
  if (cleanQuery.length >= 2) {
    openJokiSearchOverlay();
    jokiGlobalSearch(cleanQuery);
  } else {
    closeJokiSearchOverlay();
  }
}, 250);

// Event Listeners
if (jokiGameGrid) {
  jokiGameGrid.addEventListener('click', (e) => {
    if (e.target.closest('.joki-card')) {
      const gameCard = e.target.closest('.joki-card');
      document.querySelectorAll('.joki-card').forEach(c => c.classList.remove('active'));
      gameCard.classList.add('active');
      currentGame = { id: gameCard.dataset.game, game: gameCard.querySelector('.joki-title').textContent };
      loadGamePackages(currentGame.id);
    }
  });
}

if (searchInput) {
  searchInput.addEventListener('input', (e) => debouncedJokiSearch(e.target.value));
  searchInput.addEventListener('focus', () => {
    if (searchInput.value.trim().length >= 2) openJokiSearchOverlay();
    closeMenu();
  });
}

// Global close overlay
document.addEventListener('click', (e) => {
  if (jokiSearchOverlay && !searchInput.contains(e.target) && !jokiSearchOverlay.contains(e.target)) {
    closeJokiSearchOverlay();
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeJokiSearchOverlay();
});


if (jokiCategory) {
  jokiCategory.addEventListener('click', (e) => {
    if (e.target.classList.contains('chip')) {
      document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      e.target.classList.add('active');
      filterCategory(e.target.textContent);
    }
  });
}

// Init with first game
document.addEventListener('DOMContentLoaded', async () => {
  const firstGame = document.querySelector('.joki-card.active');
  if (firstGame) {
    currentGame = { id: firstGame.dataset.game, game: firstGame.querySelector('.joki-title').textContent };
    await loadGamePackages(currentGame.id);
  }
});
