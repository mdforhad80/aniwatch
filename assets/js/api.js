// ============================================
// JIKAN API WRAPPER - AnimeVault
// ============================================

const BASE_URL = 'https://api.jikan.moe/v4';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const cache = new Map();

// Generic fetch with caching
async function fetchWithCache(url) {
    const cacheKey = url;
    const cached = cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
    }

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();

        cache.set(cacheKey, { data: data.data || data, timestamp: Date.now() });
        return data.data || data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Fetch Trending Anime
export async function fetchTrending(limit = 10) {
    return fetchWithCache(`${BASE_URL}/top/anime?filter=airing&limit=${limit}`);
}

// Fetch Top Airing
export async function fetchTopAiring(limit = 10) {
    return fetchWithCache(`${BASE_URL}/top/anime?filter=airing&limit=${limit}`);
}

// Fetch Upcoming
export async function fetchUpcoming(limit = 10) {
    return fetchWithCache(`${BASE_URL}/top/anime?filter=upcoming&limit=${limit}`);
}

// Fetch Latest
export async function fetchLatest(limit = 10) {
    return fetchWithCache(`${BASE_URL}/seasons/now?limit=${limit}`);
}

// Fetch Movies
export async function fetchMovies(limit = 10) {
    return fetchWithCache(`${BASE_URL}/top/anime?type=movie&limit=${limit}`);
}

// Fetch Completed
export async function fetchCompleted(limit = 10) {
    const data = await fetchWithCache(`${BASE_URL}/top/anime?limit=${limit}`);
    return Array.isArray(data) ? data.filter(a => a.status === 'Finished Airing') : [];
}

// Fetch Anime by ID
export async function fetchAnimeById(id) {
    return fetchWithCache(`${BASE_URL}/anime/${id}/full`);
}

// Fetch Anime Characters
export async function fetchAnimeCharacters(id) {
    return fetchWithCache(`${BASE_URL}/anime/${id}/characters`);
}

// Fetch Recommendations
export async function fetchRecommendations(id) {
    return fetchWithCache(`${BASE_URL}/anime/${id}/recommendations`);
}

// Fetch Related Anime
export async function fetchRelatedAnime(id) {
    const data = await fetchWithCache(`${BASE_URL}/anime/${id}/relations`);
    return data || [];
}

// Fetch Episodes
export async function fetchEpisodes(id) {
    return fetchWithCache(`${BASE_URL}/anime/${id}/episodes`);
}

// Fetch Genres
export async function fetchGenres() {
    return fetchWithCache(`${BASE_URL}/genres/anime`);
}

// Search Anime
export async function searchAnime(query, page = 1, filters = {}) {
    let url = `${BASE_URL}/anime?q=${encodeURIComponent(query)}&page=${page}&limit=24`;

    if (filters.type) url += `&type=${filters.type}`;
    if (filters.status) url += `&status=${filters.status}`;
    if (filters.genre) url += `&genres=${filters.genre}`;
    if (filters.season) url += `&season=${filters.season}`;
    if (filters.year) url += `&start_date=${filters.year}`;
    if (filters.sort) url += `&order_by=${filters.sort}&sort=desc`;

    return fetchWithCache(url);
}

// Fetch Schedule
export async function fetchSchedule(day = '') {
    if (day && day !== 'all') {
        return fetchWithCache(`${BASE_URL}/schedules?filter=${day}&limit=50`);
    }
    return fetchWithCache(`${BASE_URL}/schedules?limit=50`);
}

// Fetch Seasonal Anime
export async function fetchSeasonal(year, season, limit = 25) {
    return fetchWithCache(`${BASE_URL}/seasons/${year}/${season}?limit=${limit}`);
}

// Fetch Random Anime
export async function fetchRandomAnime() {
    return fetchWithCache(`${BASE_URL}/random/anime`);
}

// Generate Stream URL
export function getStreamUrl(malId, episode, type = 'sub') {
    return `https://megaplay.buzz/stream/mal/${malId}/${episode}/${type}`;
}

// Clear cache
export function clearCache() {
    cache.clear();
}
