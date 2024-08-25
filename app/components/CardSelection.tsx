import React, { useReducer, useCallback, useEffect, useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useAnimation, Variants } from 'framer-motion';
import Image from 'next/image';
import { useCardAnimation, AnimationStage } from './Hero';
import StarryBackground from './StarryBackground';
import QuizManager from './QuizManager';
import { easeInOut } from "framer-motion";

const log = (message: string, data?: any) => {
  console.log(`[CardSelection] ${message}`, data ? JSON.stringify(data, null, 2) : '');
};

export interface Card {
  id: number;
  image: string;
  alt: string;
  snippet: string;
  fullQuote: string;
  tags: string[];
  theme: string;
}

enum SelectionStage {
  CARD_SELECTION,
  QUIZ,
  COMPLETE
}

type State = {
  selectionStage: SelectionStage;
  selectedCards: Card[];
  currentCards: Card[];
  animatingCard: Card | null;
  currentQuestionIndex: number;
  isQuizInProgress: boolean;
};

type Action =
  | { type: 'SET_SELECTION_STAGE'; payload: SelectionStage }
  | { type: 'SELECT_CARD'; payload: Card }
  | { type: 'SET_CURRENT_CARDS'; payload: Card[] }
  | { type: 'ANIMATION_COMPLETE' }
  | { type: 'ANSWER_QUESTION'; answer: number }
  | { type: 'COMPLETE_QUIZ' };

const reducer = (state: State, action: Action): State => {
  log('Reducer called', { action, currentState: state });
  switch (action.type) {
    case 'SET_SELECTION_STAGE':
      log('Setting selection stage', { newStage: action.payload });
      return { ...state, selectionStage: action.payload };
    case 'SELECT_CARD':
      log('Selecting card', { selectedCard: action.payload, currentStage: state.selectionStage });
      return {
        ...state,
        selectedCards: [...state.selectedCards, action.payload],
        currentCards: [],
        selectionStage: SelectionStage.QUIZ,
        animatingCard: action.payload,
        currentQuestionIndex: 0,
        isQuizInProgress: true
      };
    case 'SET_CURRENT_CARDS':
      log('Setting current cards', { newCards: action.payload });
      return { ...state, currentCards: action.payload };
    case 'ANIMATION_COMPLETE':
      log('Animation completed', { currentStage: state.selectionStage });
      return {
        ...state,
        animatingCard: null,
      };
    case 'ANSWER_QUESTION':
      const newQuestionIndex = state.currentQuestionIndex + 1;
      if (newQuestionIndex === 10) {
        return {
          ...state,
          selectionStage: SelectionStage.CARD_SELECTION,
          currentQuestionIndex: 0,
        };
      }
      return {
        ...state,
        currentQuestionIndex: newQuestionIndex,
      };
    case 'COMPLETE_QUIZ':
      return {
        ...state,
        isQuizInProgress: false,
        selectionStage: SelectionStage.COMPLETE
      };
    default:
      return state;
  }
};

const useResponsiveCardSize = (viewportWidth: number, viewportHeight: number) => {
  return useMemo(() => {
    const baseSize = Math.min(viewportWidth, viewportHeight) * 0.2;
    const maxSize = 350;
    const cardWidth = Math.min(maxSize, Math.max(200, baseSize));
    const cardHeight = cardWidth * (624 / 328);
    log('Calculated card dimensions', { cardWidth, cardHeight, viewportWidth, viewportHeight });
    return { cardWidth, cardHeight };
  }, [viewportWidth, viewportHeight]);
};

const cardVariants: Variants = {
  initial: (index: number) => ({
    opacity: 0,
    scale: 0.8,
    y: 50,
    transition: {
      duration: 0.5,
      delay: index * 0.1,
      ease: easeInOut,
    },
  }),
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: easeInOut,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    y: -50,
    transition: {
      duration: 0.5,
      ease: easeInOut,
    },
  },
};

interface CardSelectionProps {
  initialCards: Card[];
  onSelectionComplete: (selectedCard: Card) => void;
  viewportWidth: number;
  viewportHeight: number;
  questions: { id: number; text: string; trait: string }[];
  onQuizComplete: (answer: number) => void;
  onAssessmentComplete: (cardSelections: Card[], quizAnswers: number[]) => void;
  isMidAssessment: boolean;
}

const CardSelection: React.FC<CardSelectionProps> = ({
  initialCards,
  onSelectionComplete,
  viewportWidth,
  viewportHeight,
  questions,
  onQuizComplete,
  onAssessmentComplete,
  isMidAssessment
}) => {
  log('CardSelection rendered', { initialCardsCount: initialCards.length, viewportWidth, viewportHeight, isMidAssessment });

  const [state, dispatch] = useReducer(reducer, {
    selectionStage: SelectionStage.CARD_SELECTION,
    selectedCards: [],
    currentCards: initialCards.slice(0, 4),
    animatingCard: null,
    currentQuestionIndex: 0,
    isQuizInProgress: false,
  });

  log('CardSelection state', state);

  const [isAnimating, setIsAnimating] = useState(false);

  const { controls, animate, getRandomPosition } = useCardAnimation(4, viewportWidth, viewportHeight);
  const { cardWidth, cardHeight } = useResponsiveCardSize(viewportWidth, viewportHeight);

  const containerRef = useRef<HTMLDivElement>(null);

  const runAnimation = useCallback(async () => {
    log('Starting animation sequence');
    await animate(AnimationStage.INITIAL);
    log('Initial scattered position set');
    await new Promise(resolve => setTimeout(resolve, 500));
    await animate(AnimationStage.GATHER);
    log('Cards gathered for selection');
  }, [animate]);

  const handleAnimationComplete = useCallback(() => {
    log('Animation completed', { currentStage: state.selectionStage, animatingCard: state.animatingCard });
    setIsAnimating(false);
    dispatch({ type: 'ANIMATION_COMPLETE' });
  }, [state.selectionStage, state.animatingCard]);

  const handleCardSelect = useCallback((card: Card) => {
    log('Card selected', { card });
    dispatch({ type: 'SELECT_CARD', payload: card });
  }, []);

  useEffect(() => {
    log('CardSelection effect', { 
      viewportWidth, 
      viewportHeight, 
      cardWidth, 
      cardHeight, 
      currentCards: state.currentCards.length,
      selectionStage: state.selectionStage,
      selectedCards: state.selectedCards.length
    });

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      log('Container dimensions', { 
        width: rect.width, 
        height: rect.height, 
        top: rect.top, 
        left: rect.left 
      });
    }
  }, [viewportWidth, viewportHeight, cardWidth, cardHeight, state]);

  useEffect(() => {
    log('Initializing card selection', { initialCardsCount: initialCards.length });
    dispatch({ type: 'SET_CURRENT_CARDS', payload: initialCards });
    runAnimation();
  }, [initialCards, runAnimation]);

  const CardGrid = useMemo(() => {
    const GridComponent = ({ height, width }: { height: number; width: number }) => (
      <div 
        style={{ 
          height, 
          width, 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          justifyContent: 'center',
          alignContent: 'center',
        }}
      >
        {state.currentCards.map((card, index) => (
          <SelectionCard
            key={card.id}
            card={card}
            index={index}
            onSelect={handleCardSelect}
            selectionStage={state.selectionStage}
            isSelected={card.id === state.animatingCard?.id}
            onAnimationComplete={handleAnimationComplete}
            viewportWidth={viewportWidth}
            viewportHeight={viewportHeight}
          />
        ))}
      </div>
    );
    GridComponent.displayName = 'CardGrid';
    return GridComponent;
  }, [state.currentCards, handleCardSelect, state.selectionStage, state.animatingCard, handleAnimationComplete, viewportWidth, viewportHeight]);

  return (
    <motion.section
      className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden"
    >
      <StarryBackground />
      <div
        ref={containerRef}
        className="w-full h-full flex flex-col items-center justify-center relative z-20"
      >
        <AnimatePresence mode="sync">
          {state.selectionStage === SelectionStage.CARD_SELECTION ? (
            <motion.div 
              key="card-selection"
              className="w-full h-full flex justify-center items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: easeInOut }}
            >
              <CardGrid height={viewportHeight * 0.9} width={viewportWidth * 0.9} />
            </motion.div>
          ) : (
            <motion.div
              key="quiz-manager"
              className="w-full h-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: easeInOut }}
            >
              <QuizManager
                selectedCard={state.selectedCards[state.selectedCards.length - 1]}
                onQuizAnswer={(answer) => {
                  log('Quiz answer received', { answer });
                  dispatch({ type: 'ANSWER_QUESTION', answer });
                  onQuizComplete(answer);
                }}
                questions={questions}
                currentQuestionIndex={state.currentQuestionIndex}
                onComplete={() => {
                  log('Quiz completed');
                  dispatch({ type: 'COMPLETE_QUIZ' });
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
};

interface SelectionCardProps {
  card: Card;
  index: number;
  onSelect: (card: Card) => void;
  selectionStage: SelectionStage;
  isSelected: boolean;
  onAnimationComplete: () => void;
  viewportWidth: number;
  viewportHeight: number;
}

const SelectionCard: React.FC<SelectionCardProps> = React.memo(({ 
  card, 
  index, 
  onSelect, 
  selectionStage, 
  isSelected, 
  onAnimationComplete,
  viewportWidth,
  viewportHeight
}) => {
  log('SelectionCard rendered', { cardId: card.id, index, isSelected, selectionStage });

  const [isFlipped, setIsFlipped] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const cardControls = useAnimation();
  const cardRef = useRef<HTMLDivElement>(null);

  const { cardWidth, cardHeight } = useResponsiveCardSize(viewportWidth, viewportHeight);

  useEffect(() => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      log(`Card ${card.id} dimensions`, { 
        width: rect.width, 
        height: rect.height, 
        top: rect.top, 
        left: rect.left 
      });
    }
  }, [card.id, cardWidth, cardHeight]);

  const handleClick = () => {
    log('Card clicked', { cardId: card.id });
    setIsFlipped(true);
    onSelect(card);
  };

  useEffect(() => {
    if (isSelected) {
      log('Starting selected card animation', { cardId: card.id });
      cardControls.start({
        scale: 0.8,
        y: -50,
        transition: { duration: 0.5, ease: easeInOut }
      }).then(() => {
        log('Selected card animation completed', { cardId: card.id });
        onAnimationComplete();
      });
    } else if (!isSelected && selectionStage !== SelectionStage.CARD_SELECTION) {
      log('Starting unselected card animation', { cardId: card.id });
      cardControls.start({
        x: (Math.random() - 0.5) * window.innerWidth * 1.5,
        y: -window.innerHeight,
        opacity: 0,
        transition: { duration: 0.5, ease: easeInOut }
      });
    }
  }, [isSelected, cardControls, cardHeight, onAnimationComplete, selectionStage, card.id]);

  useEffect(() => {
    log('Updating card hover effect', { cardId: card.id, isHovered });
    cardControls.start({
      scale: isHovered ? 1.05 : 1,
      boxShadow: isHovered
        ? '0 0 20px rgba(59, 130, 246, 0.8), 0 0 40px rgba(59, 130, 246, 0.6)'
        : '0 0 10px rgba(59, 130, 246, 0.5), 0 0 20px rgba(59, 130, 246, 0.3)',
      transition: { duration: 0.3, ease: easeInOut }
    });
  }, [isHovered, cardControls, card.id]);

  return (
    <motion.div
      ref={cardRef}
      layout
      custom={index}
      variants={cardVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="group relative cursor-pointer w-full max-w-md mx-auto"
      style={{ 
        width: `${cardWidth}px`, 
        height: `${cardHeight}px`,
        maxWidth: '100%',
        aspectRatio: '328 / 624',
      }}
      onClick={handleClick}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <motion.div
        className="w-full h-full rounded-lg overflow-hidden"
        animate={cardControls}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <motion.div
          className="absolute w-full h-full backface-hidden"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, ease: easeInOut }}
          style={{ backfaceVisibility: 'hidden' }}
        >
          <Image
            src={card.image}
            alt={card.alt}
            fill
            sizes={`${cardWidth}px`}
            style={{ objectFit: 'cover' }}
            className="rounded-lg"
          />
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          />
        </motion.div>
        <motion.div
          className="absolute w-full h-full backface-hidden bg-indigo-800 rounded-lg p-4 flex items-center justify-center text-white text-center"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <p className="text-sm md:text-base lg:text-lg font-medium">{card.snippet}</p>
        </motion.div>
      </motion.div>
      <motion.div
        className="absolute inset-0 bg-blue-500 opacity-75 rounded-lg filter blur-xl"
        style={{ zIndex: -1 }}
        animate={{
          opacity: [0.5, 0.75, 0.5],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />
    </motion.div>
  );
});

SelectionCard.displayName = 'SelectionCard';

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  log('Array shuffled', { originalLength: array.length, shuffledLength: shuffled.length });
  return shuffled;
}

export default CardSelection;