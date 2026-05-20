// ============================================
// STORAGE & DATA MANAGEMENT - AnimeVault
// ============================================

import { getCurrentUser, getDbInstance } from './auth.js';
import {
    doc,
    setDoc,
    getDoc,
    deleteDoc,
    collection,
    query,
    where,
    getDocs,
    orderBy,
    limit as firestoreLimit
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

const db = getDbInstance();

// LOCAL STORAGE HELPERS
function getLocalStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch {
        return null;
    }
}

function setLocalStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

// WATCH HISTORY
export async function addToWatchHistory(animeId, animeData, episode = 1, progress = 0) {
    const user = getCurrentUser();
    const entry = {
        animeId,
        title: animeData.title,
        image: animeData.images?.jpg?.image_url,
        episode,
        progress,
        timestamp: new Date().toISOString()
    };

    if (user) {
        await setDoc(doc(db, 'watchHistory', `${user.uid}_${animeId}`), {
            ...entry,
            userId: user.uid
        });
    } else {
        let history = getLocalStorage('watchHistory') || [];
        history = history.filter(h => h.animeId !== animeId);
        history.unshift(entry);
        if (history.length > 100) history = history.slice(0, 100);
        setLocalStorage('watchHistory', history);
    }
}

export async function getWatchHistory(limit_count = 50) {
    const user = getCurrentUser();

    if (user) {
        const q = query(
            collection(db, 'watchHistory'),
            where('userId', '==', user.uid),
            orderBy('timestamp', 'desc'),
            firestoreLimit(limit_count)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => doc.data());
    } else {
        return getLocalStorage('watchHistory') || [];
    }
}

// CONTINUE WATCHING
export async function updateContinueWatching(animeId, animeData, episode, progress, totalEpisodes) {
    const user = getCurrentUser();
    const entry = {
        animeId,
        title: animeData.title,
        image: animeData.images?.jpg?.image_url,
        episode,
        progress,
        totalEpisodes,
        updatedAt: new Date().toISOString()
    };

    if (user) {
        await setDoc(doc(db, 'continueWatching', `${user.uid}_${animeId}`), {
            ...entry,
            userId: user.uid
        });
    } else {
        let continueWatching = getLocalStorage('continueWatching') || [];
        continueWatching = continueWatching.filter(c => c.animeId !== animeId);
        continueWatching.unshift(entry);
        if (continueWatching.length > 50) continueWatching = continueWatching.slice(0, 50);
        setLocalStorage('continueWatching', continueWatching);
    }
}

export async function getContinueWatching(limit_count = 20) {
    const user = getCurrentUser();

    if (user) {
        const q = query(
            collection(db, 'continueWatching'),
            where('userId', '==', user.uid),
            orderBy('updatedAt', 'desc'),
            firestoreLimit(limit_count)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => doc.data());
    } else {
        return getLocalStorage('continueWatching') || [];
    }
}

// FAVORITES
export async function toggleFavorite(animeId, animeData) {
    const user = getCurrentUser();
    const docId = user ? `${user.uid}_${animeId}` : `local_${animeId}`;

    if (user) {
        const docRef = doc(db, 'favorites', docId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            await deleteDoc(docRef);
            return false;
        } else {
            await setDoc(docRef, {
                animeId,
                title: animeData.title,
                image: animeData.images?.jpg?.image_url,
                userId: user.uid,
                addedAt: new Date().toISOString()
            });
            return true;
        }
    } else {
        let favorites = getLocalStorage('favorites') || [];
        const index = favorites.findIndex(f => f.animeId === animeId);

        if (index > -1) {
            favorites.splice(index, 1);
            setLocalStorage('favorites', favorites);
            return false;
        } else {
            favorites.push({
                animeId,
                title: animeData.title,
                image: animeData.images?.jpg?.image_url,
                addedAt: new Date().toISOString()
            });
            setLocalStorage('favorites', favorites);
            return true;
        }
    }
}

export async function isFavorite(animeId) {
    const user = getCurrentUser();

    if (user) {
        const docRef = doc(db, 'favorites', `${user.uid}_${animeId}`);
        const docSnap = await getDoc(docRef);
        return docSnap.exists();
    } else {
        const favorites = getLocalStorage('favorites') || [];
        return favorites.some(f => f.animeId === animeId);
    }
}

export async function getFavorites(limit_count = 50) {
    const user = getCurrentUser();

    if (user) {
        const q = query(
            collection(db, 'favorites'),
            where('userId', '==', user.uid),
            orderBy('addedAt', 'desc'),
            firestoreLimit(limit_count)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => doc.data());
    } else {
        return getLocalStorage('favorites') || [];
    }
}

// BOOKMARKS
export async function toggleBookmark(animeId, animeData) {
    const user = getCurrentUser();
    const docId = user ? `${user.uid}_${animeId}` : `local_${animeId}`;

    if (user) {
        const docRef = doc(db, 'bookmarks', docId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            await deleteDoc(docRef);
            return false;
        } else {
            await setDoc(docRef, {
                animeId,
                title: animeData.title,
                image: animeData.images?.jpg?.image_url,
                userId: user.uid,
                addedAt: new Date().toISOString()
            });
            return true;
        }
    } else {
        let bookmarks = getLocalStorage('bookmarks') || [];
        const index = bookmarks.findIndex(b => b.animeId === animeId);

        if (index > -1) {
            bookmarks.splice(index, 1);
            setLocalStorage('bookmarks', bookmarks);
            return false;
        } else {
            bookmarks.push({
                animeId,
                title: animeData.title,
                image: animeData.images?.jpg?.image_url,
                addedAt: new Date().toISOString()
            });
            setLocalStorage('bookmarks', bookmarks);
            return true;
        }
    }
}

export async function isBookmarked(animeId) {
    const user = getCurrentUser();

    if (user) {
        const docRef = doc(db, 'bookmarks', `${user.uid}_${animeId}`);
        const docSnap = await getDoc(docRef);
        return docSnap.exists();
    } else {
        const bookmarks = getLocalStorage('bookmarks') || [];
        return bookmarks.some(b => b.animeId === animeId);
    }
}

export async function getBookmarks(limit_count = 50) {
    const user = getCurrentUser();

    if (user) {
        const q = query(
            collection(db, 'bookmarks'),
            where('userId', '==', user.uid),
            orderBy('addedAt', 'desc'),
            firestoreLimit(limit_count)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => doc.data());
    } else {
        return getLocalStorage('bookmarks') || [];
    }
}

// WATCH PROGRESS
export async function saveWatchProgress(animeId, episode, progress, duration) {
    const user = getCurrentUser();
    const key = `progress_${animeId}_${episode}`;

    const data = {
        animeId,
        episode,
        progress,
        duration,
        updatedAt: new Date().toISOString()
    };

    if (user) {
        await setDoc(doc(db, 'watchProgress', `${user.uid}_${key}`), {
            ...data,
            userId: user.uid
        });
    } else {
        let progressData = getLocalStorage('watchProgress') || {};
        progressData[key] = data;
        setLocalStorage('watchProgress', progressData);
    }
}

export async function getWatchProgress(animeId, episode) {
    const user = getCurrentUser();
    const key = `progress_${animeId}_${episode}`;

    if (user) {
        const docRef = doc(db, 'watchProgress', `${user.uid}_${key}`);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? docSnap.data() : null;
    } else {
        const progressData = getLocalStorage('watchProgress') || {};
        return progressData[key] || null;
    }
}

// SYNC LOCAL TO FIRESTORE (when user logs in)
export async function syncLocalToFirestore() {
    const user = getCurrentUser();
    if (!user) return;

    const collections = ['watchHistory', 'continueWatching', 'favorites', 'bookmarks'];

    for (const collectionName of collections) {
        const localData = getLocalStorage(collectionName) || [];
        for (const item of localData) {
            const docId = `${user.uid}_${item.animeId}`;
            await setDoc(doc(db, collectionName, docId), {
                ...item,
                userId: user.uid
            });
        }
        localStorage.removeItem(collectionName);
    }
}
