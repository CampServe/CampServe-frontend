import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCxi3-XywxK7OGUElhmK-f4YSkEUpvp_os",
  authDomain: "camp-serve.firebaseapp.com",
  projectId: "camp-serve",
  storageBucket: "camp-serve.appspot.com",
  messagingSenderId: "637010377958",
  appId: "1:637010377958:web:8450ca015df361cbc20f27",
  measurementId: "G-B0TYZE9BLR",
};

const app = initializeApp(firebaseConfig);

const db = getFirestore();

export { db };
