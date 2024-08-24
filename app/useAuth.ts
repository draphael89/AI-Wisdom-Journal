import { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { useFirebase } from './components/FirebaseProvider';

/**
 * Custom hook to handle Firebase authentication state
 * @returns {User | null | undefined} The current user object, null if not authenticated, or undefined if still initializing
 */
export function useAuth() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const { auth, isInitialized } = useFirebase();

  useEffect(() => {
    if (!isInitialized || !auth) return;

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, [auth, isInitialized]);

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