// ===============================
// DRAWER & NAVIGATION (Sesuai index.html)
// ===============================
const menuBtn = document.getElementById("menuBtn");
const drawer = document.getElementById("drawer");
const overlay = document.getElementById("overlay");
const closeBtn = document.getElementById("closeDrawer");

function openMenu() {
  drawer?.classList.add("active");
  overlay?.classList.add("active");
}

function closeMenu() {
  drawer?.classList.remove("active");
  overlay?.classList.remove("active");
}

if (menuBtn) menuBtn.addEventListener("click", openMenu);
if (closeBtn) closeBtn.addEventListener("click", closeMenu);
if (overlay) overlay.addEventListener("click", closeMenu);

// ===============================
// SLIDER LOGIC
// ===============================
const track = document.querySelector(".slides-track");
const slides = document.querySelectorAll(".slide");
const dotsContainer = document.getElementById("sliderDots");

let index = 0;
const total = slides.length;

if (dotsContainer && total > 0) {
  dotsContainer.innerHTML = "";
  for (let i = 0; i < total; i++) {
    const dot = document.createElement("div");
    dot.className = "dot" + (i === 0 ? " active" : "");
    dot.onclick = () => { index = i; updateSlider(); resetAuto(); };
    dotsContainer.appendChild(dot);
  }
}

function updateSlider() {
  if (!track) return;
  track.style.transform = `translateX(-${index * (100 / total)}%)`;
  document.querySelectorAll(".dot").forEach((d, i) => d.classList.toggle("active", i === index));
}

let timer = setInterval(() => { index = (index + 1) % total; updateSlider(); }, 4000);
function resetAuto() { clearInterval(timer); timer = setInterval(() => { index = (index + 1) % total; updateSlider(); }, 4000); }

// ===============================
// TOP UP LOGIC (PILIH GAME)
// ===============================
const gameGrid = document.getElementById('gameGrid'); // ID sesuai index.html
const topupCategory = document.getElementById('topupCategory');
const itemList = document.getElementById('itemList');
const searchBtn = document.getElementById('searchBtn');
const searchInput = document.getElementById('topupSearch'); // ID sesuai index.html
const searchOverlay = document.getElementById('searchOverlay');
const searchResults = document.getElementById('searchResults');

let currentGameId = null;
let allTopupItems = [];
let currentFilter = 'Semua';

// --- Search System ---
function openSearch() { searchOverlay?.classList.add('active'); searchInput?.focus(); }
function closeSearchOverlay() { searchOverlay?.classList.remove('active'); if(searchInput) searchInput.value = ''; }

searchBtn?.addEventListener('click', openSearch);

async function globalSearch(query) {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return;
  
  // List file JSON Top Up (Bukan Joki)
  const topupFiles = ["zenless_zone_zero.json", "genshin_impact.json", "honkai_star_rail.json", "wuthering_waves.json"];
  
  searchResults.innerHTML = `<div style="padding:20px; color:#f2f200;">Mencari Produk...</div>`;
  
  const results = (await Promise.all(topupFiles.map(async f => {
    try {
      const res = await fetch(`data/${f}`);
      const data = await res.json();
      return (data.items || []).filter(i => i.name.toLowerCase().includes(q))
             .map(i => ({ ...i, gameName: data.game }));
    } catch { return []; }
  }))).flat();

  searchResults.innerHTML = results.length ? '' : '<div style="padding:20px; color:#a1a1a1;">Produk tidak ditemukan.</div>';
  results.forEach(item => {
    const div = document.createElement("div");
    div.className = "search-item";
    div.innerHTML = `
      <div class="item-info">
        <span class="game-tag">${item.gameName}</span>
        <span class="item-name">${item.name}</span>
      </div>
      <span class="item-price">Rp ${Number(item.price).toLocaleString()}</span>
    `;
    div.onclick = () => window.open(`https://wa.me/6281357706121?text=Halo WILLPEDIA, saya mau topup *${item.name}* (${item.gameName})`, "_blank");
    searchResults.appendChild(div);
  });
}

// --- Data Loading ---
async function loadTopupData(gameId) {
  try {
    const res = await fetch(`data/${gameId}.json`);
    const data = await res.json();
    allTopupItems = data.items;
    renderItems();
  } catch { 
    itemList.innerHTML = '<p style="color:red; padding:20px;">Data produk belum tersedia.</p>'; 
  }
}

function renderItems() {
  if (!itemList) return;
  itemList.innerHTML = '';
  const filtered = currentFilter === 'Semua' ? allTopupItems : allTopupItems.filter(p => p.category === currentFilter.toLowerCase());
  
  filtered.forEach(pkg => {
    const card = document.createElement('div');
    card.className = 'item-card';
    card.innerHTML = `
      <div class="item-left">
        <span class="item-name">${pkg.name}</span>
        <small class="item-desc">Proses Instan 1-10 Menit</small>
      </div>
      <div class="item-right">
        <span class="item-price">Rp ${Number(pkg.price).toLocaleString()}</span>
        <button class="btn-order-small">Top Up</button>
      </div>
    `;
    card.onclick = () => window.open(`https://wa.me/6281357706121?text=Saya mau Top Up *${pkg.name}*`, "_blank");
    itemList.appendChild(card);
  });
}

// --- Event Listeners ---
if (gameGrid) {
  gameGrid.addEventListener('click', (e) => {
    const card = e.target.closest('.joki-card');
    if (card) {
      // Toggle Class Active
      document.querySelectorAll('#gameGrid .joki-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      
      // Load Data Berdasarkan data-game
      currentGameId = card.dataset.game;
      loadTopupData(currentGameId);
    }
  });
}

topupCategory?.addEventListener('click', (e) => {
  if (e.target.classList.contains('chip')) {
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    e.target.classList.add('active');
    currentFilter = e.target.textContent;
    renderItems();
  }
});

searchInput?.addEventListener('input', (e) => globalSearch(e.target.value));

// Init saat halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
  const activeGame = document.querySelector('#gameGrid .joki-card.active');
  if (activeGame) {
    currentGameId = activeGame.dataset.game;
    loadTopupData(currentGameId);
  }
});

// Menutup Search Top Up jika klik di area luar
document.addEventListener('mousedown', function(e) {
  const searchOverlay = document.getElementById('searchOverlay');
  const searchContainer = document.querySelector('.search-container');

  if (searchOverlay && searchOverlay.classList.contains('active') && !searchContainer.contains(e.target)) {
    closeSearchOverlay();
  }
});