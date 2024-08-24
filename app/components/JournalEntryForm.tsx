'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../useAuth';
import { addJournalEntry } from '../firestore';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import CircularProgressBar from './CircularProgressBar';

interface JournalEntryFormProps {
  onInputChange: () => void;
  onFocusChange: (focused: boolean) => void;
}

const JournalEntryForm: React.FC<JournalEntryFormProps> = ({ onInputChange, onFocusChange }) => {
  const [prompt, setPrompt] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isPromptVisible, setIsPromptVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const user = useAuth();
  const autoSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const controls = useAnimation();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Start writing your thoughts...',
      }),
    ],
    onUpdate: ({ editor }) => {
      const words = editor.getText().trim().split(/\s+/).length;
      setWordCount(words);
      controls.start({ scale: [1, 1.1, 1], transition: { duration: 0.3 } });
      onInputChange();
    },
    onFocus: () => {
      setIsFocused(true);
      onFocusChange(true);
    },
    onBlur: () => {
      setIsFocused(false);
      onFocusChange(false);
    },
  });

  useEffect(() => {
    const fetchPrompt = async () => {
      try {
        const response = await fetch('/api/generate-prompt', { method: 'POST' });
        if (!response.ok) throw new Error('Failed to fetch prompt');
        const data = await response.json();
        setPrompt(data.prompt);
      } catch (error) {
        console.error('Error fetching prompt:', error);
        setPrompt("What's on your mind today?");
      }
    };
    fetchPrompt();
  }, []);

  useEffect(() => {
    const autoSave = async () => {
      if (user && editor && editor.getText().trim() !== '') {
        setIsSaving(true);
        try {
          await addJournalEntry(user.uid, editor.getHTML());
          setLastSaved(new Date());
        } catch (error) {
          console.error('Error auto-saving journal entry:', error);
        } finally {
          setIsSaving(false);
        }
      }
    };

    if (user && editor) {
      autoSaveIntervalRef.current = setInterval(autoSave, 10000);
    }

    return () => {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }
    };
  }, [user, editor]);

  const togglePrompt = () => setIsPromptVisible(!isPromptVisible);
  const togglePin = () => setIsPinned(!isPinned);
  const toggleFullscreen = () => setIsFullscreen(!isFullscreen);

  return (
    <motion.div
      className={`w-full h-full flex flex-col relative overflow-hidden bg-white dark:bg-gray-900 rounded-lg shadow-lg ${
        isFullscreen ? 'fixed inset-0 z-50' : 'aspect-video max-w-6xl mx-auto'
      }`}
      animate={isFullscreen ? { scale: 1.02 } : { scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="bg-primary-50 dark:bg-primary-900 p-4 shadow-md flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <motion.span animate={controls} className="text-sm font-medium text-primary-600 dark:text-primary-300">
            {wordCount} words
          </motion.span>
          <CircularProgressBar progress={(wordCount / 500) * 100} />
        </div>
        <div className="flex items-center space-x-4">
          {isSaving && (
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="text-sm text-primary-600 dark:text-primary-300"
            >
              Saving...
            </motion.span>
          )}
          {lastSaved && (
            <span className="text-sm text-primary-600 dark:text-primary-300">
              Last saved: {lastSaved.toLocaleTimeString()}
            </span>
          )}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleFullscreen}
            className="p-2 bg-primary-100 dark:bg-primary-800 rounded-full shadow-md text-primary-600 dark:text-primary-300 focus:outline-none"
          >
            {isFullscreen ? '↙' : '↗'}
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {(isPromptVisible || isPinned) && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="bg-primary-100 dark:bg-primary-800 p-4 shadow-md"
          >
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-serif font-semibold text-primary-800 dark:text-primary-200">Today&apos;s Prompt:</h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={togglePin}
                className="text-primary-600 dark:text-primary-300"
              >
                {isPinned ? '📌' : '📍'}
              </motion.button>
            </div>
            <p className="text-lg italic text-primary-600 dark:text-primary-300">{prompt}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-grow flex flex-col z-10 overflow-auto">
        <div className="flex-grow journal-content">
          <EditorContent editor={editor} className="h-full" />
        </div>
      </div>

      <motion.button
        className="absolute z-50 bottom-6 right-6 p-4 bg-primary-500 text-white rounded-full shadow-lg"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={togglePrompt}
      >
        {isPromptVisible ? '✕' : '?'}
      </motion.button>
    </motion.div>
  );
};

export default JournalEntryForm;