import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// قمنا بإضافة export هنا لنستخدم الإعدادات لاحقاً
export const firebaseConfig = {
  apiKey: "AIzaSyAi_Lhcn9VPcgs28GOPq60AMz7wFZnGyco",
  authDomain: "smart-schedule-c3898.firebaseapp.com",
  projectId: "smart-schedule-c3898",
  storageBucket: "smart-schedule-c3898.firebasestorage.app",
  messagingSenderId: "932274293798",
  appId: "1:932274293798:web:fdac13380340afccadaae7"
};

// تهيئة التطبيق الأساسي
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
