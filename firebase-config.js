// Import Firebase functions
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration for renekankha-app
const firebaseConfig = {
  apiKey: "AIzaSyCEp_Fu_zdvwUSj3SRJzV2TMKb-6GlOi4g",
  authDomain: "renekankha-app.firebaseapp.com",
  projectId: "renekankha-app",
  storageBucket: "renekankha-app.firebasestorage.app",
  messagingSenderId: "892966611411",
  appId: "1:892966611411:web:bfa9e68661ced6c71b6726",
  measurementId: "G-C0QYCM285E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
