// In /src/config/firebaseConfig.js

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: "kelly-s-criterion.firebaseapp.com",
  projectId: "kelly-s-criterion",
  storageBucket: "kelly-s-criterion.appspot.com",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "YOUR_MESSAGING_SENDER_ID",
  appId: process.env.FIREBASE_APP_ID || "YOUR_APP_ID"
};

module.exports = firebaseConfig;