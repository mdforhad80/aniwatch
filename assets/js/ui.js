// ============================================
// UI UTILITIES & EFFECTS - AnimeVault
// ============================================

// Initialize Particles
export function initParticles() {
    const container = document.getElementById('particles');
    if (!container) return;

    const particleCount = window.innerWidth < 768 ? 15 : 30;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 15 + 's';
        particle.style.animationDuration = (10 + Math.random() * 10) + 's';
        particle.style.width = (2 + Math.random() * 4) + 'px';
        particle.style.height = particle.style.width;
        particle.style.opacity = 0.1 + Math.random() * 0.3;
        container.appendChild(particle);
    }
}

// Initialize Cursor Glow
export function initCursorGlow() {
    const glow = document.getElementById('cursor-glow');
    if (!glow || window.matchMedia('(pointer: coarse)').matches) return;

    let mouseX = 0, mouseY = 0;
    let glowX = 0, glowY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function animate() {
        glowX += (mouseX - glowX) * 0.1;
        glowY += (mouseY - glowY) * 0.1;
        glow.style.left = glowX + 'px';
        glow.style.top = glowY + 'px';
        requestAnimationFrame(animate);
    }
    animate();
}

// Scroll Reveal Animation
export function initScrollReveal() {
    const elements = document.querySelectorAll('.scroll-reveal');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
            }
        });
    }, { threshold: 0.1 });

    elements.forEach(el => observer.observe(el));
}

// Toast Notification
export function showToast(message, type = 'info') {
    let toast = document.getElementById('toast-container');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast-container';
        toast.style.cssText = `
            position: fixed;
            bottom: 100px;
            right: 20px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 10px;
        `;
        document.body.appendChild(toast);
    }

    const toastEl = document.createElement('div');
    const colors = {
        info: '#8b5cf6',
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b'
    };

    toastEl.style.cssText = `
        background: var(--bg-card);
        border: 1px solid ${colors[type]};
        border-radius: 12px;
        padding: 1rem 1.5rem;
        color: var(--text);
        font-size: 0.9rem;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        animation: slideInRight 0.3s ease;
        max-width: 300px;
        backdrop-filter: blur(10px);
    `;
    toastEl.textContent = message;

    toast.appendChild(toastEl);

    setTimeout(() => {
        toastEl.style.animation = 'slideOutRight 0.3s ease forwards';
        setTimeout(() => toastEl.remove(), 300);
    }, 3000);
}

// Skeleton Loading
export function createSkeletonCard() {
    return `
        <div class="anime-card skeleton-card">
            <div class="anime-card-poster">
                <div class="skeleton" style="width:100%;height:100%;"></div>
            </div>
            <div class="anime-card-info">
                <div class="skeleton" style="width:80%;height:20px;margin-bottom:8px;"></div>
                <div class="skeleton" style="width:50%;height:14px;"></div>
            </div>
        </div>
    `;
}

export function showSkeletonGrid(containerId, count = 8) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = Array(count).fill(0).map(() => createSkeletonCard()).join('');
}

// Format Duration
export function formatDuration(minutes) {
    if (!minutes) return 'Unknown';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
}

// Format Date
export function formatDate(dateString) {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// Debounce Function
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle Function
export function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);
