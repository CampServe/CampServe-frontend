import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBlSO0O2XzPoZ2Le7tJzRj-HdgoBHMSxN0",
  authDomain: "camp-serve-chat.firebaseapp.com",
  projectId: "camp-serve-chat",
  storageBucket: "camp-serve-chat.appspot.com",
  messagingSenderId: "378881596802",
  appId: "1:378881596802:web:68ab77d4e173516623039b",
  measurementId: "G-T48WGPPJDQ",
};

const app = initializeApp(firebaseConfig);

const db = getFirestore();

export { db };
