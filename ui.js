import { formatScore, truncate, getTypeColor, imgWithFallback } from './utils.js';

// ── Navbar HTML ────────────────────────────────────────────────────────────
export function renderNavbar(activePage = '') {
  const pages = [
    { href: 'index.html', label: 'Home', id: 'home' },
    { href: 'search.html', label: 'Browse', id: 'browse' },
    { href: 'schedule.html', label: 'Schedule', id: 'schedule' },
  ];

  return `
  <nav id="navbar">
    <a href="index.html" class="nav-logo">ANIMEHUB</a>
    <div class="nav-links">
      ${pages.map(p => `<a href="${p.href}" class="nav-link ${activePage === p.id ? 'active' : ''}">${p.label}</a>`).join('')}
    </div>
    <div class="nav-search">
      <input type="text" id="nav-search-input" placeholder="Search anime..." autocomplete="off">
      <svg class="nav-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
      <div id="search-dropdown"></div>
    </div>
    <div class="nav-actions">
      <div id="nav-auth-btns" style="display:flex;gap:8px">
        <a href="login.html" class="nav-btn nav-btn-ghost">Login</a>
        <a href="signup.html" class="nav-btn nav-btn-primary">Sign Up</a>
      </div>
      <div id="nav-user-menu" class="nav-avatar-wrap hidden">
        <div class="nav-avatar" id="nav-avatar-letter">U</div>
        <div class="nav-dropdown">
          <a href="profile.html">My Profile</a>
          <a href="profile.html#history">Watch History</a>
          <a href="profile.html#bookmarks">Bookmarks</a>
          <button id="nav-logout-btn">Logout</button>
        </div>
      </div>
    </div>
  </nav>`;
}

// ── Anime Card ─────────────────────────────────────────────────────────────
export function animeCard(anime) {
  const title = anime.title_english || anime.title;
  const img = anime.images?.webp?.large_image_url || anime.images?.jpg?.large_image_url || 'assets/images/no-image.svg';
  const score = anime.score ? `⭐ ${formatScore(anime.score)}` : '';
  const type = anime.type || '';
  const eps = anime.episodes ? `EP ${anime.episodes}` : '';
  const genres = (anime.genres || []).slice(0, 2).map(g => g.name);

  return `
  <a href="anime.html?id=${anime.mal_id}" class="anime-card fade-in">
    <div class="anime-card-poster">
      <img src="${img}" alt="${title}" loading="lazy" onerror="this.src='assets/images/no-image.svg'">
      <div class="anime-card-badge badge-sub">${type || 'SUB'}</div>
      ${eps ? `<div class="badge-ep">${eps}</div>` : ''}
      <div class="anime-card-overlay">
        <div class="card-play-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
        </div>
      </div>
    </div>
    <div class="anime-card-info">
      <div class="anime-card-title" title="${title}">${title}</div>
      <div class="anime-card-meta">
        ${score ? `<span class="card-score">${score}</span>` : ''}
        ${type ? `<span>${type}</span>` : ''}
      </div>
      ${genres.length ? `<div class="card-genres">${genres.map(g => `<span class="card-genre">${g}</span>`).join('')}</div>` : ''}
    </div>
  </a>`;
}

// ── Section Header ─────────────────────────────────────────────────────────
export function sectionHeader(title, linkHref = '', linkText = 'View All') {
  return `
  <div class="section-header">
    <h2 class="section-title">${title}</h2>
    ${linkHref ? `<a href="${linkHref}" class="section-link">${linkText} →</a>` : ''}
  </div>`;
}

// ── Skeleton Cards ─────────────────────────────────────────────────────────
export function skeletonCards(count = 6) {
  return Array.from({ length: count }, () =>
    `<div class="skeleton skeleton-card" style="border-radius:12px;aspect-ratio:2/3"></div>`
  ).join('');
}

// ── Footer HTML ────────────────────────────────────────────────────────────
export function renderFooter() {
  return `
  <footer>
    <div class="footer-grid">
      <div>
        <div class="footer-brand-name">ANIMEHUB</div>
        <p class="footer-desc">Your ultimate anime streaming destination. Watch the latest and greatest anime in HD quality with sub and dub options.</p>
        <div class="footer-social">
          <a href="https://discord.gg" target="_blank" class="footer-social-btn">💬</a>
          <a href="https://github.com" target="_blank" class="footer-social-btn">🐙</a>
          <a href="https://twitter.com" target="_blank" class="footer-social-btn">🐦</a>
        </div>
      </div>
      <div>
        <div class="footer-col-title">Browse</div>
        <div class="footer-col-links">
          <a href="search.html">All Anime</a>
          <a href="search.html?filter=airing">Currently Airing</a>
          <a href="search.html?filter=upcoming">Upcoming</a>
          <a href="search.html?filter=movie">Movies</a>
          <a href="schedule.html">Schedule</a>
        </div>
      </div>
      <div>
        <div class="footer-col-title">Account</div>
        <div class="footer-col-links">
          <a href="profile.html">My Profile</a>
          <a href="profile.html#bookmarks">Bookmarks</a>
          <a href="profile.html#history">Watch History</a>
          <a href="profile.html#favorites">Favorites</a>
        </div>
      </div>
      <div>
        <div class="footer-col-title">Info</div>
        <div class="footer-col-links">
          <a href="creator.html">About</a>
          <a href="https://myanimelist.net" target="_blank">MyAnimeList</a>
          <a href="https://jikan.moe" target="_blank">Jikan API</a>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© 2025 AnimeHub. All rights reserved. | Content powered by Jikan/MyAnimeList.</span>
      <span>Built with ❤️ for anime lovers</span>
    </div>
  </footer>`;
}

// ── Mobile Nav HTML ────────────────────────────────────────────────────────
export function renderMobileNav(activePage = '') {
  const items = [
    { href: 'index.html', label: 'Home', id: 'home', icon: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>' },
    { href: 'search.html', label: 'Browse', id: 'browse', icon: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>' },
    { href: 'schedule.html', label: 'Schedule', id: 'schedule', icon: '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>' },
    { href: 'profile.html', label: 'Profile', id: 'profile', icon: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>' },
  ];

  return `
  <nav id="mobile-nav">
    <div class="mobile-nav-items">
      ${items.map(item => `
        <a href="${item.href}" class="mobile-nav-item ${activePage === item.id ? 'active' : ''}">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            ${item.icon}
          </svg>
          <span class="mobile-nav-label">${item.label}</span>
        </a>
      `).join('')}
    </div>
  </nav>`;
}

// ── Toast Container ────────────────────────────────────────────────────────
export function renderToastContainer() {
  return `<div id="toast-container"></div>`;
}

// ── Page Head Meta ─────────────────────────────────────────────────────────
export function getPageHead(title, description = '', ogImage = '') {
  return `
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} | AnimeHub</title>
    <meta name="description" content="${description || 'Watch anime online in HD quality with AnimeHub'}">
    <meta property="og:title" content="${title} | AnimeHub">
    <meta property="og:description" content="${description || 'Watch anime online in HD quality'}">
    ${ogImage ? `<meta property="og:image" content="${ogImage}">` : ''}
    <meta property="og:type" content="website">
    <meta name="twitter:card" content="summary_large_image">
    <link rel="stylesheet" href="assets/css/main.css">
    <link rel="manifest" href="manifest.json">
    <link rel="icon" href="favicon.ico">
  `;
}
