import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

let firebaseApp: FirebaseApp | undefined;
let auth: Auth | undefined;
let firestore: Firestore | undefined;

async function initializeFirebase() {
  if (typeof window !== 'undefined' && !getApps().length) {
    try {
      const response = await fetch('/api/firebase-config');
      const config = await response.json();

      firebaseApp = initializeApp(config);
      auth = getAuth(firebaseApp);
      firestore = getFirestore(firebaseApp);
      console.log('Firebase initialized successfully');
    } catch (error) {
      console.error('Error initializing Firebase:', error);
    }
  }
}

initializeFirebase();

export { firebaseApp, auth, firestore };