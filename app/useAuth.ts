import { useState, useEffect } from 'react';
import { User, onAuthStateChanged, Unsubscribe } from 'firebase/auth';
import { auth } from './firebase';

/**
 * Custom hook to handle Firebase authentication state
 * @returns {User | null | undefined} The current user object, null if not authenticated, or undefined if still initializing
 */
export function useAuth() {
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    console.log('Setting up auth state listener');

    let unsubscribe: Unsubscribe | undefined;

    const checkAuth = async () => {
      if (!auth) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for Firebase to initialize
      }

      if (!auth) {
        console.error('Firebase auth is not initialized');
        setUser(null);
        return;
      }

      unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          console.log('User authenticated:', firebaseUser.uid);
          setUser(firebaseUser);
        } else {
          console.log('User is not authenticated');
          setUser(null);
        }
      }, (error) => {
        console.error('Error in auth state listener:', error);
        setUser(null);
      });
    };

    checkAuth();

    return () => {
      console.log('Cleaning up auth state listener');
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  return user;
}

/**
 * Helper function to check if the user is authenticated
 * @param {User | null | undefined} user - The user object from useAuth
 * @returns {boolean} True if the user is authenticated, false otherwise
 */
export function isAuthenticated(user: User | null | undefined): boolean {
  return user !== null && user !== undefined;
}

/**
 * Helper function to check if the auth state is still loading
 * @param {User | null | undefined} user - The user object from useAuth
 * @returns {boolean} True if the auth state is still loading, false otherwise
 */
export function isAuthLoading(user: User | null | undefined): boolean {
  return user === undefined;
}