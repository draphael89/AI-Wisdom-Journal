import React, { useReducer, useCallback, useEffect, useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import Image from 'next/image';
import { useCardAnimation, customEase, AnimationStage } from './Hero';
import Deck from './Deck';
import StarryBackground from './StarryBackground';

// Enhanced logging function
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
  ROUND_ONE,
  ROUND_TWO,
  ROUND_THREE,
  COMPLETE
}

type State = {
  selectionStage: SelectionStage;
  selectedCards: Card[];
  currentCards: Card[];
  animatingCard: Card | null;
};

type Action =
  | { type: 'SET_SELECTION_STAGE'; payload: SelectionStage }
  | { type: 'SELECT_CARD'; payload: Card }
  | { type: 'SET_CURRENT_CARDS'; payload: Card[] }
  | { type: 'ANIMATION_COMPLETE' };

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
        animatingCard: action.payload
      };
    case 'SET_CURRENT_CARDS':
      log('Setting current cards', { newCards: action.payload });
      return { ...state, currentCards: action.payload };
    case 'ANIMATION_COMPLETE':
      log('Animation completed', { currentStage: state.selectionStage });
      return {
        ...state,
        animatingCard: null,
        selectionStage: state.selectionStage + 1 as SelectionStage,
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

const CardSelection: React.FC<{ 
  initialCards: Card[];
  onSelectionComplete: (selectedCards: Card[]) => void;
  viewportWidth: number;
  viewportHeight: number;
}> = ({ initialCards, onSelectionComplete, viewportWidth, viewportHeight }) => {
  log('CardSelection component rendered', { initialCardsCount: initialCards.length, viewportWidth, viewportHeight });

  const [state, dispatch] = useReducer(reducer, {
    selectionStage: SelectionStage.ROUND_ONE,
    selectedCards: [],
    currentCards: [],
    animatingCard: null,
  });

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
    if (state.selectionStage === SelectionStage.ROUND_THREE) {
      log('Selection process completed', { finalSelectedCards: [...state.selectedCards, state.animatingCard!] });
      onSelectionComplete([...state.selectedCards, state.animatingCard!]);
    } else {
      dispatch({ type: 'ANIMATION_COMPLETE' });
      const nextCards = shuffleArray(initialCards).slice(0, 4);
      log('Next round cards', { nextCards });
      dispatch({ type: 'SET_CURRENT_CARDS', payload: nextCards });
      runAnimation(); // Reset and run the animation sequence for the new cards
    }
  }, [state.selectionStage, state.selectedCards, state.animatingCard, onSelectionComplete, initialCards, runAnimation]);

  useEffect(() => {
    log('Component mounted or updated', { 
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

  const selectCard = useCallback((card: Card) => {
    log('Card selected', { card, currentStage: state.selectionStage });
    dispatch({ type: 'SELECT_CARD', payload: card });
    setIsAnimating(true);
  }, [state.selectionStage]);

  useEffect(() => {
    log('Initializing card selection', { initialCardsCount: initialCards.length });
    const initialFourCards = shuffleArray(initialCards).slice(0, 4);
    log('Initial four cards selected', { initialFourCards });
    dispatch({ type: 'SET_CURRENT_CARDS', payload: initialFourCards });
    runAnimation();
  }, [initialCards, runAnimation]);

  return (
    <motion.section 
      className="fixed inset-0 w-full h-full flex flex-col items-center justify-center overflow-hidden"
      animate={{ backgroundColor: `rgba(0, 0, 0, ${0.5 + state.selectionStage * 0.1})` }}
    >
      <StarryBackground intensity={1.5 + state.selectionStage * 0.2} />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-indigo-900/50 z-10" />
      <div 
        ref={containerRef}
        className="w-full h-full flex flex-col items-center justify-center relative z-20"
      >
        <div className="w-full flex-grow flex flex-col justify-center">
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6 sm:gap-8 lg:gap-12 place-items-center w-full"
          >
            <AnimatePresence>
              {state.currentCards.map((card, index) => (
                <SelectionCard
                  key={card.id}
                  card={card}
                  index={index}
                  controls={controls}
                  getRandomPosition={getRandomPosition}
                  cardWidth={cardWidth}
                  cardHeight={cardHeight}
                  onSelect={selectCard}
                  selectionStage={state.selectionStage}
                  isSelected={card.id === state.animatingCard?.id}
                  onAnimationComplete={handleAnimationComplete}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
        <div className="w-full mt-8">
          <Deck 
            selectedCards={state.selectedCards} 
            cardWidth={cardWidth * 0.5} 
            cardHeight={cardHeight * 0.5}
            newCard={state.animatingCard}
          />
        </div>
      </div>
    </motion.section>
  );
};

const SelectionCard: React.FC<{
  card: Card;
  index: number;
  controls: any;
  getRandomPosition: () => any;
  cardWidth: number;
  cardHeight: number;
  onSelect: (card: Card) => void;
  selectionStage: SelectionStage;
  isSelected: boolean;
  onAnimationComplete: () => void;
}> = React.memo(({ card, index, controls, getRandomPosition, cardWidth, cardHeight, onSelect, selectionStage, isSelected, onAnimationComplete }) => {
  log('SelectionCard rendered', { cardId: card.id, index, isSelected, selectionStage });

  const [isFlipped, setIsFlipped] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const cardControls = useAnimation();
  const cardRef = useRef<HTMLDivElement>(null);

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
        transition: { duration: 0.5, ease: customEase }
      }).then(() => {
        log('Selected card animation completed', { cardId: card.id });
        onAnimationComplete();
      });
    } else if (!isSelected && selectionStage !== SelectionStage.ROUND_ONE) {
      log('Starting unselected card animation', { cardId: card.id });
      cardControls.start({
        x: (Math.random() - 0.5) * window.innerWidth * 1.5,
        y: -window.innerHeight,
        opacity: 0,
        transition: { duration: 0.5, ease: customEase }
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
      transition: { duration: 0.3, ease: customEase }
    });
  }, [isHovered, cardControls, card.id]);

  return (
    <motion.div
      ref={cardRef}
      layout
      custom={index}
      animate={controls}
      initial={getRandomPosition()}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.3 } }}
      className={`relative cursor-pointer ${!isFlipped && 'animate-pulse-soft'} w-full max-w-md mx-auto`}
      style={{ 
        width: `${cardWidth}px`, 
        height: `${cardHeight}px`,
        maxWidth: '100%',
        aspectRatio: '328 / 624',
      }}
      onClick={handleClick}
      onHoverStart={() => {
        log('Card hover started', { cardId: card.id });
        setIsHovered(true);
      }}
      onHoverEnd={() => {
        log('Card hover ended', { cardId: card.id });
        setIsHovered(false);
      }}
    >
      <motion.div
        className="w-full h-full rounded-lg overflow-hidden"
        animate={cardControls}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <motion.div
          className="absolute w-full h-full backface-hidden"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, ease: customEase }}
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
            className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity duration-300"
            animate={{ opacity: isHovered ? 1 : 0 }}
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

// Reuse the shuffleArray function from Hero.tsx
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