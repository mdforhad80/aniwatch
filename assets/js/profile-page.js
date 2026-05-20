// ============================================
// PROFILE PAGE - AnimeVault
// ============================================

import { initAuth, updateUserUI, getCurrentUser } from './auth.js';
import { getContinueWatching, getWatchHistory, getFavorites, getBookmarks } from './storage.js';
import { createAnimeCard } from './app.js';

document.addEventListener('DOMContentLoaded', async () => {
    initAuth();
    initNavbar();
    initMobileNav();
    initTabs();

    const user = getCurrentUser();
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    await loadProfileData();

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

function initMobileNav() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navLinks = document.getElementById('nav-links');
    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => navLinks.classList.toggle('active'));
    }
}

function initTabs() {
    const tabs = document.querySelectorAll('.profile-tab');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;

            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));

            tab.classList.add('active');
            document.getElementById(`tab-${targetTab}`)?.classList.add('active');
        });
    });
}

async function loadProfileData() {
    try {
        // Continue Watching
        const continueWatching = await getContinueWatching();
        const continueCarousel = document.getElementById('continue-carousel');
        const emptyContinue = document.getElementById('empty-continue');

        if (continueWatching.length > 0 && continueCarousel) {
            continueCarousel.innerHTML = continueWatching.map(item => createHistoryCard(item)).join('');
            continueCarousel.querySelectorAll('.anime-card').forEach((card, index) => {
                card.addEventListener('click', () => {
                    window.location.href = `watch.html?id=${continueWatching[index].animeId}&ep=${continueWatching[index].episode}&type=sub`;
                });
            });
        } else if (emptyContinue) {
            emptyContinue.classList.remove('hidden');
        }

        // Watch History
        const history = await getWatchHistory();
        const historyGrid = document.getElementById('history-grid');
        const emptyHistory = document.getElementById('empty-history');

        if (history.length > 0 && historyGrid) {
            historyGrid.innerHTML = history.map(item => createHistoryCard(item)).join('');
            historyGrid.querySelectorAll('.anime-card').forEach((card, index) => {
                card.addEventListener('click', () => {
                    window.location.href = `anime.html?id=${history[index].animeId}`;
                });
            });
        } else if (emptyHistory) {
            emptyHistory.classList.remove('hidden');
        }

        // Favorites
        const favorites = await getFavorites();
        const favoritesGrid = document.getElementById('favorites-grid');
        const emptyFavorites = document.getElementById('empty-favorites');

        if (favorites.length > 0 && favoritesGrid) {
            favoritesGrid.innerHTML = favorites.map(item => createHistoryCard(item)).join('');
            favoritesGrid.querySelectorAll('.anime-card').forEach((card, index) => {
                card.addEventListener('click', () => {
                    window.location.href = `anime.html?id=${favorites[index].animeId}`;
                });
            });
        } else if (emptyFavorites) {
            emptyFavorites.classList.remove('hidden');
        }

        // Bookmarks
        const bookmarks = await getBookmarks();
        const bookmarksGrid = document.getElementById('bookmarks-grid');
        const emptyBookmarks = document.getElementById('empty-bookmarks');

        if (bookmarks.length > 0 && bookmarksGrid) {
            bookmarksGrid.innerHTML = bookmarks.map(item => createHistoryCard(item)).join('');
            bookmarksGrid.querySelectorAll('.anime-card').forEach((card, index) => {
                card.addEventListener('click', () => {
                    window.location.href = `anime.html?id=${bookmarks[index].animeId}`;
                });
            });
        } else if (emptyBookmarks) {
            emptyBookmarks.classList.remove('hidden');
        }

    } catch (error) {
        console.error('Error loading profile data:', error);
    }
}

function createHistoryCard(item) {
    const image = item.image || 'assets/images/placeholder.jpg';
    const title = item.title || 'Unknown';
    const episode = item.episode ? `EP ${item.episode}` : '';

    return `
        <div class="anime-card">
            <div class="anime-card-poster">
                <img src="${image}" alt="${title}" loading="lazy">
                <div class="anime-card-overlay"></div>
                <div class="anime-card-quick-watch"><i class="fas fa-play"></i></div>
                ${episode ? `<div class="anime-card-badge">${episode}</div>` : ''}
            </div>
            <div class="anime-card-info">
                <h3 class="anime-card-title">${title}</h3>
                <div class="anime-card-meta">
                    <span><i class="fas fa-clock"></i> ${formatDate(item.updatedAt || item.timestamp)}</span>
                </div>
            </div>
        </div>
    `;
}

function formatDate(dateString) {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
