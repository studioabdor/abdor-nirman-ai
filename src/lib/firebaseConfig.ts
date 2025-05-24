// Import the necessary functions from the Firebase SDK
import { initializeApp, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";

// Your web app's Firebase configuration
// These values should be set as Environment Variables in your Vercel project settings.
// For local development, you can create a .env.local file in the root of your project.
// Example .env.local:
// NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
// NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
// ... and so on for all firebaseConfig keys.

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "YOUR_AUTH_DOMAIN",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "YOUR_STORAGE_BUCKET",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "YOUR_MESSAGING_SENDER_ID",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "YOUR_APP_ID"
};

// Initialize Firebase
// Check if all required Firebase config values are present, especially in production
if (process.env.NODE_ENV === 'production' && 
    (!firebaseConfig.apiKey || firebaseConfig.apiKey === "YOUR_API_KEY" ||
     !firebaseConfig.authDomain || firebaseConfig.authDomain === "YOUR_AUTH_DOMAIN" ||
     !firebaseConfig.projectId || firebaseConfig.projectId === "YOUR_PROJECT_ID"
     // Add checks for other essential keys if necessary
    )) {
  console.error("Firebase configuration is missing or incomplete. Check your environment variables.");
  // Optionally, throw an error or prevent initialization if critical for production
}

let app: FirebaseApp;
try {
  app = getApp();
} catch (e) {
  app = initializeApp(firebaseConfig);
}

const auth: Auth = getAuth(app);
const firestore: Firestore = getFirestore(app);
const storage: FirebaseStorage = getStorage(app);

// Export the initialized services
export { app, auth, firestore, storage };
