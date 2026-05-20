const JIKAN = 'https://api.jikan.moe/v4';

export async function jikanFetch(endpoint) {
  try {
    const res = await fetch(JIKAN + endpoint);
    if (!res.ok) throw new Error('API error');
    return (await res.json()).data;
  } catch (e) {
    console.error('Jikan error:', e);
    return null;
  }
}

export const getTrending = () => jikanFetch('/top/anime?filter=airing&limit=12');
export const getUpcoming = () => jikanFetch('/seasons/upcoming?limit=12');
export const getCompleted = () => jikanFetch('/top/anime?type=tv&status=complete&filter=bypopularity&limit=12');
export const getAnimeById = (id) => jikanFetch(`/anime/${id}/full`);
export const searchAnime = (q) => jikanFetch(`/anime?q=${encodeURIComponent(q)}&limit=8`);
export const getRandomAnime = async () => {
  let id = Math.floor(Math.random()*40000)+1;
  let a = await getAnimeById(id);
  return a || getAnimeById(Math.floor(Math.random()*10000)+1);
};
