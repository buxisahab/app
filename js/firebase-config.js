// Firebase Configuration
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyDdzc-_i3K_XYjP9r_qFZxH-4E6iECeNys",
  authDomain: "app-store-1959f.firebaseapp.com",
  databaseURL: "https://app-store-1959f-default-rtdb.firebaseio.com",
  projectId: "app-store-1959f",
  storageBucket: "app-store-1959f.firebasestorage.app",
  messagingSenderId: "1024099820645",
  appId: "1:1024099820645:web:52b9bec7cf7937e98a128c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const storage = getStorage(app);

export { auth, db, storage };
