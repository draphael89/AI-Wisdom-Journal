import React, { useReducer, useCallback, useEffect, useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import Image from 'next/image';
import { useCardAnimation, customEase, AnimationStage } from './Hero';
import Deck from './Deck';

// Enhanced logging function
const log = (message: string, data?: any) => {
  console.log(`[CardSelection] ${message}`, data ? JSON.stringify(data, null, 2) : '');
};

interface Card {
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
};

type Action =
  | { type: 'SET_SELECTION_STAGE'; payload: SelectionStage }
  | { type: 'SELECT_CARD'; payload: Card }
  | { type: 'SET_CURRENT_CARDS'; payload: Card[] };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_SELECTION_STAGE':
      return { ...state, selectionStage: action.payload };
    case 'SELECT_CARD':
      return { 
        ...state, 
        selectedCards: [...state.selectedCards, action.payload],
        selectionStage: state.selectionStage + 1 as SelectionStage
      };
    case 'SET_CURRENT_CARDS':
      return { ...state, currentCards: action.payload };
    default:
      return state;
  }
};

const useResponsiveCardSize = (viewportWidth: number, viewportHeight: number) => {
  return useMemo(() => {
    const baseSize = Math.min(viewportWidth, viewportHeight) * 0.2; // Reduced from 0.25
    const maxSize = 350; // Reduced from 400
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
  const [state, dispatch] = useReducer(reducer, {
    selectionStage: SelectionStage.ROUND_ONE,
    selectedCards: [],
    currentCards: [],
  });

  const { controls, animate, getRandomPosition } = useCardAnimation(4, viewportWidth, viewportHeight);
  const { cardWidth, cardHeight } = useResponsiveCardSize(viewportWidth, viewportHeight);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    log('Component mounted or updated', { 
      viewportWidth, 
      viewportHeight, 
      cardWidth, 
      cardHeight, 
      currentCards: state.currentCards.length 
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
  }, [viewportWidth, viewportHeight, cardWidth, cardHeight, state.currentCards]);

  const selectCard = useCallback((card: Card) => {
    log('Card selected', { cardId: card.id, stage: state.selectionStage });
    dispatch({ type: 'SELECT_CARD', payload: card });
    if (state.selectionStage === SelectionStage.ROUND_THREE) {
      onSelectionComplete([...state.selectedCards, card]);
    } else {
      const nextCards = shuffleArray(initialCards).slice(0, 4);
      dispatch({ type: 'SET_CURRENT_CARDS', payload: nextCards });
    }
  }, [state.selectionStage, state.selectedCards, initialCards, onSelectionComplete]);

  const runAnimation = useCallback(async () => {
    log('Starting animation sequence');
    await animate(AnimationStage.INITIAL);
    log('Initial scattered position set');
    await new Promise(resolve => setTimeout(resolve, 500));
    await animate(AnimationStage.GATHER);
    log('Cards gathered for selection');
  }, [animate]);

  useEffect(() => {
    const initialFourCards = shuffleArray(initialCards).slice(0, 4);
    dispatch({ type: 'SET_CURRENT_CARDS', payload: initialFourCards });
    runAnimation();
  }, [initialCards, runAnimation]);

  return (
    <motion.section className="fixed inset-0 w-full h-full flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-indigo-900 to-black">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-indigo-900/70 z-10" />
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
                />
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
        <div className="w-full mt-8">
          <Deck selectedCards={state.selectedCards} cardWidth={cardWidth * 0.5} cardHeight={cardHeight * 0.5} />
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
}> = React.memo(({ card, index, controls, getRandomPosition, cardWidth, cardHeight, onSelect, selectionStage }) => {
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
    setIsFlipped(true);
    setTimeout(() => onSelect(card), 1500); // Delay selection to allow flip animation
  };

  useEffect(() => {
    cardControls.start({
      scale: isHovered ? 1.05 : 1,
      boxShadow: isHovered
        ? '0 0 20px rgba(59, 130, 246, 0.8), 0 0 40px rgba(59, 130, 246, 0.6)'
        : '0 0 10px rgba(59, 130, 246, 0.5), 0 0 20px rgba(59, 130, 246, 0.3)',
      transition: { duration: 0.3, ease: customEase }
    });
  }, [isHovered, cardControls]);

  return (
    <motion.div
      ref={cardRef}
      layout
      custom={index}
      animate={controls}
      initial={getRandomPosition()}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`relative cursor-pointer ${!isFlipped && 'animate-pulse-soft'} w-full max-w-md mx-auto`}
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
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export default CardSelection;