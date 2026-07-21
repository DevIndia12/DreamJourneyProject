import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ⚠️ Yahan apni baki bachi hui real keys copy-paste kar lena
const firebaseConfig = {
  apiKey: "AIzaSyCnZMi-saNItTaPOISX_w-D0N-pUJRmPl4",
  authDomain: "dream-journey-project.firebaseapp.com",
  projectId: "dream-journey-project",
  storageBucket: "dream-journey-project.firebasestorage.app",
  messagingSenderId: "545687848805",
  appId: "1:545687848805:web:327951db5f54963bd4438c",
  measurementId: "G-BNJTNDM835"
};

// Firebase Initialize kiya
const app = initializeApp(firebaseConfig);

// Dono cheezein export kar rahe hain (Auth + Database)
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider(); 
export const db = getFirestore(app);