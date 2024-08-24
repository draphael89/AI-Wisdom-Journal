'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { initializeFirebase, auth, firestore } from '../firebase';
import { Auth } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';

interface FirebaseContextType {
  auth: Auth | undefined;
  firestore: Firestore | undefined;
  isInitialized: boolean;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      await initializeFirebase();
      setIsInitialized(true);
    };
    initialize();
  }, []);

  if (!isInitialized) {
    return <div>Loading...</div>;
  }

  return (
    <FirebaseContext.Provider value={{ auth, firestore, isInitialized }}>
      {children}
    </FirebaseContext.Provider>
  );
};