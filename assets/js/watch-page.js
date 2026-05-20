// ============================================
// WATCH PAGE - AnimeVault
// ============================================

import { initAuth, updateUserUI } from './auth.js';
import { initSearch } from './search.js';
import { fetchAnimeById, getStreamUrl } from './api.js';
import { updateContinueWatching, saveWatchProgress, addToWatchHistory } from './storage.js';

let currentAnime = null;
let currentEpisode = 1;
let currentType = 'sub';
let animeId = null;
let totalEpisodes = 12;

document.addEventListener('DOMContentLoaded', async () => {
    initAuth();
    initSearch();
    initNavbar();

    // Get URL params
    const params = new URLSearchParams(window.location.search);
    animeId = params.get('id');
    currentEpisode = parseInt(params.get('ep')) || 1;
    currentType = params.get('type') || 'sub';

    if (!animeId) {
        window.location.href = 'index.html';
        return;
    }

    await loadWatchPage();

    // Hide loader
    const loader = document.getElementById('loading-screen');
    if (loader) {
        loader.classList.add('hidden');
        setTimeout(() => loader.remove(), 500);
    }
});

function initNavbar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    });
}

async function loadWatchPage() {
    try {
        const anime = await fetchAnimeById(animeId);
        currentAnime = anime;
        totalEpisodes = anime.episodes || 12;

        // Update title
        document.title = `EP ${currentEpisode} - ${anime.title_english || anime.title} - AnimeVault`;

        // Update player
        updatePlayer();

        // Update episode info
        updateEpisodeInfo(anime);

        // Render episode list
        renderEpisodeList();

        // Init controls
        initPlayerControls();
        initServerSelector();
        initStreamToggle();
        initNavigationButtons();

        // Save to history
        addToWatchHistory(animeId, anime, currentEpisode);
        updateContinueWatching(animeId, anime, currentEpisode, 0, totalEpisodes);

    } catch (error) {
        console.error('Error loading watch page:', error);
        document.getElementById('player-error')?.classList.remove('hidden');
    }
}

function updatePlayer() {
    const iframe = document.getElementById('video-player');
    const loader = document.getElementById('player-loader');
    const title = document.getElementById('player-title');

    if (iframe) {
        const streamUrl = getStreamUrl(animeId, currentEpisode, currentType);
        iframe.src = streamUrl;

        iframe.onload = () => {
            if (loader) loader.classList.add('hidden');
        };

        iframe.onerror = () => {
            if (loader) loader.classList.add('hidden');
            document.getElementById('player-error')?.classList.remove('hidden');
        };
    }

    if (title && currentAnime) {
        title.textContent = `${currentAnime.title_english || currentAnime.title} - EP ${currentEpisode}`;
    }
}

function updateEpisodeInfo(anime) {
    const title = document.getElementById('episode-title');
    const meta = document.getElementById('episode-meta');

    if (title) {
        title.textContent = `${anime.title_english || anime.title} - Episode ${currentEpisode}`;
    }

    if (meta) {
        meta.innerHTML = `
            <span><i class="fas fa-tv"></i> ${anime.type || 'TV'}</span>
            <span><i class="fas fa-list-ol"></i> EP ${currentEpisode}/${totalEpisodes}</span>
            <span><i class="fas fa-closed-captioning"></i> ${currentType.toUpperCase()}</span>
        `;
    }
}

function renderEpisodeList() {
    const list = document.getElementById('episodes-list');
    if (!list) return;

    list.innerHTML = Array.from({ length: totalEpisodes }, (_, i) => {
        const epNum = i + 1;
        const isActive = epNum === currentEpisode;

        return `
            <a href="watch.html?id=${animeId}&ep=${epNum}&type=${currentType}" 
               class="episode-card ${isActive ? 'active' : ''}">
                <div class="episode-number">${epNum}</div>
                <div class="episode-info">
                    <h4>Episode ${epNum}</h4>
                    <p>${currentAnime?.title_english || currentAnime?.title || ''}</p>
                </div>
            </a>
        `;
    }).join('');

    // Scroll to current episode
    setTimeout(() => {
        const activeEp = list.querySelector('.episode-card.active');
        if (activeEp) {
            activeEp.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, 100);

    // Episode search
    const sidebarSearch = document.getElementById('sidebar-ep-search');
    if (sidebarSearch) {
        sidebarSearch.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            list.querySelectorAll('.episode-card').forEach(card => {
                const text = card.textContent.toLowerCase();
                card.style.display = text.includes(query) ? 'flex' : 'none';
            });
        });
    }
}

function initPlayerControls() {
    const theaterBtn = document.getElementById('theater-mode-btn');
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const nextEpBtn = document.getElementById('next-ep-btn');
    const skipIntroBtn = document.getElementById('skip-intro-btn');

    if (theaterBtn) {
        theaterBtn.addEventListener('click', toggleTheaterMode);
    }

    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', () => {
            const player = document.getElementById('player-container');
            if (player) {
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                } else {
                    player.requestFullscreen();
                }
            }
        });
    }

    if (playPauseBtn) {
        playPauseBtn.addEventListener('click', () => {
            const iframe = document.getElementById('video-player');
            // Note: Can't control iframe content directly, this is UI feedback
            const icon = playPauseBtn.querySelector('i');
            icon.classList.toggle('fa-play');
            icon.classList.toggle('fa-pause');
        });
    }

    if (nextEpBtn) {
        nextEpBtn.addEventListener('click', goToNextEpisode);
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT') return;

        switch(e.key) {
            case 'f':
                e.preventDefault();
                fullscreenBtn?.click();
                break;
            case 't':
                e.preventDefault();
                theaterBtn?.click();
                break;
            case 'n':
                e.preventDefault();
                goToNextEpisode();
                break;
            case 'ArrowRight':
                // Skip forward 10s - would need player API access
                break;
            case 'ArrowLeft':
                // Skip back 10s
                break;
            case ' ':
                e.preventDefault();
                playPauseBtn?.click();
                break;
        }
    });
}

function toggleTheaterMode() {
    document.body.classList.toggle('theater-mode');
    const icon = document.querySelector('#theater-mode-btn i');
    if (icon) {
        icon.classList.toggle('fa-expand-alt');
        icon.classList.toggle('fa-compress-alt');
    }
}

function initServerSelector() {
    const serverBtns = document.querySelectorAll('.server-btn');
    serverBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            serverBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            // Reload player with selected server
            updatePlayer();
        });
    });
}

function initStreamToggle() {
    const toggles = document.querySelectorAll('.stream-toggle .toggle-btn');
    toggles.forEach(btn => {
        btn.addEventListener('click', () => {
            toggles.forEach(t => t.classList.remove('active'));
            btn.classList.add('active');
            currentType = btn.dataset.type;
            updatePlayer();
            updateURL();
        });
    });

    // Set initial active state
    toggles.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.type === currentType);
    });
}

function initNavigationButtons() {
    const prevBtn = document.getElementById('prev-ep-btn');
    const nextBtn2 = document.getElementById('next-ep-btn2');
    const epListBtn = document.getElementById('ep-list-btn');

    if (prevBtn) {
        prevBtn.disabled = currentEpisode <= 1;
        prevBtn.addEventListener('click', () => {
            if (currentEpisode > 1) {
                goToEpisode(currentEpisode - 1);
            }
        });
    }

    if (nextBtn2) {
        nextBtn2.disabled = currentEpisode >= totalEpisodes;
        nextBtn2.addEventListener('click', goToNextEpisode);
    }

    if (epListBtn) {
        epListBtn.addEventListener('click', () => {
            const sidebar = document.getElementById('episodes-sidebar');
            sidebar?.scrollIntoView({ behavior: 'smooth' });
        });
    }
}

function goToNextEpisode() {
    if (currentEpisode < totalEpisodes) {
        goToEpisode(currentEpisode + 1);
    }
}

function goToEpisode(ep) {
    window.location.href = `watch.html?id=${animeId}&ep=${ep}&type=${currentType}`;
}

function updateURL() {
    const url = new URL(window.location);
    url.searchParams.set('type', currentType);
    window.history.replaceState({}, '', url);
}
