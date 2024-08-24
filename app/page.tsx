'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { withAuth } from './components/withAuth';
import { useAuth } from './useAuth';
import dynamic from 'next/dynamic';
import SubtleNavbar from './components/SubtleNavbar';

const DynamicJournalEntryForm = dynamic(() => import('./components/JournalEntryForm'), {
  ssr: false,
  loading: () => <p>Loading form...</p>,
});

function JournalPage() {
  const user = useAuth();

  return (
    <>
      <SubtleNavbar />
      <div className="flex items-center justify-center min-h-screen w-full bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-900 dark:to-gray-800">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-4xl p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg mt-16"
        >
          <h1 className="text-3xl font-bold mb-6 text-center text-primary-600 dark:text-primary-400">
            Welcome to Your Journal
          </h1>
          {user && <DynamicJournalEntryForm onInputChange={() => {}} onFocusChange={() => {}} />}
        </motion.div>
      </div>
    </>
  );
}

export default withAuth(JournalPage);