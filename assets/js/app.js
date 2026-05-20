// ============================================
// ANIMEVAULT - MAIN APPLICATION
// ============================================

import { initAuth, updateUserUI, handleLogout } from './auth.js';
import { initSearch } from './search.js';
import { initParticles, initCursorGlow } from './ui.js';
import { fetchTrending, fetchTopAiring, fetchUpcoming, fetchLatest, fetchMovies, fetchCompleted, fetchGenres } from './api.js';
import { getContinueWatching } from './storage.js';

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
    initLoadingScreen();
    initNavbar();
    initParticles();
    initCursorGlow();
    initAuth();
    initSearch();
    initMobileNav();

    // Load homepage content if on index
    if (document.getElementById('hero-slider')) {
        await loadHomepage();
    }

    hideLoadingScreen();
});

// Loading Screen
function initLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (!loadingScreen) return;

    const progress = loadingScreen.querySelector('.loading-progress');
    let width = 0;
    const interval = setInterval(() => {
        width += Math.random() * 15;
        if (width >= 100) {
            width = 100;
            clearInterval(interval);
        }
        progress.style.width = width + '%';
    }, 200);
}

function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (!loadingScreen) return;

    setTimeout(() => {
        loadingScreen.classList.add('hidden');
        setTimeout(() => loadingScreen.remove(), 500);
    }, 1000);
}

// Navbar
function initNavbar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // User menu dropdown
    const userMenu = document.getElementById('user-menu');
    const userDropdown = document.getElementById('user-dropdown');

    if (userMenu && userDropdown) {
        userMenu.addEventListener('click', (e) => {
            if (e.target.closest('.btn')) return;
            userDropdown.classList.toggle('hidden');
        });

        document.addEventListener('click', (e) => {
            if (!userMenu.contains(e.target)) {
                userDropdown.classList.add('hidden');
            }
        });
    }

    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            handleLogout();
        });
    }
}

// Mobile Navigation
function initMobileNav() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navLinks = document.getElementById('nav-links');

    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }
}

// Load Homepage Content
async function loadHomepage() {
    try {
        // Hero Slider
        const trending = await fetchTrending(5);
        initHeroSlider(trending);

        // Continue Watching
        const continueWatching = await getContinueWatching();
        if (continueWatching.length > 0) {
            renderCarousel('continue-watching-carousel', continueWatching);
            document.getElementById('continue-watching-section').classList.remove('hidden');
        } else {
            document.getElementById('continue-watching-section').classList.add('hidden');
        }

        // Latest Updates
        const latest = await fetchLatest(12);
        renderGrid('latest-updates-grid', latest);

        // Trending
        const trendingAll = await fetchTrending(15);
        renderCarousel('trending-carousel', trendingAll);

        // New Releases (Airing)
        const airing = await fetchTopAiring(12);
        renderGrid('new-releases-grid', airing);

        // Top Airing
        renderCarousel('top-airing-carousel', airing.slice(0, 15));

        // Upcoming
        const upcoming = await fetchUpcoming(12);
        renderGrid('upcoming-grid', upcoming);

        // Movies
        const movies = await fetchMovies(12);
        renderCarousel('movies-carousel', movies);

        // Completed
        const completed = await fetchCompleted(12);
        renderGrid('completed-grid', completed);

        // Genres
        const genres = await fetchGenres();
        renderGenres(genres);

        // Random Anime Button
        const randomBtn = document.getElementById('random-anime-btn');
        if (randomBtn) {
            randomBtn.addEventListener('click', async () => {
                const allAnime = await fetchTrending(50);
                const random = allAnime[Math.floor(Math.random() * allAnime.length)];
                window.location.href = `anime.html?id=${random.mal_id}`;
            });
        }

    } catch (error) {
        console.error('Error loading homepage:', error);
    }
}

// Hero Slider
let currentSlide = 0;
let slideInterval;

function initHeroSlider(animeList) {
    const slider = document.getElementById('hero-slider');
    const dots = document.getElementById('slider-dots');
    const title = document.getElementById('hero-title');
    const synopsis = document.getElementById('hero-synopsis');
    const meta = document.getElementById('hero-meta');
    const badge = document.getElementById('hero-badge');
    const watchBtn = document.getElementById('hero-watch-btn');
    const infoBtn = document.getElementById('hero-info-btn');

    if (!slider || !animeList.length) return;

    // Create slides
    animeList.forEach((anime, index) => {
        const slide = document.createElement('div');
        slide.className = `hero-slide ${index === 0 ? 'active' : ''}`;
        slide.style.backgroundImage = `url(${anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || ''})`;
        slider.appendChild(slide);

        // Create dot
        const dot = document.createElement('button');
        dot.className = `slider-dot ${index === 0 ? 'active' : ''}`;
        dot.addEventListener('click', () => goToSlide(index));
        dots.appendChild(dot);
    });

    // Update content
    updateHeroContent(animeList[0]);

    // Navigation
    document.getElementById('slider-prev')?.addEventListener('click', prevSlide);
    document.getElementById('slider-next')?.addEventListener('click', nextSlide);

    // Auto slide
    startAutoSlide();

    function updateHeroContent(anime) {
        title.textContent = anime.title_english || anime.title;
        synopsis.textContent = anime.synopsis || 'No synopsis available.';

        meta.innerHTML = `
            <span class="score"><i class="fas fa-star"></i> ${anime.score || 'N/A'}</span>
            <span><i class="fas fa-tv"></i> ${anime.type || 'TV'}</span>
            <span><i class="fas fa-list-ol"></i> ${anime.episodes || '?'} EPS</span>
            <span><i class="fas fa-calendar"></i> ${anime.year || 'N/A'}</span>
        `;

        watchBtn.href = `watch.html?id=${anime.mal_id}&ep=1&type=sub`;
        infoBtn.onclick = () => window.location.href = `anime.html?id=${anime.mal_id}`;
    }

    function goToSlide(index) {
        const slides = slider.querySelectorAll('.hero-slide');
        const dotButtons = dots.querySelectorAll('.slider-dot');

        slides[currentSlide].classList.remove('active');
        dotButtons[currentSlide].classList.remove('active');

        currentSlide = index;

        slides[currentSlide].classList.add('active');
        dotButtons[currentSlide].classList.add('active');

        updateHeroContent(animeList[currentSlide]);
        resetAutoSlide();
    }

    function nextSlide() {
        goToSlide((currentSlide + 1) % animeList.length);
    }

    function prevSlide() {
        goToSlide((currentSlide - 1 + animeList.length) % animeList.length);
    }

    function startAutoSlide() {
        slideInterval = setInterval(nextSlide, 6000);
    }

    function resetAutoSlide() {
        clearInterval(slideInterval);
        startAutoSlide();
    }
}

// Render Grid
function renderGrid(containerId, animeList) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = animeList.map(anime => createAnimeCard(anime)).join('');

    // Add click handlers
    container.querySelectorAll('.anime-card').forEach((card, index) => {
        card.addEventListener('click', () => {
            window.location.href = `anime.html?id=${animeList[index].mal_id}`;
        });
    });
}

// Render Carousel
function renderCarousel(containerId, animeList) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = animeList.map(anime => createAnimeCard(anime)).join('');

    container.querySelectorAll('.anime-card').forEach((card, index) => {
        card.addEventListener('click', () => {
            window.location.href = `anime.html?id=${animeList[index].mal_id}`;
        });
    });
}

// Create Anime Card HTML
function createAnimeCard(anime) {
    const image = anime.images?.jpg?.image_url || anime.images?.jpg?.large_image_url || 'assets/images/placeholder.jpg';
    const title = anime.title_english || anime.title;
    const rating = anime.score ? `<span class="score"><i class="fas fa-star"></i> ${anime.score}</span>` : '';
    const episodes = anime.episodes ? `${anime.episodes} EPS` : anime.type || 'TV';

    return `
        <div class="anime-card">
            <div class="anime-card-poster">
                <img src="${image}" alt="${title}" loading="lazy">
                <div class="anime-card-overlay"></div>
                <div class="anime-card-quick-watch"><i class="fas fa-play"></i></div>
                ${anime.rank && anime.rank <= 10 ? `<div class="anime-card-badge">TOP ${anime.rank}</div>` : ''}
                ${anime.score ? `<div class="anime-card-rating"><i class="fas fa-star"></i> ${anime.score}</div>` : ''}
            </div>
            <div class="anime-card-info">
                <h3 class="anime-card-title">${title}</h3>
                <div class="anime-card-meta">
                    <span><i class="fas fa-tv"></i> ${anime.type || 'TV'}</span>
                    <span><i class="fas fa-list-ol"></i> ${episodes}</span>
                </div>
            </div>
        </div>
    `;
}

// Render Genres
function renderGenres(genres) {
    const container = document.getElementById('genre-grid');
    if (!container || !genres) return;

    const genreIcons = {
        'Action': 'fa-fist-raised', 'Adventure': 'fa-compass', 'Comedy': 'fa-laugh-beam',
        'Drama': 'fa-theater-masks', 'Fantasy': 'fa-dragon', 'Horror': 'fa-ghost',
        'Mahou Shoujo': 'fa-wand-magic-sparkles', 'Mecha': 'fa-robot', 'Music': 'fa-music',
        'Mystery': 'fa-search', 'Psychological': 'fa-brain', 'Romance': 'fa-heart',
        'Sci-Fi': 'fa-rocket', 'Slice of Life': 'fa-coffee', 'Sports': 'fa-futbol',
        'Supernatural': 'fa-hat-wizard', 'Thriller': 'fa-bolt'
    };

    container.innerHTML = genres.slice(0, 12).map(genre => `
        <a href="search.html?genre=${genre.mal_id}" class="genre-card">
            <i class="fas ${genreIcons[genre.name] || 'fa-tag'}"></i>
            <h3>${genre.name}</h3>
        </a>
    `).join('');
}

// Export for other modules
export { createAnimeCard, renderGrid, renderCarousel };
