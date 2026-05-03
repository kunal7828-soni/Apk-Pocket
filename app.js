/**
 * app.js – APKVault (GitHub-hosted, no backend)
 * ────────────────────────────────────────────────────────────────
 * - Loads app data from data/apps.json
 * - Renders homepage grid with search / filter / sort
 * - Renders detail page
 * - Star rating (stored in localStorage, no server needed)
 * - Dark / light mode toggle
 * ────────────────────────────────────────────────────────────────
 */

'use strict';

/* ── Theme ─────────────────────────────────────────────────────── */
(function initTheme() {
  if (localStorage.getItem('theme') === 'light') applyLight();
})();

function applyLight()  { document.body.classList.add('light'); swapThemeIcon(true); }
function applyDark()   { document.body.classList.remove('light'); swapThemeIcon(false); }
function swapThemeIcon(isLight) {
  document.getElementById('moonIcon')?.classList.toggle('hidden',  isLight);
  document.getElementById('sunIcon')?.classList.toggle('hidden',  !isLight);
}

document.getElementById('themeBtn')?.addEventListener('click', () => {
  const light = !document.body.classList.contains('light');
  light ? applyLight() : applyDark();
  localStorage.setItem('theme', light ? 'light' : 'dark');
});

/* ── Route ─────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const page = location.pathname.split('/').pop() || 'index.html';
  if (page === 'detail.html') initDetailPage();
  else if (page === 'index.html' || page === '' || page === '/') initHomePage();
  // admin.html has inline scripts, no routing needed
});

/* ════════════════════════════════════════
   HOME PAGE
   ════════════════════════════════════════ */
let ALL = [];
let activeCat = 'all';

async function initHomePage() {
  ALL = await loadApps();
  buildCats();
  renderGrid(sorted(filtered()));
  updateHeroStats();
  bindSearch();
  bindSort();
}

// Fetch apps.json (cache-busted in dev)
async function loadApps() {
  try {
    const bust = location.hostname === 'localhost' || location.hostname === '127.0.0.1'
      ? `?t=${Date.now()}` : '';
    const res  = await fetch(`data/apps.json${bust}`);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    // FIX: make sure we always return an array
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.error('Could not load apps.json:', e);
    showGridError();
    return [];
  }
}

function showGridError() {
  const grid = document.getElementById('appGrid');
  if (!grid) return;
  grid.innerHTML = `
    <div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:var(--t2)">
      <div style="font-size:3rem;margin-bottom:12px">⚠️</div>
      <h3 style="color:var(--t1);margin-bottom:8px">Could not load apps</h3>
      <p>Make sure <code>data/apps.json</code> exists in your repo.</p>
    </div>`;
}

function buildCats() {
  const bar  = document.getElementById('catBar');
  if (!bar) return;
  const cats = [...new Set(ALL.map(a => a.category).filter(Boolean))].sort();
  cats.forEach(c => {
    const btn = document.createElement('button');
    btn.className   = 'cat';
    btn.textContent = c;
    btn.dataset.cat = c;
    btn.addEventListener('click', () => { activeCat = c; syncCats(btn); doFilter(); });
    bar.appendChild(btn);
  });
  // All button
  bar.querySelector('[data-cat="all"]')?.addEventListener('click', function() {
    activeCat = 'all'; syncCats(this); doFilter();
  });
}

function syncCats(active) {
  document.querySelectorAll('.cat').forEach(b => b.classList.remove('active'));
  active.classList.add('active');
}

function bindSearch() {
  document.getElementById('searchInput')?.addEventListener('input', doFilter);
}
function bindSort() {
  document.getElementById('sortSel')?.addEventListener('change', doFilter);
}

function doFilter() {
  renderGrid(sorted(filtered()));
  updateGridTitle();
}

function filtered() {
  const q = (document.getElementById('searchInput')?.value || '').toLowerCase().trim();
  return ALL.filter(a => {
    const catOk = activeCat === 'all' || a.category === activeCat;
    const srOk  = !q || a.name?.toLowerCase().includes(q) ||
                        a.shortDesc?.toLowerCase().includes(q) ||
                        a.category?.toLowerCase().includes(q);
    return catOk && srOk;
  });
}

function sorted(arr) {
  const s = document.getElementById('sortSel')?.value || 'newest';
  return [...arr].sort((a, b) => {
    if (s === 'name')   return (a.name || '').localeCompare(b.name || '');
    if (s === 'rating') return (b.rating || 0) - (a.rating || 0);
    return new Date(b.date || 0) - new Date(a.date || 0); // newest
  });
}

function renderGrid(apps) {
  const grid  = document.getElementById('appGrid');
  const empty = document.getElementById('empty');
  if (!grid) return;
  grid.innerHTML = '';
  if (!apps.length) { empty?.classList.remove('hidden'); return; }
  empty?.classList.add('hidden');
  apps.forEach(app => grid.appendChild(makeCard(app)));
  document.getElementById('countBadge').textContent =
    `${apps.length} app${apps.length !== 1 ? 's' : ''}`;
}

function makeCard(app) {
  const a = document.createElement('a');
  a.className = 'card';
  a.href      = `detail.html?id=${enc(app.id)}`;

  // Resolve asset URL (works on both localhost and GitHub Pages)
  const iconSrc = resolveAsset(app.icon);
  const stars   = starsStr(localRating(app) || app.rating || 0);

  a.innerHTML = `
    <img class="card-img" src="${iconSrc}" alt="${esc(app.name)}" loading="lazy"
         onerror="this.src='https://placehold.co/300x300/1c2118/6dff6a?text=${enc(app.name || 'App')}'" />
    <div class="card-body">
      <div class="card-name">${esc(app.name)}</div>
      <div class="card-desc">${esc(app.shortDesc || '')}</div>
      <div class="card-foot">
        <span class="card-cat">${esc(app.category || 'App')}</span>
        <span class="card-stars">${stars}</span>
      </div>
      <div class="card-foot" style="margin-top:3px">
        <span>v${esc(app.version || '1.0')}</span>
        <span>${esc(app.size || '')}</span>
      </div>
    </div>`;
  return a;
}

function updateHeroStats() {
  const cats = new Set(ALL.map(a => a.category).filter(Boolean));
  setText('statTotal', ALL.length);
  setText('statCats',  cats.size);
}

function updateGridTitle() {
  const q   = document.getElementById('searchInput')?.value.trim();
  const el  = document.getElementById('gridTitle');
  if (!el) return;
  if (q)                   el.textContent = `Results for "${q}"`;
  else if (activeCat !== 'all') el.textContent = activeCat;
  else                     el.textContent = 'All Apps';
}

/* ════════════════════════════════════════
   DETAIL PAGE
   ════════════════════════════════════════ */
let detailApp = null;

async function initDetailPage() {
  const id   = new URLSearchParams(location.search).get('id');
  const apps = await loadApps();

  const app  = apps.find(a => a.id === id);

  document.getElementById('detailLoad').classList.add('hidden');

  if (!app) {
    document.getElementById('notFound').classList.remove('hidden');
    return;
  }

  detailApp = app;
  renderDetail(app);
  initStars(app);
}

function renderDetail(app) {
  const wrap = document.getElementById('detailWrap');
  wrap.classList.remove('hidden');

  // Page head
  document.title = `${app.name} – APKVault`;
  document.getElementById('pageTitle').textContent = `${app.name} – APKVault`;
  document.getElementById('metaDesc').content      = app.shortDesc || app.name;
  document.getElementById('bcName').textContent    = app.name;

  // Icon
  const icon = document.getElementById('dIcon');
  icon.src = resolveAsset(app.icon);
  icon.alt = app.name;
  icon.onerror = () => {
    icon.src = `https://placehold.co/110x110/1c2118/6dff6a?text=${enc(app.name||'App')}`;
  };

  // Basics
  setText('dName', app.name);
  setText('dCat',  app.category || 'App');

  // Rating (prefer local vote)
  const rating = localRating(app) || app.rating || 0;
  const count  = app.ratingCount || 0;
  setText('starsShow', starsStr(rating));
  setText('ratingTxt',
    count ? `${Number(rating).toFixed(1)} (${count} rating${count !== 1 ? 's' : ''})` : 'No ratings yet'
  );

  // Chips
  const chips = document.getElementById('chips');
  chips.innerHTML = `
    <span class="chip">v${esc(app.version || '1.0')}</span>
    <span class="chip">${esc(app.size || 'Unknown size')}</span>
    <span class="chip chip-g">Free</span>
    <span class="chip">${esc(app.date || '')}</span>`;

  // Download button
  const dlBtn = document.getElementById('dlBtn');
  if (app.apkFile) {
    dlBtn.href     = resolveAsset(app.apkFile);
    dlBtn.download = `${app.name}.apk`;
    dlBtn.addEventListener('click', () => trackDownload(app.id));
  } else {
    dlBtn.style.opacity = '.4';
    dlBtn.style.pointerEvents = 'none';
    dlBtn.innerHTML = '<span>⚠</span> No APK uploaded yet';
  }
  setText('dlCount', app.downloads ? `${app.downloads.toLocaleString()} downloads` : '');

  // Screenshots
  if (app.screenshots?.length) {
    const sec  = document.getElementById('ssSection');
    const wrap = document.getElementById('ssScroll');
    sec.classList.remove('hidden');
    wrap.innerHTML = app.screenshots.map(s => `
      <img src="${resolveAsset(s)}" alt="Screenshot"
           onerror="this.style.display='none'" loading="lazy" />`
    ).join('');
  }

  // Description
  setText('dDesc', app.description || 'No description provided.');

  // Version history
  const vl   = document.getElementById('verList');
  const hist = app.versionHistory?.length
    ? app.versionHistory
    : [{ version: app.version || '1.0', date: app.date || '', note: 'Initial release' }];

  vl.innerHTML = hist.map(v => `
    <div class="ver-item">
      <span class="ver-tag">v${esc(v.version || '?')}</span>
      <span class="ver-note">${esc(v.note || '')}</span>
      <span class="ver-date">${esc(v.date || '')}</span>
    </div>`).join('');
}

/* Track downloads in localStorage (counts per-device) */
function trackDownload(id) {
  const key   = `dl_${id}`;
  const count = parseInt(localStorage.getItem(key) || '0') + 1;
  localStorage.setItem(key, count);
}

/* ── Star Rating (localStorage only — no server) ──────────────── */
function initStars(app) {
  const box    = document.getElementById('rateBox');
  const input  = document.getElementById('starsIn');
  const doneEl = document.getElementById('ratedOk');

  // Already rated?
  if (localStorage.getItem(`rated_${app.id}`)) {
    input?.classList.add('hidden');
    doneEl?.classList.remove('hidden');
    return;
  }

  document.querySelectorAll('#starsIn .s').forEach(s => {
    s.addEventListener('mouseover', () => highlightTo(s.dataset.v));
    s.addEventListener('mouseleave', resetStarUI);
    s.addEventListener('click', () => submitRating(s.dataset.v, app));
  });
}

function highlightTo(val) {
  document.querySelectorAll('#starsIn .s').forEach(s =>
    s.classList.toggle('on', +s.dataset.v <= +val)
  );
}
function resetStarUI() {
  document.querySelectorAll('#starsIn .s').forEach(s => s.classList.remove('on'));
}

function submitRating(val, app) {
  /* Since we have no backend, we store the rating in localStorage.
     The displayed rating will reflect the user's personal vote.
     For a shared live average you would need a serverless function. */
  const v = Number(val);
  localStorage.setItem(`rated_${app.id}`, v);

  document.getElementById('starsIn')?.classList.add('hidden');
  document.getElementById('ratedOk')?.classList.remove('hidden');

  // Update display
  setText('starsShow', starsStr(v));
  setText('ratingTxt', `You rated this ${v}/5 ★`);
}

/* Return user's local rating for an app (if any) */
function localRating(app) {
  const v = localStorage.getItem(`rated_${app.id}`);
  return v ? Number(v) : null;
}

/* ── Helpers ───────────────────────────────────────────────────── */

/**
 * Resolve a relative asset path so it works:
 *   - in development (file:// or localhost)
 *   - on GitHub Pages (https://user.github.io/repo/)
 *
 * Asset paths in apps.json are relative, e.g. "apks/app.apk"
 * On GitHub Pages the repo sits at /REPO_NAME/ so we need to
 * prefix with the base path.
 */
function resolveAsset(path) {
  if (!path) return '';
  // Already absolute URL
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  // Detect GitHub Pages base path (everything before the last segment)
  const base = location.pathname.replace(/\/[^/]*$/, '/');
  return base + path;
}

function starsStr(rating) {
  const full  = Math.round(rating);
  return '★'.repeat(Math.min(5, full)) + '☆'.repeat(Math.max(0, 5 - full));
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val ?? '';
}

function esc(s) {
  return String(s ?? '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function enc(s) {
  return encodeURIComponent(String(s ?? ''));
}
