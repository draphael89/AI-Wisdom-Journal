'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.3,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { 
      type: "spring",
      stiffness: 100
    }
  }
};

const buttonVariants = {
  hover: { scale: 1.05, boxShadow: "0px 0px 8px rgba(255,255,255,0.5)" }
};

const FeatureCard: React.FC<{ title: string; description: string; index: number }> = ({ title, description, index }) => (
  <motion.div
    className="bg-white dark:bg-gray-800 bg-opacity-10 dark:bg-opacity-10 p-6 rounded-lg shadow-lg overflow-hidden relative backdrop-blur-sm"
    whileHover={{ scale: 1.05 }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2 * index }}
  >
    <h3 className="text-xl font-semibold mb-2 text-primary-600 dark:text-primary-400">{title}</h3>
    <p className="text-sm text-gray-600 dark:text-gray-300">{description}</p>
    <motion.div
      className="absolute inset-0 bg-primary-500 bg-opacity-20"
      initial={{ opacity: 0 }}
      whileHover={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    />
  </motion.div>
);

export default function LandingPage() {
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    console.log('LandingPage: Component mounted');
    return () => {
      console.log('LandingPage: Component unmounted');
    };
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-gradient-to-br from-primary-500 to-secondary-500 dark:from-primary-800 dark:to-secondary-800 w-full">
      <motion.main 
        className="relative flex-grow flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center max-w-4xl mx-auto text-white"
        >
          <motion.h1 
            variants={itemVariants}
            className="text-5xl sm:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-primary-200"
          >
            AI Journal
          </motion.h1>
          <motion.p 
            variants={itemVariants}
            className="text-xl sm:text-2xl mb-12 max-w-2xl mx-auto"
          >
            Reflect, grow, and discover insights with AI-powered journaling.
          </motion.p>
          <motion.div variants={itemVariants} className="space-y-4 sm:space-y-0 sm:space-x-4 flex flex-col sm:flex-row justify-center">
            <motion.div variants={buttonVariants} whileHover="hover">
              <Link href="/auth/signup" className="btn-primary">
                Get Started
              </Link>
            </motion.div>
            <motion.div variants={buttonVariants} whileHover="hover">
              <Link href="/auth/signin" className="btn-primary bg-transparent border-2 border-white hover:bg-white hover:text-primary-600">
                Log In
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="mt-16 w-full max-w-6xl"
        >
          <h2 className="text-3xl font-semibold mb-8 text-center text-white">Unlock Your Potential</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { title: 'AI-Powered Insights', description: 'Gain deep understanding of your thoughts and patterns.' },
              { title: 'Daily Prompts', description: 'Never run out of ideas with our intelligent prompt generator.' },
              { title: 'Mood Tracking', description: 'Visualize your emotional journey over time.' }
            ].map((feature, index) => (
              <FeatureCard key={feature.title} {...feature} index={index} />
            ))}
          </div>
        </motion.div>
      </motion.main>

      <motion.button
        className="fixed bottom-4 right-4 p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      >
        {theme === 'dark' ? '🌞' : '🌙'}
      </motion.button>
    </div>
  );
}