import React, { useReducer, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CardSelection, { Card } from './CardSelection';
import { useCardAnimation, AnimationStage } from './Hero';
import QuizManager from './QuizManager';
import ResultsSummary from './ResultsSummary';
import ProgressBar from './ProgressBar';
import StarryBackground from './StarryBackground';

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
}> = React.memo(({ initialCards, questions, viewportWidth, viewportHeight, onComplete }) => {
  log('PersonalityAssessment rendered', { initialCardsCount: initialCards.length, questionsCount: questions.length, viewportWidth, viewportHeight });

  const [state, dispatch] = useReducer(reducer, initialState);
  log('PersonalityAssessment state', state);

  const { animate } = useCardAnimation(4, viewportWidth, viewportHeight);

  const runCardAnimation = useCallback(async () => {
    log('Starting card animation sequence');
    await animate(AnimationStage.INITIAL);
    await new Promise(resolve => setTimeout(resolve, 500));
    await animate(AnimationStage.GATHER);
    log('Card animation sequence completed');
  }, [animate]);

  useEffect(() => {
    if (state.stage === 'card_selection' && state.currentCards.length === 0) {
      log('Initializing new card set');
      const nextCards = shuffleArray(initialCards).slice(0, 4);
      dispatch({ type: 'SET_CURRENT_CARDS', payload: nextCards });
      runCardAnimation();
    }
  }, [state.stage, state.currentCards, initialCards, runCardAnimation]);

  const handleCardSelect = useCallback((selectedCard: Card) => {
    log('Card selected', { selectedCard });
    dispatch({ type: 'SELECT_CARD', payload: selectedCard });
  }, []);

  const handleQuizAnswer = useCallback((answer: number) => {
    log('Quiz answer received', { answer });
    dispatch({ type: 'ANSWER_QUESTION', payload: answer });
  }, []);

  const handleAssessmentComplete = useCallback(() => {
    log('Assessment completed', { cardSelections: state.cardSelections, quizAnswers: state.quizAnswers });
    onComplete({ cardSelections: state.cardSelections, quizAnswers: state.quizAnswers });
    dispatch({ type: 'COMPLETE_ASSESSMENT' });
  }, [onComplete, state.cardSelections, state.quizAnswers]);

  const memoizedCardSelection = useMemo(() => (
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
  ), [state.currentCards, handleCardSelect, viewportWidth, viewportHeight, state.cardSelections.length, questions, handleQuizAnswer, handleAssessmentComplete]);

  const memoizedQuizManager = useMemo(() => (
    <QuizManager
      selectedCard={state.cardSelections[state.cardSelections.length - 1]}
      onQuizAnswer={handleQuizAnswer}
      questions={questions}
      currentQuestionIndex={state.currentQuestionIndex}
      onComplete={handleAssessmentComplete}
    />
  ), [state.cardSelections, handleQuizAnswer, questions, state.currentQuestionIndex, handleAssessmentComplete]);

  const memoizedResultsSummary = useMemo(() => (
    <ResultsSummary
      cardSelections={state.cardSelections}
      quizAnswers={state.quizAnswers}
      questions={questions}
    />
  ), [state.cardSelections, state.quizAnswers, questions]);

  const progress = useMemo(() => {
    const totalSteps = 5; // 5 card selections
    const stepsCompleted = state.cardSelections.length + (state.quizAnswers.length / 10);
    const progressValue = (stepsCompleted / totalSteps) * 100;
    log('Progress calculated', { stepsCompleted, totalSteps, progressValue });
    return progressValue;
  }, [state.cardSelections.length, state.quizAnswers.length]);

  useEffect(() => {
    if (state.stage === 'card_selection') {
      log('Rendering CardSelection component');
    }
  }, [state.stage]);

  useEffect(() => {
    if (state.stage === 'quiz') {
      log('Rendering QuizManager component');
    }
  }, [state.stage]);

  useEffect(() => {
    if (state.stage === 'complete') {
      log('Rendering ResultsSummary component');
    }
  }, [state.stage]);

  return (
    <div className="fixed inset-0 w-full h-full flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-900 to-purple-900">
      <StarryBackground intensity={1.5} />
      <div className="w-full max-w-4xl px-4 py-8 relative z-10">
        <ProgressBar progress={progress} />
      </div>
      <AnimatePresence mode="wait">
        {state.stage === 'card_selection' && (
          <motion.div
            key="card-selection"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-4xl"
          >
            {memoizedCardSelection}
          </motion.div>
        )}
        {state.stage === 'quiz' && (
          <motion.div
            key="quiz"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-4xl"
          >
            {memoizedQuizManager}
          </motion.div>
        )}
        {state.stage === 'complete' && (
          <motion.div
            key="assessment-complete"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-4xl"
          >
            {memoizedResultsSummary}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

PersonalityAssessment.displayName = 'PersonalityAssessment';

export default PersonalityAssessment;