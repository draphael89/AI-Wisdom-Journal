'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../useAuth';

// Logging function for development
const log = (message: string, data?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[withAuth] ${message}`, data || '');
  }
};

export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>
): React.FC<P> {
  // Return a new component that wraps the original one
  return function WithAuth(props: P) {
    const router = useRouter();
    const user = useAuth();

    useEffect(() => {
      log('Authentication check started');

      if (user === null) {
        log('User not authenticated, redirecting to landing page');
        router.push('/landing');
      } else if (user) {
        log('User authenticated', user);
      }
    }, [user, router]);

    if (user === undefined) {
      log('Rendering loading state - authentication status unknown');
      return <div>Loading...</div>;
    }

    if (user === null) {
      return null; // The useEffect will handle redirection
    }

    log('Rendering protected component');
    return <WrappedComponent {...props} />;
  };
}