// Auth state management for navbar and pages

let currentUser = null;
const listeners = [];

export function getUser() { return currentUser; }
export function onUserChange(cb) { listeners.push(cb); }

function notifyListeners(user) {
  currentUser = user;
  listeners.forEach(cb => cb(user));
}

// Initialize with Firebase if available
export async function initAuth() {
  try {
    const { auth } = await import('../../firebase/config.js');
    const { onAuthStateChanged } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
    onAuthStateChanged(auth, user => notifyListeners(user));
  } catch (e) {
    console.warn('Firebase auth not configured yet:', e.message);
  }
}

// Update navbar based on auth state
export function updateNavbarAuth(user) {
  const authBtns = document.getElementById('nav-auth-btns');
  const userMenu = document.getElementById('nav-user-menu');
  const avatarLetter = document.getElementById('nav-avatar-letter');

  if (user) {
    authBtns?.classList.add('hidden');
    userMenu?.classList.remove('hidden');
    if (avatarLetter) avatarLetter.textContent = (user.displayName || user.email || 'U')[0].toUpperCase();
  } else {
    authBtns?.classList.remove('hidden');
    userMenu?.classList.add('hidden');
  }
}

// Logout
export async function handleLogout() {
  try {
    const { logOut } = await import('../../firebase/auth.js');
    await logOut();
    window.location.href = 'index.html';
  } catch (e) {
    console.error(e);
  }
}

// Protect page - redirect to login if not authed
export function requireAuth(redirectUrl = '') {
  return new Promise(resolve => {
    const unsub = onUserChange(user => {
      if (user) { resolve(user); }
      else { window.location.href = `login.html${redirectUrl ? '?redirect=' + encodeURIComponent(redirectUrl) : ''}`; }
    });
  });
}
