import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let firestore: Firestore | undefined;

export const initializeFirebase = async (): Promise<void> => {
  if (getApps().length === 0) {
    try {
      const response = await fetch('/api/firebase-config');
      if (!response.ok) {
        throw new Error('Failed to fetch Firebase config');
      }
      const config = await response.json();
      app = initializeApp(config);
      auth = getAuth(app);
      firestore = getFirestore(app);
    } catch (error) {
      console.error('Error initializing Firebase:', error);
    }
  }
};

export { app, auth, firestore };