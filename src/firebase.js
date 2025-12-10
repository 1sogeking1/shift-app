// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAX5aaD7N2qyawzY0vga9GIIENX6U4hvAA",
  authDomain: "shift-app-gyoza.firebaseapp.com",
  projectId: "shift-app-gyoza",
  storageBucket: "shift-app-gyoza.firebasestorage.app",
  messagingSenderId: "881464899274",
  appId: "1:881464899274:web:a7b2712c957ec292152633"
};

// Firebaseを使う準備
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };