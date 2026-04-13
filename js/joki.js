// ===============================
// DRAWER & OVERLAY
// ===============================
const menuBtn = document.getElementById("menuBtn");
const drawer = document.getElementById("drawer");
const overlay = document.getElementById("overlay");
const closeBtn = document.getElementById("closeDrawer");

function openMenu(){
  drawer?.classList.add("active");
  overlay?.classList.add("active");
}

function closeMenu(){
  drawer?.classList.remove("active");
  overlay?.classList.remove("active");
}

menuBtn?.addEventListener("click", openMenu);
closeBtn?.addEventListener("click", closeMenu);
overlay?.addEventListener("click", closeMenu);

// ===============================
// SLIDER (Smooth Transition)
// ===============================
const track = document.querySelector(".slides-track");
const slides = document.querySelectorAll(".slide");
const dotsContainer = document.getElementById("sliderDots");

let index = 0;
const total = slides.length;

if (dotsContainer && total > 0){
  dotsContainer.innerHTML = "";
  for (let i = 0; i < total; i++){
    const dot = document.createElement("div");
    dot.className = "dot" + (i === 0 ? " active" : "");
    dot.onclick = () => { index = i; updateSlider(); resetAuto(); };
    dotsContainer.appendChild(dot);
  }
}

function updateSlider(){
  if (!track) return;
  track.style.transform = `translateX(-${index * (100 / total)}%)`;
  document.querySelectorAll(".dot").forEach((d, i) => d.classList.toggle("active", i === index));
}

let timer = setInterval(() => { index = (index + 1) % total; updateSlider(); }, 4000);
function resetAuto(){ clearInterval(timer); timer = setInterval(() => { index = (index + 1) % total; updateSlider(); }, 4000); }

// ===============================
// JOKI CORE LOGIC
// ===============================
const WA_NUMBER = '6281357706121';
const jokiDataFiles = ["genshin_impact_joki.json", "honkai_star_rail_joki.json", "zenless_zone_zero_joki.json", "wuthering_waves_joki.json"];

const jokiGameGrid = document.getElementById('jokiGameGrid');
const jokiCategory = document.getElementById('jokiCategory');
const itemList = document.getElementById('itemList');
const searchBtn = document.getElementById('searchBtn');
const searchInput = document.getElementById('jokiSearch');
const jokiSearchOverlay = document.getElementById('jokiSearchOverlay');
const jokiSearchResults = document.getElementById('jokiSearchResults');

let currentGame = null;
let allPackages = [];
let currentCategory = 'Semua';

// Search Logic
function openJokiSearchOverlay() { jokiSearchOverlay?.classList.add('active'); searchInput?.focus(); }
function closeJokiSearchOverlay() { jokiSearchOverlay?.classList.remove('active'); if(searchInput) searchInput.value = ''; }

searchBtn?.addEventListener('click', openJokiSearchOverlay);

async function jokiGlobalSearch(query) {
  const q = query.trim().toLowerCase();
  
  if (q.length < 2) {
    jokiSearchResults.innerHTML = '';
    return;
  }

  jokiSearchResults.innerHTML = `<div style="padding:20px; color:#f2f200; text-align:center;">Mencari...</div>`;
  
  try {
    const results = (await Promise.all(jokiDataFiles.map(async f => {
      try {
        const res = await fetch(`data/${f}`);
        const data = await res.json();
        const gameName = data.game.toLowerCase();
        
        return (data.items || []).filter(item => {
          const itemName = item.name.toLowerCase();
          return itemName.includes(q) || gameName.includes(q);
        }).map(i => ({ ...i, gameSource: data.game, gameImage: data.image }));
      } catch { return []; }
    }))).flat();

    jokiSearchResults.innerHTML = results.length ? '' : '<div style="padding:20px; color:#a1a1a1; text-align:center;">Layanan tidak ditemukan.</div>';
    
    results.forEach(pkg => {
      const div = document.createElement("div");
      div.className = "search-item";
      div.innerHTML = `
        <img src="assets/${pkg.gameImage || 'willpediaa.png'}" alt="${pkg.gameSource}">
        <div class="item-info">
          <span class="game-tag">${pkg.gameSource}</span>
          <span class="item-name">${pkg.name}</span>
        </div>
        <span class="item-price">Rp ${Number(pkg.price).toLocaleString()}</span>
      `;
      div.onclick = () => {
        window.open(`https://wa.me/${WA_NUMBER}?text=Halo WILLPEDIA, saya mau order joki *${pkg.name}* (${pkg.gameSource})`, "_blank");
      };
      jokiSearchResults.appendChild(div);
    });
  } catch (err) {
    jokiSearchResults.innerHTML = '<div style="padding:20px; color:red; text-align:center;">Gagal memuat data.</div>';
  }
}

// Data Handling
async function loadGamePackages(gameId) {
  try {
    const res = await fetch(`data/${gameId}.json`);
    const data = await res.json();
    allPackages = data.items;
    renderPackages();
  } catch { itemList.innerHTML = '<p class="error">Data joki gagal dimuat.</p>'; }
}

function renderPackages() {
  itemList.innerHTML = '';
  const filtered = currentCategory === 'Semua' ? allPackages : allPackages.filter(p => p.category === currentCategory.toLowerCase());
  
  filtered.forEach(pkg => {
    const card = document.createElement('div');
    card.className = 'item-card';
    card.innerHTML = `
      <div class="item-left"><span class="item-name">${pkg.name}</span><small class="item-desc">${pkg.desc || 'Layanan joki aman & cepat'}</small></div>
      <div class="item-right"><span class="item-price">Rp ${Number(pkg.price).toLocaleString()}</span><button class="btn-order-small">Order</button></div>
    `;
    card.onclick = () => window.open(`https://wa.me/${WA_NUMBER}?text=Halo WILLPEDIA, saya mau order joki *${pkg.name}* (${currentGame.game})`, "_blank");
    itemList.appendChild(card);
  });
}

// Listeners
jokiGameGrid?.addEventListener('click', (e) => {
  const card = e.target.closest('.joki-card');
  if (card) {
    document.querySelectorAll('.joki-card').forEach(c => c.classList.remove('active'));
    card.classList.add('active');
    currentGame = { id: card.dataset.game, game: card.querySelector('.joki-title').textContent };
    loadGamePackages(currentGame.id);
  }
});

jokiCategory?.addEventListener('click', (e) => {
  if (e.target.classList.contains('chip')) {
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    e.target.classList.add('active');
    currentCategory = e.target.textContent;
    renderPackages();
  }
});

searchInput?.addEventListener('input', (e) => jokiGlobalSearch(e.target.value));

document.addEventListener('DOMContentLoaded', () => {
  const active = document.querySelector('.joki-card.active');
  if (active) {
    currentGame = { id: active.dataset.game, game: active.querySelector('.joki-title').textContent };
    loadGamePackages(currentGame.id);
  }
});

// Menutup Search Joki jika klik di area kosong (di luar container)
document.addEventListener('mousedown', function(e) {
  const searchOverlay = document.getElementById('jokiSearchOverlay');
  const searchContainer = document.querySelector('.search-container');

  // Jika overlay sedang aktif DAN yang diklik BUKAN container pencarian
  if (searchOverlay && searchOverlay.classList.contains('active') && !searchContainer.contains(e.target)) {
    closeJokiSearchOverlay();
  }
});