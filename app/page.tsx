'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { withAuth } from './components/withAuth';
import { useAuth } from './useAuth';
import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';

const DynamicJournalEntryForm = dynamic(() => import('./components/JournalEntryForm'), {
  ssr: false,
});

function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const user = useAuth();
  const { theme } = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  console.log('Home component rendered', { user, isLoading });

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-primary-500 to-secondary-500 dark:from-primary-800 dark:to-secondary-800">
      <AnimatePresence>
        {isLoading ? (
          <motion.div
            key="loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex justify-center items-center h-screen"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-t-4 border-white border-solid rounded-full animate-spin"
            ></motion.div>
          </motion.div>
        ) : (
          <motion.main
            key="content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="px-4 py-8 text-white"
          >
            <div className="max-w-4xl mx-auto">
              <motion.h1 
                className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-primary-200"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Welcome to AI Journal
              </motion.h1>
              {user && (
                <motion.p 
                  className="mb-4 text-lg"
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  Logged in as: <span className="font-semibold">{user.email}</span>
                </motion.p>
              )}
              <motion.p 
                className="text-xl mb-8"
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Start your journaling journey here.
              </motion.p>
              
              <motion.div 
                className="flex justify-between items-center mb-8"
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Link href="/calendar" className="text-white hover:text-primary-200 transition duration-300 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  View Past Entries
                </Link>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg shadow-lg p-6"
              >
                <DynamicJournalEntryForm />
              </motion.div>
            </div>
          </motion.main>
        )}
      </AnimatePresence>
    </div>
  );
}

export default withAuth(Home);