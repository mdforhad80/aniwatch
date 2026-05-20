import { getTrending, getUpcoming, getCompleted } from './api.js';
import { createAnimeCard, skeletonCard, loadLayout } from './ui.js';

export async function renderHomePage() {
  await loadLayout();

  const trendingGrid = document.getElementById('trendingGrid');
  const upcomingRow = document.getElementById('upcomingRow');
  const completedGrid = document.getElementById('completedGrid');

  // Skeletons
  for (let i = 0; i < 8; i++) trendingGrid.appendChild(skeletonCard());
  for (let i = 0; i < 6; i++) upcomingRow.appendChild(skeletonCard());
  for (let i = 0; i < 6; i++) completedGrid.appendChild(skeletonCard());

  const [trending, upcoming, completed] = await Promise.all([
    getTrending(), getUpcoming(), getCompleted()
  ]);

  trendingGrid.innerHTML = '';
  upcomingRow.innerHTML = '';
  completedGrid.innerHTML = '';

  if (trending) trending.forEach(a => trendingGrid.appendChild(createAnimeCard(a)));
  if (upcoming) upcoming.forEach(a => upcomingRow.appendChild(createAnimeCard(a, false)));
  if (completed) {
    completed.forEach(a => completedGrid.appendChild(createAnimeCard(a)));
  } else {
    completedGrid.innerHTML = '<p style="color:var(--muted)">No completed series found.</p>';
  }

  // Update hero from trending
  // ... hero slider setup ...
}
