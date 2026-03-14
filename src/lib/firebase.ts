import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBF6KIAMLv6kDc-pKvXgcJxo5Llnrql_DE",
  authDomain: "aeromed-19d7e.firebaseapp.com",
  projectId: "aeromed-19d7e",
  storageBucket: "aeromed-19d7e.firebasestorage.app",
  messagingSenderId: "441573588646",
  appId: "1:441573588646:web:e8d2c44442b6e07b423e67",
  measurementId: "G-TF09W2046Z"
};

const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const db = getFirestore(app);

export default app;
