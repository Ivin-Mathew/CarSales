// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore} from "firebase/firestore";
import 'firebase/compat/firestore';
import { getStorage } from "firebase/storage";
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDjA7-DRFvNWdlCMr9Z7r7IU4S41diTH0o",
  authDomain: "carsalesnew-67ba2.firebaseapp.com",
  projectId: "carsalesnew-67ba2",
  storageBucket: "carsalesnew-67ba2.appspot.com",
  messagingSenderId: "622232900196",
  appId: "1:622232900196:web:057a25f0221f57b7ca0571",
  measurementId: "G-HRR86PDL86"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

export { db, storage, auth };