// ============================================
// FIREBASE AUTHENTICATION - AnimeVault
// ============================================

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    updateProfile
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
    collection,
    query,
    where,
    getDocs,
    orderBy,
    limit
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Firebase Config - REPLACE WITH YOUR CONFIG
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "your-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

let currentUser = null;

// Initialize Auth
export function initAuth() {
    onAuthStateChanged(auth, (user) => {
        currentUser = user;
        updateUserUI(user);
    });

    // Login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Signup form
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }

    // Google Sign In
    const googleSignin = document.getElementById('google-signin');
    if (googleSignin) {
        googleSignin.addEventListener('click', handleGoogleSignIn);
    }

    // Google Sign Up
    const googleSignup = document.getElementById('google-signup');
    if (googleSignup) {
        googleSignup.addEventListener('click', handleGoogleSignIn);
    }

    // Toggle password
    const togglePassword = document.getElementById('toggle-password');
    if (togglePassword) {
        togglePassword.addEventListener('click', () => {
            const passwordInput = document.getElementById('login-password') || document.getElementById('signup-password');
            if (passwordInput) {
                passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
                togglePassword.querySelector('i').classList.toggle('fa-eye');
                togglePassword.querySelector('i').classList.toggle('fa-eye-slash');
            }
        });
    }
}

// Handle Login
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const submitBtn = document.getElementById('login-submit');

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';

    try {
        await signInWithEmailAndPassword(auth, email, password);
        window.location.href = 'index.html';
    } catch (error) {
        showAuthError(error.message);
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In';
    }
}

// Handle Signup
async function handleSignup(e) {
    e.preventDefault();
    const username = document.getElementById('signup-username').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirm = document.getElementById('signup-confirm').value;
    const submitBtn = document.getElementById('signup-submit');

    if (password !== confirm) {
        showAuthError('Passwords do not match');
        return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: username });

        // Create user document in Firestore
        await setDoc(doc(db, 'users', userCredential.user.uid), {
            username: username,
            email: email,
            createdAt: new Date().toISOString(),
            avatar: null
        });

        window.location.href = 'index.html';
    } catch (error) {
        showAuthError(error.message);
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-user-plus"></i> Create Account';
    }
}

// Handle Google Sign In
async function handleGoogleSignIn() {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;

        // Check if user document exists
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (!userDoc.exists()) {
            await setDoc(doc(db, 'users', user.uid), {
                username: user.displayName || 'User',
                email: user.email,
                createdAt: new Date().toISOString(),
                avatar: user.photoURL
            });
        }

        window.location.href = 'index.html';
    } catch (error) {
        showAuthError(error.message);
    }
}

// Handle Logout
export async function handleLogout() {
    try {
        await signOut(auth);
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Logout error:', error);
    }
}

// Update UI based on auth state
export function updateUserUI(user) {
    const loginBtn = document.getElementById('login-btn');
    const userDropdown = document.getElementById('user-dropdown');
    const logoutBtns = document.querySelectorAll('#logout-btn, #logout-btn2');

    if (user) {
        if (loginBtn) loginBtn.classList.add('hidden');
        if (userDropdown) userDropdown.classList.remove('hidden');

        // Update profile page if present
        const profileName = document.getElementById('profile-name');
        const profileEmail = document.getElementById('profile-email');
        const profileAvatar = document.getElementById('profile-avatar-img');

        if (profileName) profileName.textContent = user.displayName || 'User';
        if (profileEmail) profileEmail.textContent = user.email;
        if (profileAvatar && user.photoURL) profileAvatar.src = user.photoURL;

        // Load user stats
        loadUserStats(user.uid);
    } else {
        if (loginBtn) {
            loginBtn.classList.remove('hidden');
            loginBtn.textContent = 'Sign In';
        }
        if (userDropdown) userDropdown.classList.add('hidden');
    }

    // Logout handlers
    logoutBtns.forEach(btn => {
        if (btn) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                handleLogout();
            });
        }
    });
}

// Load User Stats
async function loadUserStats(userId) {
    try {
        // Watch history count
        const historyQuery = query(collection(db, 'watchHistory'), where('userId', '==', userId));
        const historySnapshot = await getDocs(historyQuery);
        const watchedCount = historySnapshot.size;

        // Favorites count
        const favoritesQuery = query(collection(db, 'favorites'), where('userId', '==', userId));
        const favoritesSnapshot = await getDocs(favoritesQuery);
        const favoritesCount = favoritesSnapshot.size;

        // Bookmarks count
        const bookmarksQuery = query(collection(db, 'bookmarks'), where('userId', '==', userId));
        const bookmarksSnapshot = await getDocs(bookmarksQuery);
        const bookmarksCount = bookmarksSnapshot.size;

        // Update stats
        const statWatched = document.getElementById('stat-watched');
        const statFavorites = document.getElementById('stat-favorites');
        const statBookmarks = document.getElementById('stat-bookmarks');

        if (statWatched) statWatched.textContent = watchedCount;
        if (statFavorites) statFavorites.textContent = favoritesCount;
        if (statBookmarks) statBookmarks.textContent = bookmarksCount;
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Show Auth Error
function showAuthError(message) {
    // Create or update error display
    let errorDiv = document.querySelector('.auth-error');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'auth-error';
        const form = document.querySelector('.auth-form');
        if (form) form.insertBefore(errorDiv, form.firstChild);
    }

    errorDiv.style.cssText = `
        background: rgba(239, 68, 68, 0.1);
        border: 1px solid rgba(239, 68, 68, 0.3);
        color: #ef4444;
        padding: 0.75rem 1rem;
        border-radius: 8px;
        margin-bottom: 1rem;
        font-size: 0.9rem;
    `;
    errorDiv.textContent = message;

    setTimeout(() => {
        if (errorDiv) errorDiv.remove();
    }, 5000);
}

// Get Current User
export function getCurrentUser() {
    return currentUser;
}

// Get Auth Instance
export function getAuthInstance() {
    return auth;
}

// Get DB Instance
export function getDbInstance() {
    return db;
}

export { auth, db };
