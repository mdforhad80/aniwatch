// ============================================
// ANIME DETAILS PAGE - AnimeVault
// ============================================

import { initAuth, updateUserUI, handleLogout } from './auth.js';
import { initSearch } from './search.js';
import { initParticles, initCursorGlow, showToast } from './ui.js';
import { fetchAnimeById, fetchAnimeCharacters, fetchRecommendations, fetchRelatedAnime, fetchEpisodes, getStreamUrl } from './api.js';
import { toggleFavorite, isFavorite, toggleBookmark, isBookmarked, addToWatchHistory } from './storage.js';

let currentAnime = null;
let currentType = 'sub';
let animeId = null;

document.addEventListener('DOMContentLoaded', async () => {
    initLoadingScreen();
    initAuth();
    initSearch();
    initParticles();
    initCursorGlow();
    initNavbar();
    initMobileNav();

    // Get anime ID from URL
    const params = new URLSearchParams(window.location.search);
    animeId = params.get('id');

    if (!animeId) {
        window.location.href = 'index.html';
        return;
    }

    await loadAnimeDetails(animeId);
    hideLoadingScreen();
});

function initLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (!loadingScreen) return;
    const progress = loadingScreen.querySelector('.loading-progress');
    let width = 0;
    const interval = setInterval(() => {
        width += Math.random() * 20;
        if (width >= 100) { width = 100; clearInterval(interval); }
        if (progress) progress.style.width = width + '%';
    }, 150);
}

function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (!loadingScreen) return;
    setTimeout(() => {
        loadingScreen.classList.add('hidden');
        setTimeout(() => loadingScreen.remove(), 500);
    }, 800);
}

function initNavbar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    });

    const userMenu = document.getElementById('user-menu');
    const userDropdown = document.getElementById('user-dropdown');
    if (userMenu && userDropdown) {
        userMenu.addEventListener('click', (e) => {
            if (e.target.closest('.btn')) return;
            userDropdown.classList.toggle('hidden');
        });
        document.addEventListener('click', (e) => {
            if (!userMenu.contains(e.target)) userDropdown.classList.add('hidden');
        });
    }
}

function initMobileNav() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navLinks = document.getElementById('nav-links');
    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => navLinks.classList.toggle('active'));
    }
}

async function loadAnimeDetails(id) {
    try {
        const anime = await fetchAnimeById(id);
        currentAnime = anime;

        // Update page title
        document.title = `${anime.title_english || anime.title} - AnimeVault`;
        document.getElementById('page-title').textContent = `${anime.title_english || anime.title} - AnimeVault`;

        // Update meta tags
        updateMetaTags(anime);

        // Render banner
        renderBanner(anime);

        // Render info
        renderAnimeInfo(anime);

        // Render episodes
        renderEpisodes(anime);

        // Load characters
        loadCharacters(id);

        // Load trailer
        renderTrailer(anime);

        // Load related
        loadRelated(id);

        // Load recommendations
        loadRecommendations(id);

        // Init bookmark/favorite buttons
        initActionButtons(anime);

        // Init stream toggle
        initStreamToggle();

    } catch (error) {
        console.error('Error loading anime:', error);
        showToast('Failed to load anime details', 'error');
    }
}

function updateMetaTags(anime) {
    const description = anime.synopsis?.substring(0, 160) || 'Watch anime on AnimeVault';
    let metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.content = description;

    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.content = anime.title_english || anime.title;

    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.content = description;

    let ogImage = document.querySelector('meta[property="og:image"]');
    if (!ogImage) {
        ogImage = document.createElement('meta');
        ogImage.setAttribute('property', 'og:image');
        document.head.appendChild(ogImage);
    }
    ogImage.content = anime.images?.jpg?.large_image_url || '';
}

function renderBanner(anime) {
    const bannerImage = document.getElementById('banner-image');
    const poster = document.getElementById('anime-poster');

    if (bannerImage) {
        const bannerUrl = anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url;
        bannerImage.style.backgroundImage = `url(${bannerUrl})`;
    }

    if (poster) {
        poster.src = anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || '';
        poster.alt = anime.title;
    }
}

function renderAnimeInfo(anime) {
    document.getElementById('anime-title').textContent = anime.title_english || anime.title;
    document.getElementById('anime-japanese-title').textContent = anime.title_japanese || '';

    // Meta
    const meta = document.getElementById('anime-meta');
    meta.innerHTML = `
        <span class="type-badge">${anime.type || 'TV'}</span>
        <span><i class="fas fa-star"></i> ${anime.score || 'N/A'}</span>
        <span><i class="fas fa-list-ol"></i> ${anime.episodes || '?'} EPS</span>
        <span><i class="fas fa-calendar"></i> ${anime.year || 'N/A'}</span>
        <span><i class="fas fa-clock"></i> ${anime.duration || 'N/A'}</span>
        <span><i class="fas fa-shield-alt"></i> ${anime.rating || 'N/A'}</span>
    `;

    // Rating
    const scoreValue = document.getElementById('score-value');
    const ratingStars = document.getElementById('rating-stars');
    const ratingCount = document.getElementById('rating-count');

    if (scoreValue) scoreValue.textContent = anime.score || 'N/A';
    if (ratingStars) {
        const stars = Math.round((anime.score || 0) / 2);
        ratingStars.innerHTML = Array(5).fill(0).map((_, i) => 
            `<i class="fas fa-star${i < stars ? '' : ' far'}"></i>`
        ).join('');
    }
    if (ratingCount) ratingCount.textContent = `${anime.scored_by?.toLocaleString() || 0} users`;

    // Synopsis
    document.getElementById('anime-synopsis').textContent = anime.synopsis || 'No synopsis available.';

    // Info Grid
    const infoGrid = document.getElementById('anime-info-grid');
    const infoItems = [
        { label: 'Country', value: 'Japan' },
        { label: 'Genres', value: anime.genres?.map(g => g.name).join(', ') || 'N/A' },
        { label: 'Premiered', value: anime.season && anime.year ? `${anime.season} ${anime.year}` : 'N/A' },
        { label: 'Date Aired', value: anime.aired?.string || 'N/A' },
        { label: 'Broadcast', value: anime.broadcast?.string || 'N/A' },
        { label: 'Episodes', value: anime.episodes?.toString() || 'N/A' },
        { label: 'Duration', value: anime.duration || 'N/A' },
        { label: 'Status', value: anime.status || 'N/A' },
        { label: 'Studios', value: anime.studios?.map(s => s.name).join(', ') || 'N/A' },
        { label: 'Producers', value: anime.producers?.map(p => p.name).join(', ') || 'N/A' },
    ];

    infoGrid.innerHTML = infoItems.map(item => `
        <div class="info-item">
            <span class="info-label">${item.label}:</span>
            <span class="info-value">${item.value}</span>
        </div>
    `).join('');

    // MAL Link
    const malLink = document.getElementById('mal-link');
    if (malLink) malLink.href = `https://myanimelist.net/anime/${anime.mal_id}/`;

    // Watch button
    const watchBtn = document.getElementById('watch-btn');
    if (watchBtn) {
        watchBtn.href = `watch.html?id=${anime.mal_id}&ep=1&type=sub`;
    }
}

function renderEpisodes(anime) {
    const grid = document.getElementById('episodes-grid');
    const episodeCount = anime.episodes || 12;

    grid.innerHTML = Array.from({ length: episodeCount }, (_, i) => {
        const epNum = i + 1;
        return `
            <a href="watch.html?id=${anime.mal_id}&ep=${epNum}&type=${currentType}" class="episode-card">
                <div class="episode-number">${epNum}</div>
                <div class="episode-info">
                    <h4>Episode ${epNum}</h4>
                    <p>${anime.title_english || anime.title}</p>
                </div>
            </a>
        `;
    }).join('');

    // Episode search filter
    const epSearch = document.getElementById('episode-search');
    if (epSearch) {
        epSearch.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            grid.querySelectorAll('.episode-card').forEach(card => {
                const text = card.textContent.toLowerCase();
                card.style.display = text.includes(query) ? 'flex' : 'none';
            });
        });
    }
}

async function loadCharacters(id) {
    try {
        const characters = await fetchAnimeCharacters(id);
        const carousel = document.getElementById('characters-carousel');
        if (!carousel || !characters) return;

        const mainChars = characters.slice(0, 15);
        carousel.innerHTML = mainChars.map(char => `
            <div class="character-card">
                <img src="${char.character?.images?.jpg?.image_url || ''}" alt="${char.character?.name}" loading="lazy">
                <h4>${char.character?.name}</h4>
                <p>${char.role}</p>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading characters:', error);
    }
}

function renderTrailer(anime) {
    const container = document.getElementById('trailer-container');
    const section = document.getElementById('trailer-section');

    if (!container || !anime.trailer?.embed_url) {
        if (section) section.style.display = 'none';
        return;
    }

    container.innerHTML = `
        <iframe src="${anime.trailer.embed_url}" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen></iframe>
    `;
}

async function loadRelated(id) {
    try {
        const related = await fetchRelatedAnime(id);
        const grid = document.getElementById('related-grid');
        if (!grid || !related.length) {
            grid?.parentElement?.classList.add('hidden');
            return;
        }

        // Flatten relations
        let allRelated = [];
        related.forEach(rel => {
            if (rel.entry) {
                allRelated = allRelated.concat(rel.entry);
            }
        });

        const uniqueRelated = allRelated.slice(0, 12);
        grid.innerHTML = uniqueRelated.map(anime => createMiniCard(anime)).join('');

        grid.querySelectorAll('.anime-card').forEach((card, index) => {
            card.addEventListener('click', () => {
                window.location.href = `anime.html?id=${uniqueRelated[index].mal_id}`;
            });
        });
    } catch (error) {
        console.error('Error loading related:', error);
    }
}

async function loadRecommendations(id) {
    try {
        const recommendations = await fetchRecommendations(id);
        const carousel = document.getElementById('recommendations-carousel');
        if (!carousel || !recommendations) return;

        const recs = recommendations.slice(0, 15);
        carousel.innerHTML = recs.map(rec => createMiniCard(rec.entry)).join('');

        carousel.querySelectorAll('.anime-card').forEach((card, index) => {
            card.addEventListener('click', () => {
                window.location.href = `anime.html?id=${recs[index].entry.mal_id}`;
            });
        });
    } catch (error) {
        console.error('Error loading recommendations:', error);
    }
}

function createMiniCard(anime) {
    const image = anime.images?.jpg?.image_url || '';
    const title = anime.title_english || anime.title;

    return `
        <div class="anime-card">
            <div class="anime-card-poster">
                <img src="${image}" alt="${title}" loading="lazy">
                <div class="anime-card-overlay"></div>
                <div class="anime-card-quick-watch"><i class="fas fa-play"></i></div>
            </div>
            <div class="anime-card-info">
                <h3 class="anime-card-title">${title}</h3>
            </div>
        </div>
    `;
}

async function initActionButtons(anime) {
    const favoriteBtn = document.getElementById('favorite-btn');
    const bookmarkBtn = document.getElementById('bookmark-btn');
    const shareBtn = document.getElementById('share-btn');

    if (favoriteBtn) {
        const isFav = await isFavorite(anime.mal_id);
        updateButtonState(favoriteBtn, isFav, 'fa-heart');

        favoriteBtn.addEventListener('click', async () => {
            const result = await toggleFavorite(anime.mal_id, anime);
            updateButtonState(favoriteBtn, result, 'fa-heart');
            showToast(result ? 'Added to favorites' : 'Removed from favorites', 'success');
        });
    }

    if (bookmarkBtn) {
        const isBmk = await isBookmarked(anime.mal_id);
        updateButtonState(bookmarkBtn, isBmk, 'fa-bookmark');

        bookmarkBtn.addEventListener('click', async () => {
            const result = await toggleBookmark(anime.mal_id, anime);
            updateButtonState(bookmarkBtn, result, 'fa-bookmark');
            showToast(result ? 'Bookmarked' : 'Removed bookmark', 'success');
        });
    }

    if (shareBtn) {
        shareBtn.addEventListener('click', () => {
            if (navigator.share) {
                navigator.share({
                    title: anime.title,
                    url: window.location.href
                });
            } else {
                navigator.clipboard.writeText(window.location.href);
                showToast('Link copied to clipboard', 'success');
            }
        });
    }
}

function updateButtonState(btn, active, iconName) {
    btn.classList.toggle('active', active);
    btn.innerHTML = `<i class="${active ? 'fas' : 'far'} ${iconName}"></i>`;
}

function initStreamToggle() {
    const toggles = document.querySelectorAll('.stream-toggle .toggle-btn');
    toggles.forEach(btn => {
        btn.addEventListener('click', () => {
            toggles.forEach(t => t.classList.remove('active'));
            btn.classList.add('active');
            currentType = btn.dataset.type;

            // Update episode links
            document.querySelectorAll('.episode-card').forEach(card => {
                const href = new URL(card.href);
                href.searchParams.set('type', currentType);
                card.href = href.toString();
            });
        });
    });
}
