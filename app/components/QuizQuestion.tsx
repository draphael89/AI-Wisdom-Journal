import React, { useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';

const log = (message: string, data?: any) => {
  console.log(`[QuizQuestion] ${message}`, data ? JSON.stringify(data, null, 2) : '');
};

interface QuizQuestionProps {
  question: { id: number; text: string; trait: string } | undefined;
  onAnswer: (answer: number) => void;
  currentQuestionIndex: number;
  totalQuestions: number;
}

const QuizQuestion: React.FC<QuizQuestionProps> = React.memo(({ question, onAnswer, currentQuestionIndex, totalQuestions }) => {
  const controls = useAnimation();

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.43, 0.13, 0.23, 0.96],
        delayChildren: 0.1,
        staggerChildren: 0.07
      }
    },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.3, ease: [0.43, 0.13, 0.23, 0.96] } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: 'spring', stiffness: 300, damping: 24 }
    }
  };

  const floatingAnimation = {
    y: [0, -10, 0],
    rotate: [0, 1, 0],
    transition: {
      duration: 6,
      repeat: Infinity,
      repeatType: "reverse" as const,
      ease: "easeInOut"
    }
  };

  const shimmerEffect = {
    background: [
      'linear-gradient(45deg, rgba(79, 70, 229, 0.1) 0%, rgba(167, 139, 250, 0.1) 50%, rgba(79, 70, 229, 0.1) 100%)',
      'linear-gradient(45deg, rgba(79, 70, 229, 0.2) 0%, rgba(167, 139, 250, 0.2) 50%, rgba(79, 70, 229, 0.2) 100%)',
      'linear-gradient(45deg, rgba(79, 70, 229, 0.1) 0%, rgba(167, 139, 250, 0.1) 50%, rgba(79, 70, 229, 0.1) 100%)',
    ],
    transition: {
      duration: 3,
      repeat: Infinity,
      repeatType: "reverse" as const,
      ease: "easeInOut"
    }
  };

  const particles = useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      x: `${Math.random() * 100}%`,
      y: `${Math.random() * 100}%`,
      scale: Math.random() * 0.5 + 0.5,
      opacity: Math.random() * 0.5 + 0.5,
    }));
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key >= '1' && e.key <= '5') {
      log('Answer selected via keyboard', { key: e.key });
      onAnswer(parseInt(e.key));
    }
  }, [onAnswer]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    log('Keyboard event listener added');
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      log('Keyboard event listener removed');
    };
  }, [handleKeyDown]);

  useEffect(() => {
    controls.start('visible');
    log('Animation started', { questionId: question?.id });
  }, [controls, question]);

  if (!question) {
    log('No question provided, rendering null');
    return null;
  }

  return (
    <motion.div
      layout
      className="relative w-full h-full flex items-center justify-center"
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={containerVariants}
    >
      <motion.div
        className="relative max-w-3xl w-full mx-4 flex flex-col justify-center items-center min-h-[60vh]"
        style={{
          backdropFilter: 'blur(10px)',
          backgroundColor: 'rgba(79, 70, 229, 0.1)',
          borderRadius: '2rem',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <AnimatePresence mode="wait">
          {question && (
            <motion.div
              key={question.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="p-8 w-full"
            >
              <motion.h2 
                variants={itemVariants} 
                className="text-3xl font-bold mb-4 text-primary-100 text-center animate-glow-pulse font-sans"
              >
                {question.text}
              </motion.h2>
              <motion.p
                variants={itemVariants}
                className="text-sm text-primary-200 text-center mb-8"
              >
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </motion.p>
              <div className="space-y-4 mt-4">
                {[1, 2, 3, 4, 5].map((value) => (
                  <motion.button
                    key={value}
                    variants={itemVariants}
                    whileHover={{ scale: 1.03, transition: { type: 'spring', stiffness: 400, damping: 10 } }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      log('Answer selected via click', { value });
                      onAnswer(value);
                    }}
                    className="w-full bg-gradient-to-r from-primary-600/40 to-secondary-600/40 hover:from-primary-500/50 hover:to-secondary-500/50 text-primary-100 font-semibold py-3 px-4 rounded-xl transition-all duration-300 ease-in-out transform hover:shadow-lg group relative overflow-hidden"
                  >
                    <span className="relative z-10 group-hover:text-white transition-colors duration-300 font-sans text-sm">
                      {value}. {value === 1 ? "Strongly Disagree" :
                       value === 2 ? "Disagree" :
                       value === 3 ? "Neutral" :
                       value === 4 ? "Agree" :
                       "Strongly Agree"}
                    </span>
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-r from-primary-400/0 via-primary-400/30 to-primary-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                    />
                  </motion.button>
                ))}
              </div>
              {particles.map((particle) => (
                <motion.div
                  key={particle.id}
                  className="absolute w-1 h-1 bg-primary-300 rounded-full"
                  style={{ left: particle.x, top: particle.y, opacity: particle.opacity }}
                  animate={{
                    scale: [particle.scale, particle.scale * 1.5, particle.scale],
                    opacity: [particle.opacity, particle.opacity * 1.5, particle.opacity],
                  }}
                  transition={{
                    duration: Math.random() * 2 + 2,
                    repeat: Infinity,
                    repeatType: 'reverse' as const,
                  }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
});

QuizQuestion.displayName = 'QuizQuestion';

export default QuizQuestion;