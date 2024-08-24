import React, { useState } from 'react'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { motion, AnimatePresence } from 'framer-motion'

const inter = Inter({ subsets: ['latin'] })

export default function Layout({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useTheme()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className={`min-h-screen dark-mode-transition ${inter.className} flex flex-col`}>
      <motion.button
        className="fixed z-50 bottom-6 left-6 p-4 bg-primary-500 text-white rounded-full shadow-lg"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? '✕' : '☰'}
      </motion.button>

      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed z-40 top-0 left-0 h-full w-64 bg-white dark:bg-gray-800 shadow-lg"
          >
            <nav className="p-4 space-y-4">
              <Link href="/" className="block hover:text-primary-500">Home</Link>
              <Link href="/new" className="block hover:text-primary-500">New Entry</Link>
              <Link href="/calendar" className="block hover:text-primary-500">Calendar</Link>
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="w-full text-left hover:text-primary-500"
              >
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-grow flex">
        <div className="w-full h-full">
          {children}
        </div>
      </main>
    </div>
  )
}