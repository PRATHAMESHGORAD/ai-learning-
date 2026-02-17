import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, initializeFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyDRMt_wSKhQP0NN5Aa7AYoWYDtMODTd1M8",
  authDomain: "ai-learning-5fe54.firebaseapp.com",
  projectId: "ai-learning-5fe54",
  storageBucket: "ai-learning-5fe54.appspot.com",
  messagingSenderId: "311939021820",
  appId: "1:311939021820:web:9088544baac4821c399079",
};

const app = initializeApp(firebaseConfig);

// ⭐ Fix for Vite Firestore offline issue
initializeFirestore(app, { experimentalForceLongPolling: true });

export const auth = getAuth(app);
export const db = getFirestore(app);

