const firebaseConfig = {
  apiKey: "AIzaSyAZH1xKwCGMz6F6eguS0fSZVXHDoRt2ch8",
  authDomain: "pam-chat-81a77.firebaseapp.com",
  projectId: "pam-chat-81a77",
  storageBucket: "pam-chat-81a77.firebasestorage.app",
  messagingSenderId: "914912164236",
  appId: "1:914912164236:web:5d9920f1a6b2eb94623ea9",
  measurementId: "G-N4XYLWXVV7"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Firebase services
const db = firebase.firestore();
const storage = firebase.storage();