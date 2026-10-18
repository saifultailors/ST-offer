import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDdV30WmrpAuIsG4K4kDW4g3iNJitDebck",
  authDomain: "saifultailors-offers.firebaseapp.com",
  projectId: "saifultailors-offers",
  storageBucket: "saifultailors-offers.firebasestorage.app",
  messagingSenderId: "353623142763",
  appId: "1:353623142763:web:ebd1b6f0ce27d1bcc99c2e",
  measurementId: "G-8Y69EY5CV8",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);
