// src/firebase-config.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// O objeto de configuração que você copiou do Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyAI7LyfAftRtr16xfbeyl0XU7voxQumDgM",
  authDomain: "raphietro-atelier.firebaseapp.com",
  projectId: "raphietro-atelier",
  storageBucket: "raphietro-atelier.firebasestorage.app",
  messagingSenderId: "987956060267",
  appId: "1:987956060267:web:429fc6eb608b2b0f87912e",
  measurementId: "G-RM7YZ8V6L6"
};

// Inicialize o Firebase
const app = initializeApp(firebaseConfig);

// Exporte os serviços que você vai usar
export const auth = getAuth(app);
export const db = getFirestore(app);