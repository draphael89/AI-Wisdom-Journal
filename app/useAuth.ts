import { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

/**
 * Custom hook to handle Firebase authentication state
 * @returns {User | null | undefined} The current user object, null if not authenticated, or undefined if still initializing
 */
export function useAuth() {
  // Use a tri-state for user: null (not authenticated), undefined (initializing), or User (authenticated)
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    console.log('Setting up auth state listener');

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        console.log('User authenticated:', firebaseUser.uid);
        setUser(firebaseUser);
      } else {
        console.log('User is not authenticated');
        setUser(null);
      }
    }, (error) => {
      console.error('Error in auth state listener:', error);
      // Set user to null on error to avoid being stuck in a loading state
      setUser(null);
    });

    // Cleanup function to unsubscribe from the listener when the component unmounts
    return () => {
      console.log('Cleaning up auth state listener');
      unsubscribe();
    };
  }, []); // Empty dependency array ensures this effect runs only once on mount

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