'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../useAuth';
import { addJournalEntry } from '../firestore';
import { generatePrompt } from '../services/openai';
import { motion } from 'framer-motion';

const JournalEntryForm: React.FC = () => {
  const [content, setContent] = useState('');
  const [prompt, setPrompt] = useState('');
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes in seconds
  const user = useAuth();

  useEffect(() => {
    const fetchPrompt = async () => {
      const newPrompt = await generatePrompt();
      setPrompt(newPrompt);
    };
    fetchPrompt();
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isTimerActive && timeRemaining > 0) {
      timer = setTimeout(() => setTimeRemaining(timeRemaining - 1), 1000);
    } else if (timeRemaining === 0) {
      setIsTimerActive(false);
    }
    return () => clearTimeout(timer);
  }, [isTimerActive, timeRemaining]);

  const handleStartWriting = () => {
    setIsTimerActive(true);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    // Smart comment: Implement auto-save functionality here
    // You can use a debounce function to avoid too frequent saves
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      try {
        await addJournalEntry(user.uid, content);
        console.log('Journal entry saved successfully');
        setContent('');
        // Generate a new prompt for the next entry
        const newPrompt = await generatePrompt();
        setPrompt(newPrompt);
      } catch (error) {
        console.error('Error saving journal entry:', error);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto mt-8"
    >
      <div className="mb-4 p-4 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Today&apos;s Prompt:</h2>
        <p className="italic">{prompt}</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="journal-entry" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Your Reflection
          </label>
          <textarea
            id="journal-entry"
            rows={10}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white"
            placeholder="Start writing your thoughts..."
            value={content}
            onChange={handleContentChange}
            onClick={handleStartWriting}
          ></textarea>
        </div>
        <div className="flex justify-between items-center">
          <div>
            {isTimerActive && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Time remaining: {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
              </p>
            )}
          </div>
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            disabled={!isTimerActive || timeRemaining > 0}
          >
            Save Entry
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default JournalEntryForm;