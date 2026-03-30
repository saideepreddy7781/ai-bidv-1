// Firebase configuration and initialization
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const requiredFirebaseVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID'
];

const missingFirebaseVars = requiredFirebaseVars.filter((key) => !import.meta.env[key]);

// Firebase configuration from environment variables
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

let app = null;
let firebaseInitError = null;

if (missingFirebaseVars.length > 0) {
    firebaseInitError = new Error(
        `Missing Firebase environment variables: ${missingFirebaseVars.join(', ')}`
    );
    console.error(firebaseInitError.message);
} else {
    try {
        app = initializeApp(firebaseConfig);
    } catch (error) {
        firebaseInitError = error;
        console.error('Failed to initialize Firebase:', error);
    }
}

export { firebaseInitError };

// Initialize Firebase services
export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
export const storage = app ? getStorage(app) : null;
export const googleProvider = app ? new GoogleAuthProvider() : null;

export default app;
