import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// 🔥 Aapka original firebase configuration data (Ise dhyan se check kar lena)
const firebaseConfig = {
  apiKey: "AIzaSyBykBz0lo2470KTj_A-GFLjVkbnbIV_4yc",
  authDomain: "dream-journey-67f67.firebaseapp.com",
  projectId: "dream-journey-67f67",
  storageBucket: "dream-journey-67f67.firebasestorage.app",
  messagingSenderId: "824164458085",
  appId: "1:824164458085:web:f0ff8b224a2b5c5a10f08c",
  measurementId: "G-9Z5KZ8E7ZP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// 🌟 In teeno cheezon ko sahi se export karna zaroori hai
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;