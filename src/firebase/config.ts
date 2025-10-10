import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration
// Using environment variables for better security
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCphOBZ4zfZLqGWg33YTgk3bVofi1vKqlU",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "optimal-timer-466116-u0.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "optimal-timer-466116-u0",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "optimal-timer-466116-u0.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "293836082393",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:293836082393:web:ee993906afa762e5a082c8",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-C17Q3C5WGY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
