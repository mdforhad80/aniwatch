// ============================================
// SEARCH PAGE - AnimeVault
// ============================================

import { initAuth, updateUserUI } from './auth.js';
import { searchAnime, fetchGenres } from './api.js';
import { createAnimeCard } from './app.js';

let currentPage = 1;
let currentQuery = '';
let currentFilters = {};
let isLoading = false;
let hasMore = true;

document.addEventListener('DOMContentLoaded', async () => {
    initAuth();
    initNavbar();
    initMobileNav();

    // Get URL params
    const params = new URLSearchParams(window.location.search);
    currentQuery = params.get('q') || '';

    // Set initial search value
    const searchInput = document.getElementById('search-input');
    if (searchInput && currentQuery) {
        searchInput.value = currentQuery;
    }

    // Load genres for filter
    await loadGenreFilter();

    // Load year filter
    loadYearFilter();

    // Init filters
    initFilters();

    // Perform initial search
    if (currentQuery) {
        await performSearch();
    }

    // Init infinite scroll
    initInfiniteScroll();

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

async function loadGenreFilter() {
    const select = document.getElementById('genre-filter');
    if (!select) return;

    try {
        const genres = await fetchGenres();
        genres.forEach(genre => {
            const option = document.createElement('option');
            option.value = genre.mal_id;
            option.textContent = genre.name;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading genres:', error);
    }
}

function loadYearFilter() {
    const select = document.getElementById('year-filter');
    if (!select) return;

    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= 1980; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        select.appendChild(option);
    }
}

function initFilters() {
    const searchInput = document.getElementById('search-input');
    const genreFilter = document.getElementById('genre-filter');
    const typeFilter = document.getElementById('type-filter');
    const statusFilter = document.getElementById('status-filter');
    const seasonFilter = document.getElementById('season-filter');
    const yearFilter = document.getElementById('year-filter');
    const sortFilter = document.getElementById('sort-filter');
    const resetBtn = document.getElementById('reset-filters');
    const clearBtn = document.getElementById('search-clear');

    // Search input
    if (searchInput) {
        searchInput.addEventListener('input', debounce(() => {
            currentQuery = searchInput.value.trim();
            currentPage = 1;
            hasMore = true;
            performSearch();
        }, 500));
    }

    // Filters
    const filters = [genreFilter, typeFilter, statusFilter, seasonFilter, yearFilter, sortFilter];
    filters.forEach(filter => {
        if (filter) {
            filter.addEventListener('change', () => {
                currentPage = 1;
                hasMore = true;
                updateFilters();
                performSearch();
            });
        }
    });

    // Reset
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            filters.forEach(f => { if (f) f.value = ''; });
            if (searchInput) searchInput.value = '';
            currentQuery = '';
            currentFilters = {};
            currentPage = 1;
            hasMore = true;
            performSearch();
        });
    }

    // Clear search
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            if (searchInput) searchInput.value = '';
            currentQuery = '';
            currentPage = 1;
            hasMore = true;
            performSearch();
        });
    }

    // Show/hide clear button
    if (searchInput && clearBtn) {
        searchInput.addEventListener('input', () => {
            clearBtn.classList.toggle('visible', searchInput.value.length > 0);
        });
    }
}

function updateFilters() {
    currentFilters = {};

    const genre = document.getElementById('genre-filter')?.value;
    const type = document.getElementById('type-filter')?.value;
    const status = document.getElementById('status-filter')?.value;
    const season = document.getElementById('season-filter')?.value;
    const year = document.getElementById('year-filter')?.value;
    const sort = document.getElementById('sort-filter')?.value;

    if (genre) currentFilters.genre = genre;
    if (type) currentFilters.type = type;
    if (status) currentFilters.status = status;
    if (season) currentFilters.season = season;
    if (year) currentFilters.year = `${year}-01-01`;
    if (sort) currentFilters.sort = sort;
}

async function performSearch(append = false) {
    if (isLoading || !hasMore) return;

    isLoading = true;
    const grid = document.getElementById('search-results-grid');
    const loadingMore = document.getElementById('loading-more');
    const noResults = document.getElementById('no-results');
    const stats = document.getElementById('search-stats');

    if (!append) {
        if (grid) grid.innerHTML = '';
    }

    if (loadingMore) loadingMore.classList.remove('hidden');
    if (noResults) noResults.classList.add('hidden');

    try {
        const results = await searchAnime(currentQuery, currentPage, currentFilters);

        if (!results || results.length === 0) {
            hasMore = false;
            if (!append && grid) {
                if (noResults) noResults.classList.remove('hidden');
            }
        } else {
            renderResults(results, append);

            if (stats) {
                stats.textContent = `Found ${results.length * currentPage}+ results${currentQuery ? ` for "${currentQuery}"` : ''}`;
            }

            if (results.length < 24) {
                hasMore = false;
            }
        }
    } catch (error) {
        console.error('Search error:', error);
        if (!append && noResults) noResults.classList.remove('hidden');
    } finally {
        isLoading = false;
        if (loadingMore) loadingMore.classList.add('hidden');
    }
}

function renderResults(animeList, append) {
    const grid = document.getElementById('search-results-grid');
    if (!grid) return;

    const html = animeList.map(anime => createAnimeCard(anime)).join('');

    if (append) {
        grid.insertAdjacentHTML('beforeend', html);
    } else {
        grid.innerHTML = html;
    }

    // Add click handlers
    const cards = append 
        ? grid.querySelectorAll('.anime-card:not([data-clicked])')
        : grid.querySelectorAll('.anime-card');

    cards.forEach((card, index) => {
        card.dataset.clicked = 'true';
        const anime = animeList[append ? index : index];
        card.addEventListener('click', () => {
            window.location.href = `anime.html?id=${anime.mal_id}`;
        });
    });
}

function initInfiniteScroll() {
    window.addEventListener('scroll', throttle(() => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 1000) {
            if (!isLoading && hasMore) {
                currentPage++;
                performSearch(true);
            }
        }
    }, 500));
}

function debounce(func, wait) {
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

function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}
