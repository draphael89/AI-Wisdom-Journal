'use client';

import React from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useAuth } from '../useAuth';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const AuthComponent: React.FC = () => {
  const user = useAuth();
  const pathname = usePathname();

  if (user === undefined) {
    return null; // Still loading
  }

  if (user === null) {
    if (pathname === '/landing') {
      return null; // Don't show auth options on landing page
    }
    return (
      <div className="flex space-x-4">
        <Link href="/auth/signup" className="text-blue-600 hover:text-blue-800">Sign Up</Link>
        <Link href="/auth/signin" className="text-blue-600 hover:text-blue-800">Log In</Link>
      </div>
    );
  }

  const handleSignOut = () => {
    if (auth) {
      signOut(auth).catch((error) => {
        console.error('Error signing out:', error);
      });
    } else {
      console.error('Auth is not initialized');
    }
  };

  return (
    <div className="flex items-center space-x-4">
      <span>{user.email}</span>
      <button
        onClick={handleSignOut}
        className="text-red-600 hover:text-red-800"
      >
        Sign Out
      </button>
    </div>
  );
};

export default AuthComponent;