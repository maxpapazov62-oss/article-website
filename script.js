// Configuration
const LOAD_DURATION_MS = 2500;
const SEGMENT_COUNT = 24;
const HOLD_DURATION_MS = 400;

// DOM Elements
const loadingScreen = document.getElementById('loadingScreen');
const alphaBtn = document.getElementById('alphaBtn');
const loaderContainer = document.getElementById('loaderContainer');
const ringSvg = document.getElementById('ringSvg');
const percentageEl = document.getElementById('percentage');
const feedPage = document.getElementById('feedPage');
const themeToggle = document.getElementById('themeToggle');
const modalOverlay = document.getElementById('modalOverlay');
const modal = document.getElementById('modal');
const modalClose = document.getElementById('modalClose');
const modalFullscreen = document.getElementById('modalFullscreen');
const modalContent = document.getElementById('modalContent');
const stockPitchesCards = document.getElementById('stockPitchesCards');
const macroCards = document.getElementById('macroCards');

// State
let articles = [];

// Initialize ring segments
function initRing() {
  const cx = 100;
  const cy = 100;
  const r = 85;

  for (let i = 0; i < SEGMENT_COUNT; i++) {
    const angle = (i / SEGMENT_COUNT) * 2 * Math.PI - Math.PI / 2;
    const x1 = cx + (r - 10) * Math.cos(angle);
    const y1 = cy + (r - 10) * Math.sin(angle);
    const x2 = cx + r * Math.cos(angle);
    const y2 = cy + r * Math.sin(angle);

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
    line.setAttribute('class', 'ring-segment');
    line.setAttribute('data-index', i);
    ringSvg.appendChild(line);
  }
}

// Animate loading
function startLoading() {
  alphaBtn.classList.add('hidden');
  loaderContainer.classList.add('visible');

  const segments = document.querySelectorAll('.ring-segment');
  const startTime = performance.now();

  function animate(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / LOAD_DURATION_MS, 1);
    const percent = Math.floor(progress * 100);

    percentageEl.textContent = `${percent}%`;

    const litCount = Math.floor(progress * SEGMENT_COUNT);
    segments.forEach((seg, i) => {
      if (i < litCount) {
        seg.classList.add('lit');
      }
    });

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      segments.forEach(seg => seg.classList.add('lit'));
      percentageEl.textContent = '100%';

      setTimeout(() => {
        loadingScreen.classList.add('hidden');
        feedPage.classList.add('visible');
        notifyVisit();
      }, HOLD_DURATION_MS);
    }
  }

  requestAnimationFrame(animate);
}

// Format date
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

// Create card HTML
function createCard(article) {
  const card = document.createElement('article');
  card.className = 'card';
  card.setAttribute('data-id', article.id);

  let imageHtml = '';
  if (article.image) {
    imageHtml = `<img class="card-image" src="${article.image}" alt="${article.title}" loading="lazy">`;
  }

  card.innerHTML = `
    ${imageHtml}
    <div class="card-body">
      <h3 class="card-title">${article.title}</h3>
      <div class="card-date">${formatDate(article.date)}</div>
      <p class="card-preview">${article.preview}</p>
    </div>
  `;

  card.addEventListener('click', () => {
    if (article.link) {
      window.open(article.link, '_blank');
    } else {
      openModal(article);
    }
  });
  return card;
}

// Create featured card HTML
function createFeaturedCard(article) {
  const card = document.createElement('div');
  card.className = 'featured-card';
  card.setAttribute('data-id', article.id);

  card.innerHTML = `
    <div class="featured-badge">PINNED</div>
    <div class="featured-content">
      <h3 class="featured-title">${article.title}</h3>
      <p class="featured-preview">${article.preview}</p>
    </div>
    <span class="featured-arrow">→</span>
  `;

  card.addEventListener('click', () => {
    if (article.link) {
      window.open(article.link, '_blank');
    } else {
      openModal(article);
    }
  });
  return card;
}

// Render articles
function renderArticles() {
  const featured = articles.filter(a => a.featured);
  const stockPitches = articles
    .filter(a => a.category === 'stock-pitch' && !a.featured)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const macro = articles
    .filter(a => a.category === 'macro' && !a.featured)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const featuredSection = document.getElementById('featuredSection');
  featuredSection.innerHTML = '';
  stockPitchesCards.innerHTML = '';
  macroCards.innerHTML = '';

  featured.forEach(article => {
    featuredSection.appendChild(createFeaturedCard(article));
  });

  stockPitches.forEach(article => {
    stockPitchesCards.appendChild(createCard(article));
  });

  macro.forEach(article => {
    macroCards.appendChild(createCard(article));
  });
}

// Modal functions
function openModal(article) {
  let imageHtml = '';
  if (article.image) {
    imageHtml = `<img class="modal-image" src="${article.image}" alt="${article.title}">`;
  }

  modalContent.innerHTML = `
    ${imageHtml}
    <h1 class="modal-title">${article.title}</h1>
    <div class="modal-date">${formatDate(article.date)}</div>
    <div class="modal-body">${article.body}</div>
  `;

  modalOverlay.classList.add('visible');
  document.body.classList.add('modal-open');
}

function closeModal() {
  modalOverlay.classList.remove('visible');
  modalOverlay.classList.remove('fullscreen');
  document.body.classList.remove('modal-open');
}

function toggleFullscreen() {
  modalOverlay.classList.toggle('fullscreen');
}

// Theme toggle
function initTheme() {
  const saved = localStorage.getItem('theme');
  if (saved) {
    document.documentElement.setAttribute('data-theme', saved);
  }
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
}

// Telegram notification (fire-and-forget)
function notifyVisit() {
  try {
    fetch('/api/notify', { method: 'POST' });
  } catch (e) {
    // Silently fail
  }
}

// Load articles
async function loadArticles() {
  try {
    const res = await fetch('/data/articles.json');
    articles = await res.json();
    renderArticles();
  } catch (e) {
    console.error('Failed to load articles:', e);
  }
}

// Event listeners
alphaBtn.addEventListener('click', startLoading);
themeToggle.addEventListener('click', toggleTheme);
modalClose.addEventListener('click', closeModal);
modalFullscreen.addEventListener('click', toggleFullscreen);

modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) {
    closeModal();
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modalOverlay.classList.contains('visible')) {
    closeModal();
  }
});

// Initialize
initRing();
initTheme();
loadArticles();
