import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyACWkKFucxIHaibxv6Eppr52gcbPlNl2Ko",
  authDomain: "camp-serve-37011.firebaseapp.com",
  projectId: "camp-serve-37011",
  storageBucket: "camp-serve-37011.appspot.com",
  messagingSenderId: "871957072546",
  appId: "1:871957072546:web:49cc016cd5b9243bf725fb",
};

const app = initializeApp(firebaseConfig);

const db = getFirestore();

export { db };
