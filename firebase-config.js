// Import Firebase functions
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC3j0kphQ0pWCQp2g-1fa-URukc7le84Vc",
  authDomain: "renekankha-32b97.firebaseapp.com",
  projectId: "renekankha-32b97",
  storageBucket: "renekankha-32b97.firebasestorage.app",
  messagingSenderId: "269353750433",
  appId: "1:269353750433:web:102a75e451c5901f0705e0",
  measurementId: "G-MBHR4Y7WFD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
