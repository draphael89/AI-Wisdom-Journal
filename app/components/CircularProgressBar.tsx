import React from 'react';
import { motion } from 'framer-motion';

interface CircularProgressBarProps {
  progress: number;
}

const CircularProgressBar: React.FC<CircularProgressBarProps> = ({ progress }) => {
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <motion.svg
      width="100"
      height="100"
      viewBox="0 0 100 100"
      initial={{ rotate: -90 }}
      animate={{ rotate: 0 }}
      transition={{ duration: 1 }}
    >
      <circle
        cx="50"
        cy="50"
        r="45"
        fill="none"
        stroke="#e0f2fe"
        strokeWidth="10"
      />
      <motion.circle
        cx="50"
        cy="50"
        r="45"
        fill="none"
        stroke="#0ea5e9"
        strokeWidth="10"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset }}
        transition={{ duration: 0.5 }}
      />
      <motion.text
        x="50"
        y="50"
        textAnchor="middle"
        dy=".3em"
        className="text-2xl font-bold fill-primary-600 dark:fill-primary-300"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.3 }}
      >
        {Math.round(progress)}%
      </motion.text>
    </motion.svg>
  );
};

export default CircularProgressBar;