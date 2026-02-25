import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCZDraleloWV69WmSTEGxParizDRLdeq5U",
  authDomain: "andritz-cm-portal.firebaseapp.com",
  projectId: "andritz-cm-portal",
  storageBucket: "andritz-cm-portal.firebasestorage.app",
  messagingSenderId: "291265751897",
  appId: "1:291265751897:web:3af70e1ffd3c04ea467a48",
  measurementId: "G-MWX6GKFP9B"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
