import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAlWnBXnV0fPNjRzk7hkoVoBZtrIn6I4nQ",
  authDomain: "tournament-app-522c4.firebaseapp.com",
  projectId: "tournament-app-522c4",
  storageBucket: "tournament-app-522c4.firebasestorage.app",
  messagingSenderId: "909733343852",
  appId: "1:909733343852:web:9a784140ad52bb33541e49",
  measurementId: "G-EKMR0MZB1R"
};

// Prevent duplicate initialization during HMR
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
