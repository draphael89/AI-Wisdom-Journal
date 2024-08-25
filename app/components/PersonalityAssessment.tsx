import React, { useReducer, useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CardSelection, { Card } from './CardSelection';
import { useCardAnimation, AnimationStage } from './Hero';
import QuizManager from './QuizManager';
import ResultsSummary from './ResultsSummary';

const log = (message: string, data?: any) => {
  console.log(`[PersonalityAssessment] ${message}`, data ? JSON.stringify(data, null, 2) : '');
};

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
  trait: string;
}

type Stage = 'card_selection' | 'quiz' | 'complete';

interface State {
  stage: Stage;
  cardSelections: Card[];
  quizAnswers: number[];
  currentCardSet: number;
  currentCards: Card[];
  currentQuestionIndex: number;
}

type Action =
  | { type: 'SELECT_CARD'; payload: Card }
  | { type: 'ANSWER_QUESTION'; payload: number }
  | { type: 'SET_CURRENT_CARDS'; payload: Card[] }
  | { type: 'START_QUIZ' }
  | { type: 'COMPLETE_ASSESSMENT' };

const initialState: State = {
  stage: 'card_selection',
  cardSelections: [],
  quizAnswers: [],
  currentCardSet: 0,
  currentCards: [],
  currentQuestionIndex: 0,
};

const reducer = (state: State, action: Action): State => {
  log('Reducer called', { action, currentState: state });
  switch (action.type) {
    case 'SELECT_CARD':
      return {
        ...state,
        cardSelections: [...state.cardSelections, action.payload],
        currentCards: [],
        stage: 'quiz',
      };
    case 'ANSWER_QUESTION':
      const newQuizAnswers = [...state.quizAnswers, action.payload];
      if (newQuizAnswers.length % 10 === 0 && newQuizAnswers.length < 50) {
        return {
          ...state,
          quizAnswers: newQuizAnswers,
          currentCardSet: state.currentCardSet + 1,
          stage: 'card_selection',
          currentQuestionIndex: 0,
        };
      }
      if (newQuizAnswers.length === 50) {
        return { ...state, quizAnswers: newQuizAnswers, stage: 'complete' };
      }
      return {
        ...state,
        quizAnswers: newQuizAnswers,
        currentQuestionIndex: state.currentQuestionIndex + 1,
      };
    case 'SET_CURRENT_CARDS':
      return { ...state, currentCards: action.payload };
    case 'START_QUIZ':
      return { ...state, stage: 'quiz' };
    case 'COMPLETE_ASSESSMENT':
      return { ...state, stage: 'complete' };
    default:
      return state;
  }
};

const PersonalityAssessment: React.FC<{
  initialCards: Card[];
  questions: Question[];
  viewportWidth: number;
  viewportHeight: number;
  onComplete: (results: { cardSelections: Card[], quizAnswers: number[] }) => void;
}> = ({ initialCards, questions, viewportWidth, viewportHeight, onComplete }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { animate } = useCardAnimation(4, viewportWidth, viewportHeight);

  const runCardAnimation = useCallback(async () => {
    log('Starting card animation sequence');
    await animate(AnimationStage.INITIAL);
    await new Promise(resolve => setTimeout(resolve, 500));
    await animate(AnimationStage.GATHER);
  }, [animate]);

  useEffect(() => {
    if (state.stage === 'card_selection' && state.currentCards.length === 0) {
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

  const handleAssessmentComplete = useCallback(() => {
    onComplete({ cardSelections: state.cardSelections, quizAnswers: state.quizAnswers });
    dispatch({ type: 'COMPLETE_ASSESSMENT' });
  }, [onComplete, state.cardSelections, state.quizAnswers]);

  return (
    <div className="fixed inset-0 w-full h-full flex flex-col items-center justify-center overflow-hidden">
      <AnimatePresence mode="wait">
        {state.stage === 'card_selection' && (
          <motion.div
            key="card-selection"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <CardSelection
              initialCards={state.currentCards}
              onSelectionComplete={handleCardSelect}
              viewportWidth={viewportWidth}
              viewportHeight={viewportHeight}
              isMidAssessment={state.cardSelections.length > 0}
              questions={questions}
              onQuizComplete={handleQuizAnswer}
              onAssessmentComplete={handleAssessmentComplete}
            />
          </motion.div>
        )}
        {state.stage === 'quiz' && (
          <motion.div
            key="quiz"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <QuizManager
              selectedCard={state.cardSelections[state.cardSelections.length - 1]}
              onQuizAnswer={handleQuizAnswer}
              questions={questions}
              currentQuestionIndex={state.currentQuestionIndex}
              onComplete={handleAssessmentComplete}
            />
          </motion.div>
        )}
        {state.stage === 'complete' && (
          <motion.div
            key="assessment-complete"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-2xl mx-auto"
          >
            <ResultsSummary
              cardSelections={state.cardSelections}
              quizAnswers={state.quizAnswers}
              questions={questions}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PersonalityAssessment;