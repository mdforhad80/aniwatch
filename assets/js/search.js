// ============================================
// SEARCH FUNCTIONALITY - AnimeVault
// ============================================

import { searchAnime } from './api.js';

let searchTimeout;
let currentQuery = '';

export function initSearch() {
    // Search trigger
    const searchTrigger = document.getElementById('search-trigger');
    const searchOverlay = document.getElementById('search-overlay');
    const searchClose = document.getElementById('search-close');
    const searchInput = document.getElementById('search-input');

    if (searchTrigger && searchOverlay) {
        searchTrigger.addEventListener('click', () => {
            searchOverlay.classList.add('active');
            searchInput?.focus();
        });
    }

    if (searchClose && searchOverlay) {
        searchClose.addEventListener('click', () => {
            searchOverlay.classList.remove('active');
        });
    }

    if (searchOverlay) {
        searchOverlay.addEventListener('click', (e) => {
            if (e.target === searchOverlay) {
                searchOverlay.classList.remove('active');
            }
        });
    }

    // Live search
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            const query = e.target.value.trim();

            if (query.length < 2) {
                document.getElementById('search-results').innerHTML = '';
                return;
            }

            searchTimeout = setTimeout(() => performSearch(query), 300);
        });

        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const query = searchInput.value.trim();
                if (query) {
                    window.location.href = `search.html?q=${encodeURIComponent(query)}`;
                }
            }
            if (e.key === 'Escape') {
                searchOverlay.classList.remove('active');
            }
        });
    }

    // Trending searches
    loadTrendingSearches();
}

async function performSearch(query) {
    const resultsContainer = document.getElementById('search-results');
    if (!resultsContainer) return;

    resultsContainer.innerHTML = '<div class="loading-more"><div class="loader-spinner"></div></div>';

    try {
        const results = await searchAnime(query, 1, { limit: 8 });
        displaySearchResults(results, query);
    } catch (error) {
        resultsContainer.innerHTML = '<p style="text-align:center;color:var(--muted)">Error searching</p>';
    }
}

function displaySearchResults(animeList, query) {
    const resultsContainer = document.getElementById('search-results');
    if (!resultsContainer) return;

    if (!animeList || animeList.length === 0) {
        resultsContainer.innerHTML = `
            <div class="no-results" style="padding:2rem">
                <p style="color:var(--muted)">No results for "${query}"</p>
            </div>
        `;
        return;
    }

    resultsContainer.innerHTML = animeList.map(anime => `
        <a href="anime.html?id=${anime.mal_id}" class="search-result-item">
            <img src="${anime.images?.jpg?.image_url}" alt="${anime.title}" loading="lazy">
            <div class="search-result-info">
                <h4>${anime.title_english || anime.title}</h4>
                <p>${anime.type || 'TV'} | ${anime.episodes || '?'} eps | Score: ${anime.score || 'N/A'}</p>
            </div>
        </a>
    `).join('');
}

async function loadTrendingSearches() {
    const container = document.getElementById('suggestion-tags');
    if (!container) return;

    const trending = ['Attack on Titan', 'Demon Slayer', 'Jujutsu Kaisen', 'One Piece', 'Naruto', 'My Hero Academia'];

    container.innerHTML = trending.map(term => `
        <span class="suggestion-tag" data-query="${term}">${term}</span>
    `).join('');

    container.querySelectorAll('.suggestion-tag').forEach(tag => {
        tag.addEventListener('click', () => {
            const query = tag.dataset.query;
            window.location.href = `search.html?q=${encodeURIComponent(query)}`;
        });
    });
}

export { performSearch };
