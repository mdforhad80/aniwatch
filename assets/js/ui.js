import { getAnimeById } from './api.js';

export function createAnimeCard(anime, quickPlay = true) {
  const malId = anime.mal_id;
  const title = anime.title_english || anime.title || 'Unknown';
  const poster = anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || '';
  const score = anime.score || '—';
  const eps = anime.episodes || '?';
  const type = anime.type || 'TV';
  const status = anime.status || '';

  const card = document.createElement('a');
  card.href = `anime.html?id=${malId}`;
  card.className = 'anime-card';
  card.innerHTML = `
    <img class="card-poster" src="${poster}" alt="${title}" loading="lazy" onerror="this.style.background='var(--bg-tertiary)'">
    <div class="card-overlay"></div>
    ${status === 'Complete' ? '<span class="card-badge badge-completed">Done</span>' : ''}
    ${score >= 8 ? `<span class="card-badge badge-trending">★ ${score}</span>` : ''}
    ${quickPlay ? '<span class="quick-play">▶</span>' : ''}
    <div class="card-info">
      <div class="card-title">${title}</div>
      <div class="card-meta"><span>⭐ ${score}</span><span>${type}</span><span>${eps} ep</span></div>
    </div>`;
  card.querySelector('.quick-play')?.addEventListener('click', (e) => {
    e.preventDefault(); e.stopPropagation();
    window.location.href = `watch.html?id=${malId}&ep=1&type=sub`;
  });
  return card;
}

export function skeletonCard() {
  const d = document.createElement('div'); d.className='anime-card';
  d.innerHTML = '<div class="skeleton skeleton-poster"></div><div style="padding:10px"><div class="skeleton skeleton-text"></div><div class="skeleton skeleton-text short"></div></div>';
  return d;
}

// Load navbar & sidebar from components/
export async function loadLayout() {
  const navbarResp = await fetch('components/navbar.html');
  const sidebarResp = await fetch('components/sidebar.html');
  document.getElementById('navbar-container').innerHTML = await navbarResp.text();
  document.getElementById('sidebar-container').innerHTML = await sidebarResp.text();
}

// Hero slider, continue watching, etc. – same as before but exported
