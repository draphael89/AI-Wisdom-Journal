import React from 'react';
import { motion } from 'framer-motion';

interface QuizQuestionProps {
  question: { id: number; text: string };
  onAnswer: (answer: number) => void;
}

const QuizQuestion: React.FC<QuizQuestionProps> = ({ question, onAnswer }) => {
  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -50, opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-indigo-800 rounded-lg p-6 shadow-lg max-w-md w-full text-white"
    >
      <h2 className="text-xl font-semibold mb-4">{question.text}</h2>
      <div className="flex flex-col space-y-4">
        {[1, 2, 3, 4, 5].map((value) => (
          <motion.button
            key={value}
            onClick={() => onAnswer(value)}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {value === 1 ? "Strongly Disagree" :
             value === 2 ? "Disagree" :
             value === 3 ? "Neutral" :
             value === 4 ? "Agree" :
             "Strongly Agree"}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

export default QuizQuestion;