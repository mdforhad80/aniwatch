import { firebaseConfig } from './config.js';

let auth, db, firebaseReady = false;

try {
  firebase.initializeApp(firebaseConfig);
  auth = firebase.auth();
  db = firebase.firestore();
  firebaseReady = true;
  console.log('✅ Firebase ready');
} catch (e) {
  console.warn('⚠️ Firebase not configured, using localStorage');
}

export { auth, db, firebaseReady };
