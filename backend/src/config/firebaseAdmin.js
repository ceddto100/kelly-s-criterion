const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Configuration options
// 1. Try to use environment variables first
// 2. Fall back to service account file if environment variables are not set
let firebaseConfig;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  // Use environment variable if available
  try {
    firebaseConfig = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    console.log('Using Firebase credentials from environment variable');
  } catch (error) {
    console.error('Error parsing Firebase credentials from environment variable:', error);
  }
} else {
  // Fall back to service account file
  const serviceAccountPath = path.join(__dirname, 'service-account-key.json');
  
  if (fs.existsSync(serviceAccountPath)) {
    firebaseConfig = require(serviceAccountPath);
    console.log('Using Firebase credentials from service account file');
  } else {
    console.error('Firebase service account file not found and FIREBASE_SERVICE_ACCOUNT environment variable not set');
  }
}

// Initialize Firebase Admin with the service account credentials
if (firebaseConfig) {
  admin.initializeApp({
    credential: admin.credential.cert(firebaseConfig)
  });
} else {
  console.error('Firebase Admin SDK initialization failed due to missing credentials');
}

module.exports = admin; 