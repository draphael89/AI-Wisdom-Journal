import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import QuizQuestion from './QuizQuestion';
import { Card } from './CardSelection';
import ProgressBar from './ProgressBar';

const QUESTIONS_PER_BATCH = 5;

export const bigFiveQuestions = [
  // Openness
  { id: 1, text: "I enjoy exploring new ideas and concepts.", trait: "Openness" },
  { id: 2, text: "I prefer sticking to familiar routines and experiences.", trait: "Openness" },
  { id: 3, text: "I often imagine creative solutions to problems.", trait: "Openness" },
  { id: 4, text: "I'm not very interested in abstract or theoretical concepts.", trait: "Openness" },
  { id: 5, text: "I enjoy experiencing different cultures and ways of life.", trait: "Openness" },
  { id: 6, text: "If I had to spend a day in a museum, I would probably get bored quickly.", trait: "Openness" },

  // Conscientiousness
  { id: 7, text: "I always complete my tasks thoroughly and on time.", trait: "Conscientiousness" },
  { id: 8, text: "I often leave my belongings out of place.", trait: "Conscientiousness" },
  { id: 9, text: "I plan ahead and organize my schedule carefully.", trait: "Conscientiousness" },
  { id: 10, text: "I sometimes act impulsively without thinking things through.", trait: "Conscientiousness" },
  { id: 11, text: "I pay attention to details in my work and daily life.", trait: "Conscientiousness" },
  { id: 12, text: "I often procrastinate on important tasks.", trait: "Conscientiousness" },

  // Extraversion
  { id: 13, text: "I enjoy being the center of attention at social gatherings.", trait: "Extraversion" },
  { id: 14, text: "I prefer spending quiet evenings at home rather than going out.", trait: "Extraversion" },
  { id: 15, text: "I find it easy to strike up conversations with strangers.", trait: "Extraversion" },
  { id: 16, text: "Large crowds and noisy environments make me feel uncomfortable.", trait: "Extraversion" },
  { id: 17, text: "I feel energized after spending time with a group of people.", trait: "Extraversion" },
  { id: 18, text: "I need a lot of alone time to recharge my energy.", trait: "Extraversion" },

  // Agreeableness
  { id: 19, text: "I always try to see things from others' points of view.", trait: "Agreeableness" },
  { id: 20, text: "I can be critical of others when I disagree with them.", trait: "Agreeableness" },
  { id: 21, text: "I enjoy helping others, even if it means putting their needs before my own.", trait: "Agreeableness" },
  { id: 22, text: "In conflicts, I tend to stand my ground rather than seek compromise.", trait: "Agreeableness" },
  { id: 23, text: "I'm generally trusting of others' intentions.", trait: "Agreeableness" },
  { id: 24, text: "I can be skeptical of people's motives.", trait: "Agreeableness" },

  // Neuroticism
  { id: 25, text: "I often worry about things that might go wrong.", trait: "Neuroticism" },
  { id: 26, text: "I rarely feel anxious or overwhelmed by my emotions.", trait: "Neuroticism" },
  { id: 27, text: "Small setbacks can sometimes feel very frustrating to me.", trait: "Neuroticism" },
  { id: 28, text: "I generally stay calm under pressure.", trait: "Neuroticism" },
  { id: 29, text: "I often experience mood swings throughout the day.", trait: "Neuroticism" },
  { id: 30, text: "I find it easy to relax and unwind after a stressful day.", trait: "Neuroticism" },
];

const shuffleQuestions = (questions: typeof bigFiveQuestions) => {
  return [...questions].sort(() => Math.random() - 0.5);
};

interface QuizManagerProps {
  selectedCard: Card;
  onQuizAnswer: (answer: number) => void;
  questions: { id: number; text: string; trait: string }[];
  currentQuestionIndex: number;
  onComplete: () => void;
}

const QuizManager: React.FC<QuizManagerProps> = React.memo(({
  selectedCard,
  onQuizAnswer,
  questions,
  currentQuestionIndex,
  onComplete,
}) => {
  const currentQuestion = questions[currentQuestionIndex];
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, [currentQuestionIndex]);

  const handleAnswer = (answer: number) => {
    onQuizAnswer(answer);
    if (currentQuestionIndex === questions.length - 1) {
      onComplete();
    }
  };

  return (
    <div className="w-full h-full">
      <AnimatePresence mode="wait">
        {!isLoading && currentQuestion && (
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <QuizQuestion
              question={currentQuestion}
              onAnswer={handleAnswer}
              currentQuestionIndex={currentQuestionIndex}
              totalQuestions={questions.length}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export default QuizManager;