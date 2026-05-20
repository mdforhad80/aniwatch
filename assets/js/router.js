export function initRouter() {
  const path = window.location.pathname;
  const page = path.split('/').pop().split('.')[0] || 'index';
  
  // Remove leading slash and handle root
  switch (page) {
    case '': case 'index': import('./app.js').then(m => m.renderHomePage()); break;
    case 'anime': import('./anime-page.js').then(m => m.render()); break;
    case 'watch': import('./watch-page.js').then(m => m.render()); break;
    case 'search': import('./search-page.js').then(m => m.render()); break;
    case 'schedule': import('./schedule-page.js').then(m => m.render()); break;
    case 'creator': import('./creator-page.js').then(m => m.render()); break;
    case 'profile': import('./profile-page.js').then(m => m.render()); break;
    case 'login': document.getElementById('authModalOverlay').classList.add('open'); break;
    case 'signup': /* open signup modal */ break;
    default: import('./app.js').then(m => m.renderHomePage());
  }
}
