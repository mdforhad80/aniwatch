import { debounce, throttle, $ } from './utils.js';

// ── Loading Screen ─────────────────────────────────────────────────────────
export function hideLoader() {
  setTimeout(() => {
    const screen = document.getElementById('loading-screen');
    if (screen) screen.classList.add('hidden');
  }, 1400);
}

// ── Custom Cursor ──────────────────────────────────────────────────────────
export function initCursor() {
  const dot = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;

  let mx = 0, my = 0, rx = 0, ry = 0;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  function animate() {
    dot.style.left = mx + 'px'; dot.style.top = my + 'px';
    rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
    ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
    requestAnimationFrame(animate);
  }
  animate();

  document.addEventListener('mouseenter', () => { dot.style.opacity = '1'; ring.style.opacity = '1'; });
  document.addEventListener('mouseleave', () => { dot.style.opacity = '0'; ring.style.opacity = '0'; });
}

// ── Particles ─────────────────────────────────────────────────────────────
export function initParticles() {
  const container = document.getElementById('particles');
  if (!container) return;
  const colors = ['#8b5cf6', '#d946ef', '#06b6d4', '#a78bfa'];
  for (let i = 0; i < 25; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 4 + 1;
    const duration = Math.random() * 20 + 15;
    const delay = Math.random() * 20;
    const left = Math.random() * 100;
    const drift = (Math.random() - 0.5) * 200;
    p.style.cssText = `
      width:${size}px; height:${size}px;
      background:${colors[Math.floor(Math.random() * colors.length)]};
      left:${left}%;
      animation-duration:${duration}s;
      animation-delay:-${delay}s;
      --drift:${drift}px;
      box-shadow: 0 0 ${size*2}px ${colors[Math.floor(Math.random()*colors.length)]};
    `;
    container.appendChild(p);
  }
}

// ── Sticky Navbar ──────────────────────────────────────────────────────────
export function initNavbar() {
  const nav = document.getElementById('navbar');
  if (!nav) return;
  window.addEventListener('scroll', throttle(() => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  }, 50));
}

// ── Hero Slider ────────────────────────────────────────────────────────────
export function initHeroSlider(slides) {
  let current = 0, timer;
  const container = $('.hero-slides');
  const dotsContainer = $('.hero-dots');
  if (!container) return;

  function render() {
    container.innerHTML = '';
    if (dotsContainer) dotsContainer.innerHTML = '';

    slides.forEach((slide, i) => {
      const s = document.createElement('div');
      s.className = `hero-slide ${i === 0 ? 'active' : ''}`;
      s.innerHTML = `
        <div class="hero-bg" style="background-image:url('${slide.banner}')"></div>
        <div class="hero-overlay"></div>
        <div class="hero-content">
          <div class="hero-badge">🔥 ${slide.badge || 'Trending Now'}</div>
          <h1 class="hero-title">${slide.title}</h1>
          <div class="hero-meta">
            ${slide.score ? `<span class="hero-meta-item score">⭐ ${slide.score}</span>` : ''}
            ${slide.type ? `<span class="hero-meta-item">${slide.type}</span>` : ''}
            ${slide.episodes ? `<span class="hero-meta-item">EP ${slide.episodes}</span>` : ''}
            ${slide.status ? `<span class="hero-meta-item">${slide.status}</span>` : ''}
          </div>
          <p class="hero-desc">${slide.synopsis || ''}</p>
          <div class="hero-tags">${(slide.genres || []).slice(0,4).map(g => `<span class="hero-tag">${g}</span>`).join('')}</div>
          <div class="hero-actions">
            <a href="watch.html?id=${slide.mal_id}&ep=1&type=sub" class="btn btn-primary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              Watch Now
            </a>
            <a href="anime.html?id=${slide.mal_id}" class="btn btn-secondary">More Info</a>
          </div>
        </div>
      `;
      container.appendChild(s);

      if (dotsContainer) {
        const dot = document.createElement('button');
        dot.className = `hero-dot ${i === 0 ? 'active' : ''}`;
        dot.addEventListener('click', () => goTo(i));
        dotsContainer.appendChild(dot);
      }
    });
  }

  function goTo(idx) {
    const all = container.querySelectorAll('.hero-slide');
    const dots = dotsContainer?.querySelectorAll('.hero-dot');
    all[current]?.classList.remove('active');
    dots?.[current]?.classList.remove('active');
    current = (idx + slides.length) % slides.length;
    all[current]?.classList.add('active');
    dots?.[current]?.classList.add('active');
    resetTimer();
  }

  function resetTimer() {
    clearInterval(timer);
    timer = setInterval(() => goTo(current + 1), 6000);
  }

  // Arrows
  document.querySelector('.hero-arrow-next')?.addEventListener('click', () => goTo(current + 1));
  document.querySelector('.hero-arrow-prev')?.addEventListener('click', () => goTo(current - 1));

  if (slides.length > 0) { render(); resetTimer(); }
}

// ── Keyboard Shortcuts ─────────────────────────────────────────────────────
export function initKeyboardShortcuts() {
  document.addEventListener('keydown', e => {
    // Focus search on '/'
    if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
      e.preventDefault();
      document.querySelector('#nav-search-input, .search-hero-bar input')?.focus();
    }
    // Escape closes dropdowns
    if (e.key === 'Escape') {
      document.querySelectorAll('.search-dropdown.visible').forEach(el => el.classList.remove('visible'));
      document.activeElement?.blur();
    }
  });
}

// ── Init All ───────────────────────────────────────────────────────────────
export function initApp() {
  hideLoader();
  initCursor();
  initParticles();
  initNavbar();
  initKeyboardShortcuts();
}
