import { initializeApp, getApps } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ,
  authDomain: "al-naba-it-services.firebaseapp.com",
  projectId: "al-naba-it-services",
  storageBucket: "al-naba-it-services.firebasestorage.app",
  messagingSenderId: "911888313779",
  appId: "1:911888313779:web:39dee6ca6baaa7260fafc6",
  measurementId: "G-XE3X5THQS9"
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

let analytics;
if (typeof window !== "undefined") {
  isSupported().then((yes) => {
    if (yes) {
      analytics = getAnalytics(app);
    }
  });
}

export { app, analytics };
