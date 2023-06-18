import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDvoIuz31C_krcpIVbPQ8NYaLripjJkWhg",
  authDomain: "camp-serve-2.firebaseapp.com",
  projectId: "camp-serve-2",
  storageBucket: "camp-serve-2.appspot.com",
  messagingSenderId: "85235367144",
  appId: "1:85235367144:web:be9a6cd5e1664db6efdd5d",
  measurementId: "G-54X6P354ZB",
};

const app = initializeApp(firebaseConfig);

const db = getFirestore();

export { db };
