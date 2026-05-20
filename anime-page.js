import { getAnimeById } from './api.js';
import { loadLayout } from './ui.js';

export async function render() {
  await loadLayout();
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (!id) return;

  const anime = await getAnimeById(id);
  if (!anime) return;

  const container = document.getElementById('pageContent');
  container.innerHTML = `
    <div class="anime-detail-banner" style="background-image:url(${anime.images.jpg.large_image_url})"></div>
    <div class="anime-detail-header">
      <img class="anime-detail-poster" src="${anime.images.jpg.large_image_url}" alt="">
      <div class="anime-detail-info">
        <h1>${anime.title_english || anime.title}</h1>
        <p class="alt-titles">${anime.title_japanese}</p>
        <div class="genre-tags">${anime.genres.map(g => `<span class="genre-tag">${g.name}</span>`).join('')}</div>
        <p>${anime.synopsis}</p>
        <button class="btn btn-primary" onclick="location.href='watch.html?id=${id}&ep=1&type=sub'">▶ Watch Now</button>
        <button class="btn btn-outline" onclick="location.href='watch.html?id=${id}&ep=1&type=dub'">🎙 Watch Dub</button>
      </div>
    </div>
    <!-- Episode list would be loaded here -->
  `;
}
