import React, { useReducer, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CardSelection, { Card } from './CardSelection';
import QuizQuestion from './QuizQuestion';
import ProgressIndicator from './ProgressIndicator';
import { useCardAnimation, AnimationStage } from './Hero';

// Enhanced logging function
const log = (message: string, data?: any) => {
  console.log(`[PersonalityAssessment] ${message}`, data ? JSON.stringify(data, null, 2) : '');
};

// Add shuffleArray function since it's not exported from CardSelection
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

interface Question {
  id: number;
  text: string;
}

type Stage = 'card' | 'quiz';

interface State {
  stage: Stage;
  cardSelections: Card[];
  quizAnswers: number[];
  currentQuestion: number;
  currentCardSet: number;
  currentCards: Card[];
}

type Action =
  | { type: 'SELECT_CARD'; payload: Card }
  | { type: 'ANSWER_QUESTION'; payload: number }
  | { type: 'SET_CURRENT_CARDS'; payload: Card[] };

const initialState: State = {
  stage: 'card',
  cardSelections: [],
  quizAnswers: [],
  currentQuestion: 0,
  currentCardSet: 0,
  currentCards: [],
};

const reducer = (state: State, action: Action): State => {
  log('Reducer called', { action, currentState: state });
  switch (action.type) {
    case 'SELECT_CARD':
      return {
        ...state,
        cardSelections: [...state.cardSelections, action.payload],
        stage: 'quiz',
        currentCards: [],
      };
    case 'ANSWER_QUESTION':
      const newQuizAnswers = [...state.quizAnswers, action.payload];
      const newCurrentQuestion = state.currentQuestion + 1;
      if (newCurrentQuestion % 10 === 0 && newCurrentQuestion < 50) {
        return {
          ...state,
          quizAnswers: newQuizAnswers,
          currentQuestion: newCurrentQuestion,
          stage: 'card',
          currentCardSet: state.currentCardSet + 1,
        };
      }
      return {
        ...state,
        quizAnswers: newQuizAnswers,
        currentQuestion: newCurrentQuestion,
      };
    case 'SET_CURRENT_CARDS':
      return { ...state, currentCards: action.payload };
    default:
      return state;
  }
};

const PersonalityAssessment: React.FC<{
  initialCards: Card[];
  questions: Question[];
  viewportWidth: number;
  viewportHeight: number;
}> = ({ initialCards, questions, viewportWidth, viewportHeight }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { animate } = useCardAnimation(4, viewportWidth, viewportHeight);

  const runCardAnimation = useCallback(async () => {
    log('Starting card animation sequence');
    await animate(AnimationStage.INITIAL);
    await new Promise(resolve => setTimeout(resolve, 500));
    await animate(AnimationStage.GATHER);
  }, [animate]);

  useEffect(() => {
    if (state.stage === 'card' && state.currentCards.length === 0) {
      const nextCards = shuffleArray(initialCards).slice(0, 4);
      dispatch({ type: 'SET_CURRENT_CARDS', payload: nextCards });
      runCardAnimation();
    }
  }, [state.stage, state.currentCards, initialCards, runCardAnimation]);

  const handleCardSelect = useCallback((selectedCard: Card) => {
    dispatch({ type: 'SELECT_CARD', payload: selectedCard });
  }, []);

  const handleQuizAnswer = useCallback((answer: number) => {
    dispatch({ type: 'ANSWER_QUESTION', payload: answer });
  }, []);

  const calculateProgress = useCallback(() => {
    return (state.currentCardSet * 10 + state.currentQuestion) / 50;
  }, [state.currentCardSet, state.currentQuestion]);

  return (
    <div className="fixed inset-0 w-full h-full flex flex-col items-center justify-center overflow-hidden">
      <ProgressIndicator progress={calculateProgress()} />
      <AnimatePresence mode="wait">
        {state.stage === 'card' && (
          <motion.div
            key="card-selection"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <CardSelection
              initialCards={state.currentCards}
              onSelectionComplete={(selectedCards) => handleCardSelect(selectedCards[0])}
              viewportWidth={viewportWidth}
              viewportHeight={viewportHeight}
            />
          </motion.div>
        )}
        {state.stage === 'quiz' && (
          <motion.div
            key="quiz-question"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <QuizQuestion
              question={questions[state.currentQuestion]}
              onAnswer={handleQuizAnswer}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PersonalityAssessment;