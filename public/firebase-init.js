console.log("🔥 firebase-init.js loaded");

const firebaseConfig = {
  apiKey: "AIzaSyAZH1xKwCGMz6F6eguS0fSZVXHDoRt2ch8",
  authDomain: "pam-chat-81a77.firebaseapp.com",
  projectId: "pam-chat-81a77",
  storageBucket: "pam-chat-81a77.firebasestorage.app",
  messagingSenderId: "914912164236",
  appId: "1:914912164236:web:5d9920f1a6b2eb94623ea9",
  measurementId: "G-N4XYLWXVV7"
};

const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

console.log("✅ Firebase initialized");