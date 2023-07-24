// Import the functions you need from the SDKs you need
import { getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

// import {} from "firebase/database"
const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "falsefriends-2f64b.firebaseapp.com",
  projectId: "falsefriends-2f64b",
  storageBucket: "falsefriends-2f64b.appspot.com",
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID,
  measurementId: import.meta.env.VITE_MEASUREMENT_ID,
};

const APP_NAME = "falseFriends";

export const app =
  getApps().find((app) => app.name === APP_NAME) ??
  initializeApp(firebaseConfig, APP_NAME);

export const firestore = getFirestore(app);
export const firebaseDatabase = getDatabase(app);
