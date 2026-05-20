// ── Utility Functions ──────────────────────────────────────────────────────

export function debounce(fn, delay = 300) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
}

export function throttle(fn, limit = 100) {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) { fn(...args); inThrottle = true; setTimeout(() => inThrottle = false, limit); }
  };
}

export function $(sel, ctx = document) { return ctx.querySelector(sel); }
export function $$(sel, ctx = document) { return [...ctx.querySelectorAll(sel)]; }

export function el(tag, attrs = {}, ...children) {
  const e = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === 'class') e.className = v;
    else if (k === 'html') e.innerHTML = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else e.setAttribute(k, v);
  });
  children.flat().forEach(c => {
    if (typeof c === 'string') e.appendChild(document.createTextNode(c));
    else if (c) e.appendChild(c);
  });
  return e;
}

export function formatScore(score) {
  if (!score) return 'N/A';
  return score.toFixed(1);
}

export function truncate(str, len = 150) {
  if (!str) return '';
  return str.length > len ? str.slice(0, len).trim() + '…' : str;
}

export function getParam(key) {
  return new URLSearchParams(window.location.search).get(key);
}

export function setParam(key, val) {
  const url = new URL(window.location);
  url.searchParams.set(key, val);
  window.history.pushState({}, '', url);
}

export function timeAgo(date) {
  const d = new Date(date), now = new Date();
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
  return `${Math.floor(diff/86400)}d ago`;
}

export function lazyLoadImages() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const img = e.target;
        if (img.dataset.src) { img.src = img.dataset.src; delete img.dataset.src; }
        io.unobserve(img);
      }
    });
  }, { rootMargin: '100px' });
  document.querySelectorAll('img[data-src]').forEach(img => io.observe(img));
}

export function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const icons = { success: '✓', error: '✕', info: 'ℹ' };
  const toast = el('div', { class: `toast ${type}` },
    el('span', { class: 'toast-icon' }, icons[type] || icons.info),
    el('span', {}, message)
  );
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    toast.style.transition = '0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

export function createSkeleton(count = 6, aspect = '2/3') {
  return Array.from({ length: count }, () =>
    el('div', { class: 'skeleton skeleton-card', style: `aspect-ratio:${aspect}; border-radius:12px` })
  );
}

export function getTypeColor(type) {
  const map = { TV: '#8b5cf6', Movie: '#06b6d4', OVA: '#f59e0b', ONA: '#ec4899', Special: '#6b7280' };
  return map[type] || '#8b5cf6';
}

// Image with fallback
export function imgWithFallback(src, alt = '', classes = '') {
  const img = el('img', { src: src || '', alt, class: classes });
  img.onerror = () => { img.src = 'assets/images/no-image.svg'; };
  return img;
}

// Countdown timer
export function countdown(targetDate) {
  const diff = new Date(targetDate) - new Date();
  if (diff <= 0) return 'Aired';
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}
