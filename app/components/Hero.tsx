import React, { useEffect, useRef, useReducer, useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence, useAnimation, useMotionValue, animate, useTransform, useSpring, useReducedMotion, usePresence, LayoutGroup, cubicBezier } from 'framer-motion';
import Image from 'next/image';
import { FaChevronDown, FaFeather } from 'react-icons/fa';
import CardSelection from './CardSelection';
import StarryBackground from './StarryBackground';

interface Card {
  id: number;
  image: string;
  alt: string;
  snippet: string;
  fullQuote: string;
  tags: string[];
  theme: string;
}

// Enhanced logging function
const log = (message: string, data?: any) => {
  console.log(`[Hero] ${message}`, data ? JSON.stringify(data, null, 2) : '');
};

enum AnimationStage {
  INITIAL,
  GATHER,
  SPREAD,
  FAN_OUT
}

type State = {
  animationStage: AnimationStage;
  isLoading: boolean;
  isButtonHovered: boolean;
  activeCard: number | null;
  isTextVisible: boolean;
};

type Action =
  | { type: 'SET_ANIMATION_STAGE'; payload: AnimationStage }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_BUTTON_HOVER'; payload: boolean }
  | { type: 'SET_ACTIVE_CARD'; payload: number | null }
  | { type: 'SET_TEXT_VISIBLE'; payload: boolean };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_ANIMATION_STAGE':
      return { ...state, animationStage: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_BUTTON_HOVER':
      return { ...state, isButtonHovered: action.payload };
    case 'SET_ACTIVE_CARD':
      return { ...state, activeCard: action.payload };
    case 'SET_TEXT_VISIBLE':
      return { ...state, isTextVisible: action.payload };
    default:
      return state;
  }
};

const useViewportDimensions = () => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  return dimensions;
};

const customEase = cubicBezier(0.6, 0.01, -0.05, 0.95);

const useResponsiveCardSize = (viewportWidth: number, viewportHeight: number) => {
  return useMemo(() => {
    const baseWidth = Math.min(viewportWidth, viewportHeight) * 0.12;
    const cardWidth = Math.min(280, Math.max(100, baseWidth));
    const cardHeight = cardWidth * (624 / 328);
    return { cardWidth, cardHeight };
  }, [viewportWidth, viewportHeight]);
};

const useResponsiveExpandedCardSize = (viewportWidth: number, viewportHeight: number, isMobile: boolean) => {
  return useMemo(() => {
    const aspectRatio = 624 / 328;
    const maxWidth = isMobile ? Math.min(viewportWidth * 0.9, 600) : viewportWidth * 0.4;
    const maxHeight = isMobile ? viewportHeight * 0.6 : viewportHeight * 0.8;

    let width = maxWidth;
    let height = width * aspectRatio;

    if (height > maxHeight) {
      height = maxHeight;
      width = height / aspectRatio;
    }

    return { width, height };
  }, [viewportWidth, viewportHeight, isMobile]);
};

const useCardAnimation = (cardCount: number, viewportWidth: number, viewportHeight: number) => {
  const controls = useAnimation();
  const prefersReducedMotion = useReducedMotion();

  const getRandomPosition = useCallback(() => ({
    x: (Math.random() - 0.5) * viewportWidth * 0.6,
    y: (Math.random() - 0.5) * viewportHeight * 0.6,
    rotate: (Math.random() - 0.5) * 45,
    scale: 0.8 + Math.random() * 0.4,
  }), [viewportWidth, viewportHeight]);

  const animate = useCallback((stage: AnimationStage) => {
    const animationConfig = (i: number) => {
      const delay = prefersReducedMotion ? 0 : i * 0.06;
      switch (stage) {
        case AnimationStage.INITIAL:
          return getRandomPosition();
        case AnimationStage.GATHER:
          return {
            opacity: 1, 
            scale: 1, 
            x: 0, 
            y: 0, 
            rotate: 0,
            transition: { 
              duration: 1.2, 
              delay, 
              ease: [0.25, 0.1, 0.25, 1],
              type: 'spring',
              stiffness: 100,
              damping: 12
            }
          };
        case AnimationStage.SPREAD:
          return {
            x: 0,
            y: 0,
            rotate: 0,
            scale: 1,
            transition: { 
              duration: 0.8, 
              delay: delay * 0.5, 
              ease: customEase,
              type: 'spring',
              stiffness: 200,
              damping: 20
            }
          };
        case AnimationStage.FAN_OUT:
          return getRandomPosition();
      }
    };

    return new Promise<void>((resolve) => {
      controls.start(animationConfig)
        .then(() => resolve())
        .catch((error) => {
          console.error('Animation error:', error);
          controls.set({ opacity: 1 });
          resolve();
        });
    });
  }, [controls, getRandomPosition, prefersReducedMotion]);

  useEffect(() => {
    controls.set({ opacity: 0 });
  }, [controls]);

  return { controls, animate, getRandomPosition };
};

const CardDeck: React.FC<{ 
  initialCards: Card[];
  onAnimationComplete: () => void;
  viewportWidth: number;
  viewportHeight: number;
  isMobile: boolean;
}> = ({ initialCards, onAnimationComplete, viewportWidth, viewportHeight, isMobile }) => {
  const { controls, animate, getRandomPosition } = useCardAnimation(initialCards.length, viewportWidth, viewportHeight);
  const { cardWidth, cardHeight } = useResponsiveCardSize(viewportWidth, viewportHeight);
  const { width: expandedWidth, height: expandedHeight } = useResponsiveExpandedCardSize(viewportWidth, viewportHeight, isMobile);
  const deckRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [cards, setCards] = useState(initialCards);
  const [isExpanded, setIsExpanded] = useState(false);

  const shuffleCards = useCallback(() => {
    setCards(shuffleArray([...initialCards]));
  }, [initialCards]);

  const runAnimation = useCallback(async () => {
    log('Starting animation sequence');
    await animate(AnimationStage.INITIAL);
    log('Initial scattered position set');
    await new Promise(resolve => setTimeout(resolve, 300));
    await animate(AnimationStage.GATHER);
    log('Gather animation complete');
    await new Promise(resolve => setTimeout(resolve, 200));
    await animate(AnimationStage.SPREAD);
    log('Spread animation complete');
    setIsExpanded(true);
    onAnimationComplete();
  }, [animate, onAnimationComplete]);

  useEffect(() => {
    runAnimation();
  }, [runAnimation]);

  const handleHover = useCallback(async () => {
    if (!isHovered) {
      setIsHovered(true);
      await animate(AnimationStage.FAN_OUT);
      shuffleCards();
      await runAnimation();
      setIsHovered(false);
    }
  }, [isHovered, animate, runAnimation, shuffleCards]);

  return (
    <motion.div 
      ref={deckRef}
      className="grid place-items-center w-full h-full"
      style={{ 
        gridTemplateColumns: isExpanded ? '1fr' : 'repeat(5, 1fr)',
        maxWidth: isExpanded ? `${expandedWidth}px` : `${cardWidth * 5 + 64}px`,
        margin: '0 auto',
        height: isExpanded ? `${expandedHeight}px` : `${cardHeight * 2 + 16}px`,
        transition: 'all 0.5s ease-out',
      }}
      onHoverStart={handleHover}
    >
      <AnimatePresence>
        {cards.map((card, index) => (
          <TiltCard
            key={card.id}
            card={card}
            index={index}
            controls={controls}
            getRandomPosition={getRandomPosition}
            cardWidth={cardWidth}
            cardHeight={cardHeight}
            totalCards={cards.length}
            isExpanded={isExpanded}
            expandedWidth={expandedWidth}
            expandedHeight={expandedHeight}
            viewportWidth={viewportWidth}
            viewportHeight={viewportHeight}
          />
        ))}
      </AnimatePresence>
    </motion.div>
  );
};

const TiltCard: React.FC<{
  card: Card;
  index: number;
  controls: any;
  getRandomPosition: () => any;
  cardWidth: number;
  cardHeight: number;
  totalCards: number;
  isExpanded: boolean;
  expandedWidth: number;
  expandedHeight: number;
  viewportWidth: number;
  viewportHeight: number;
}> = ({ card, index, controls, getRandomPosition, cardWidth, cardHeight, totalCards, isExpanded, expandedWidth, expandedHeight, viewportWidth, viewportHeight }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(y, [-cardHeight / 2, cardHeight / 2], [10, -10]);
  const rotateY = useTransform(x, [-cardWidth / 2, cardWidth / 2], [-10, 10]);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(event.clientX - centerX);
    y.set(event.clientY - centerY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const isTopCard = index === totalCards - 1;

  return (
    <motion.div
      layout
      custom={index}
      animate={controls}
      initial={getRandomPosition()}
      className="relative cursor-pointer"
      style={{ 
        width: isExpanded && isTopCard ? expandedWidth : cardWidth,
        height: isExpanded && isTopCard ? expandedHeight : cardHeight,
        position: 'absolute',
        transition: 'width 0.5s ease-out, height 0.5s ease-out',
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        style={{
          width: '100%',
          height: '100%',
          rotateX: rotateX,
          rotateY: rotateY,
          transformStyle: 'preserve-3d',
          transition: 'transform 0.1s ease-out',
        }}
      >
        {isTopCard && (
          <motion.div
            className="absolute inset-0 bg-blue-500 opacity-75 rounded-lg filter blur-xl"
            style={{ transform: 'translateZ(-50px)' }}
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
        )}
        <motion.div
          className="rounded-lg overflow-hidden shadow-lg transition-all duration-300 ease-in-out relative w-full h-full bg-gradient-to-br from-blue-400 to-purple-500"
          style={{ transformStyle: 'preserve-3d' }}
          animate={isTopCard ? {
            boxShadow: [
              "0 0 10px rgba(59, 130, 246, 0.5), 0 0 20px rgba(59, 130, 246, 0.3)",
              "0 0 20px rgba(59, 130, 246, 0.8), 0 0 40px rgba(59, 130, 246, 0.6)",
              "0 0 10px rgba(59, 130, 246, 0.5), 0 0 20px rgba(59, 130, 246, 0.3)",
            ],
          } : {}}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        >
          <Image
            src={card.image}
            alt={card.alt}
            fill
            sizes={`${cardWidth}px`}
            style={{ objectFit: 'cover' }}
            className="rounded-lg"
            priority={index === totalCards - 1}
          />
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          />
          {isTopCard && (
            <motion.div
              className="absolute inset-0"
              style={{
                boxShadow: "inset 0 0 20px rgba(59, 130, 246, 0.5), inset 0 0 40px rgba(59, 130, 246, 0.3)",
                borderRadius: "0.5rem",
                transformStyle: 'preserve-3d',
              }}
              animate={{
                boxShadow: [
                  "inset 0 0 10px rgba(59, 130, 246, 0.5), inset 0 0 20px rgba(59, 130, 246, 0.3)",
                  "inset 0 0 20px rgba(59, 130, 246, 0.8), inset 0 0 40px rgba(59, 130, 246, 0.6)",
                  "inset 0 0 10px rgba(59, 130, 246, 0.5), inset 0 0 20px rgba(59, 130, 246, 0.3)",
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            />
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

const AnimatedWord: React.FC<{ text: string }> = ({ text }) => {
  const [isPresent, safeToRemove] = usePresence();
  const controls = useAnimation();

  useEffect(() => {
    if (isPresent) {
      controls.start('visible');
    } else {
      controls.start('hidden').then(safeToRemove);
    }
  }, [isPresent, controls, safeToRemove]);

  const wordVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        damping: 12,
        stiffness: 200,
        staggerChildren: 0.02,
        delayChildren: 0.01,
      },
    },
  };

  const letterVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', damping: 12, stiffness: 200 },
    },
  };

  return (
    <motion.span
      variants={wordVariants}
      initial="hidden"
      animate={controls}
      className="inline-block mr-2"
    >
      {text.split('').map((char, index) => (
        <motion.span key={index} variants={letterVariants} className="inline-block">
          {char}
        </motion.span>
      ))}
    </motion.span>
  );
};

const ContentReveal: React.FC<{ sequence: ReturnType<typeof useAnimationSequence>['sequence']; onForgeClick: () => void; isMobile: boolean }> = ({ sequence, onForgeClick, isMobile }) => {
  const controls = useAnimation();

  useEffect(() => {
    if (sequence.cardExpanded) {
      controls.start('visible');
    }
  }, [sequence.cardExpanded, controls]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.05,
        delayChildren: 0.1,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.4,
        ease: customEase,
        type: 'spring',
        stiffness: 120,
        damping: 8
      }
    }
  };

  return (
    <AnimatePresence>
      {sequence.cardExpanded && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={controls}
          exit="hidden"
          className={`flex flex-col ${isMobile ? 'items-center' : 'items-start'} w-full`}
        >
          <motion.h1 
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-white tracking-wide leading-tight"
            variants={itemVariants}
            animate={sequence.titleVisible ? 'visible' : 'hidden'}
            style={{
              textShadow: '0 0 10px rgba(255, 255, 255, 0.7), 0 0 20px rgba(255, 255, 255, 0.5), 0 0 30px rgba(255, 255, 255, 0.3)',
              letterSpacing: '0.05em',
              wordSpacing: '0.1em',
              lineHeight: '1.2',
            }}
          >
            <AnimatedWord text="Seeking" />
            <AnimatedWord text="Wisdom?" />
          </motion.h1>
          <motion.p 
            className={`text-base sm:text-lg md:text-xl lg:text-2xl mb-8 text-indigo-100 max-w-2xl ${isMobile ? 'text-center' : 'text-left'}`}
            variants={itemVariants}
            animate={sequence.subtitleVisible ? 'visible' : 'hidden'}
            style={{
              textShadow: '0 0 5px rgba(255, 255, 255, 0.5), 0 0 10px rgba(255, 255, 255, 0.3), 0 0 15px rgba(255, 255, 255, 0.2)',
              letterSpacing: '0.03em',
              lineHeight: '1.5',
            }}
          >
            Converse with legendary minds, and plumb the deepest recesses of your own psyche. 
          </motion.p>
          <motion.button
            variants={itemVariants}
            animate={sequence.ctaVisible ? 'visible' : 'hidden'}
            className="group bg-white/10 backdrop-blur-sm border-2 border-white/50 text-white font-semibold py-3 px-8 rounded-full text-lg shadow-lg hover:bg-white/20 transition duration-300 ease-in-out transform hover:-translate-y-1 flex items-center space-x-2"
            whileHover={{ 
              scale: 1.05,
              boxShadow: '0 0 15px rgba(255, 255, 255, 0.5), 0 0 30px rgba(255, 255, 255, 0.3), 0 0 45px rgba(255, 255, 255, 0.2)'
            }}
            whileTap={{ scale: 0.95 }}
            style={{
              textShadow: '0 0 5px rgba(255, 255, 255, 0.7), 0 0 10px rgba(255, 255, 255, 0.5)',
              boxShadow: '0 0 10px rgba(255, 255, 255, 0.3), 0 0 20px rgba(255, 255, 255, 0.2)',
            }}
            onClick={() => {
              log('Forge button clicked in ContentReveal');
              onForgeClick();
            }}
          >
            <span>Forge Your Mind</span>
            <motion.span
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
            >
              <FaFeather />
            </motion.span>
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Add this shuffle function at the top of the file, outside of any component
function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

const useAnimationSequence = () => {
  const [sequence, setSequence] = useState({
    cardExpanded: false,
    titleVisible: false,
    subtitleVisible: false,
    ctaVisible: false,
  });

  const nextStep = useCallback(() => {
    setSequence(prev => {
      if (!prev.cardExpanded) return { ...prev, cardExpanded: true };
      if (!prev.titleVisible) return { ...prev, titleVisible: true };
      if (!prev.subtitleVisible) return { ...prev, subtitleVisible: true };
      if (!prev.ctaVisible) return { ...prev, ctaVisible: true };
      return prev;
    });
  }, []);

  return { sequence, nextStep };
};

const MobileLayout: React.FC<{
  initialCards: Card[];
  onAnimationComplete: () => void;
  sequence: ReturnType<typeof useAnimationSequence>['sequence'];
  onForgeClick: () => void;
  viewportWidth: number;
  viewportHeight: number;
}> = ({ initialCards, onAnimationComplete, sequence, onForgeClick, viewportWidth, viewportHeight }) => {
  return (
    <>
      <motion.div
        className="w-full mb-4 sm:mb-6"
        style={{ height: '60vh' }}
      >
        <CardDeck 
          initialCards={initialCards} 
          onAnimationComplete={onAnimationComplete} 
          viewportWidth={viewportWidth}
          viewportHeight={viewportHeight}
          isMobile={true}
        />
      </motion.div>
      <motion.div className="w-full">
        <ContentReveal sequence={sequence} onForgeClick={onForgeClick} isMobile={true} />
      </motion.div>
    </>
  );
};

const DesktopLayout: React.FC<{
  initialCards: Card[];
  onAnimationComplete: () => void;
  sequence: ReturnType<typeof useAnimationSequence>['sequence'];
  onForgeClick: () => void;
  viewportWidth: number;
  viewportHeight: number;
}> = ({ initialCards, onAnimationComplete, sequence, onForgeClick, viewportWidth, viewportHeight }) => {
  return (
    <>
      <motion.div
        className="w-1/2 pr-8"
        style={{ height: '80vh' }}
      >
        <CardDeck 
          initialCards={initialCards} 
          onAnimationComplete={onAnimationComplete} 
          viewportWidth={viewportWidth / 2}
          viewportHeight={viewportHeight * 0.8}
          isMobile={false}
        />
      </motion.div>
      <motion.div className="w-1/2 pl-8 flex items-center">
        <ContentReveal sequence={sequence} onForgeClick={onForgeClick} isMobile={false} />
      </motion.div>
    </>
  );
};

const Hero: React.FC = () => {
  const [state, dispatch] = useReducer(reducer, {
    animationStage: AnimationStage.INITIAL,
    isLoading: true,
    isButtonHovered: false,
    activeCard: null,
    isTextVisible: false,
  });

  const { width: viewportWidth, height: viewportHeight } = useViewportDimensions();
  const isMobile = viewportWidth < 1024; // Adjust breakpoint as needed

  const initialCards = useMemo(
    () => shuffleArray([
      { id: 1, image: '/cards/Alan Watts.png', alt: 'Alan Watts Quote', snippet: 'The only way to make sense out of change is to plunge into it, move with it, and join the dance.', fullQuote: 'The only way to make sense out of change is to plunge into it, move with it, and join the dance.', tags: ['change', 'philosophy'], theme: 'wisdom' },
      { id: 2, image: '/cards/Alfred Tennyson.png', alt: 'Alfred Tennyson Quote', snippet: 'To strive, to seek, to find, and not to yield.', fullQuote: 'To strive, to seek, to find, and not to yield.', tags: ['perseverance', 'poetry'], theme: 'motivation' },
      { id: 3, image: '/cards/Baruch Spinoza.png', alt: 'Baruch Spinoza Quote', snippet: 'I have striven not to laugh at human actions, not to weep at them, nor to hate them, but to understand them.', fullQuote: 'I have striven not to laugh at human actions, not to weep at them, nor to hate them, but to understand them.', tags: ['understanding', 'philosophy'], theme: 'wisdom' },
      { id: 4, image: '/cards/Bruce Lee.png', alt: 'Bruce Lee Quote', snippet: 'Empty your mind, be formless, shapeless — like water. Now you put water in a cup, it becomes the cup; You put water into a bottle it becomes the bottle; You put it in a teapot it becomes the teapot. Now water can flow or it can crash. Be water, my friend.', fullQuote: 'Empty your mind, be formless, shapeless — like water. Now you put water in a cup, it becomes the cup; You put water into a bottle it becomes the bottle; You put it in a teapot it becomes the teapot. Now water can flow or it can crash. Be water, my friend.', tags: ['adaptability', 'martial arts'], theme: 'philosophy' },
      { id: 5, image: '/cards/C.S. Lewis.png', alt: 'C.S. Lewis Quote', snippet: 'You are never too old to set another goal or to dream a new dream.', fullQuote: 'You are never too old to set another goal or to dream a new dream.', tags: ['inspiration', 'goals'], theme: 'motivation' },
      { id: 6, image: '/cards/Carl Jung.png', alt: 'Carl Jung Quote', snippet: 'Who looks outside, dreams; who looks inside, awakes.', fullQuote: 'Who looks outside, dreams; who looks inside, awakes.', tags: ['psychology', 'self-awareness'], theme: 'introspection' },
      { id: 7, image: '/cards/Coco Chanel.png', alt: 'Coco Chanel Quote', snippet: 'The most courageous act is still to think for yourself. Aloud.', fullQuote: 'The most courageous act is still to think for yourself. Aloud.', tags: ['individuality', 'courage'], theme: 'self-expression' },
      { id: 8, image: '/cards/Isaac Newton.png', alt: 'Isaac Newton Quote', snippet: 'If I have seen further it is by standing on the shoulders of Giants.', fullQuote: 'If I have seen further it is by standing on the shoulders of Giants.', tags: ['science', 'humility'], theme: 'knowledge' },
      { id: 9, image: '/cards/James Baldwin.png', alt: 'James Baldwin Quote', snippet: 'Not everything that is faced can be changed, but nothing can be changed until it is faced.', fullQuote: 'Not everything that is faced can be changed, but nothing can be changed until it is faced.', tags: ['change', 'social justice'], theme: 'activism' },
      { id: 10, image: '/cards/John Muir.png', alt: 'John Muir Quote', snippet: 'The mountains are calling and I must go.', fullQuote: 'The mountains are calling and I must go.', tags: ['nature', 'adventure'], theme: 'exploration' },
      { id: 11, image: '/cards/Joseph Campbell.png', alt: 'Joseph Campbell Quote', snippet: 'Follow your bliss and the universe will open doors where there were only walls.', fullQuote: 'Follow your bliss and the universe will open doors where there were only walls.', tags: ['passion', 'mythology'], theme: 'self-discovery' },
      { id: 12, image: '/cards/Rabindranath Tagore.png', alt: 'Rabindranath Tagore Quote', snippet: 'You can\'t cross the sea merely by standing and staring at the water.', fullQuote: 'You can\'t cross the sea merely by standing and staring at the water.', tags: ['action', 'poetry'], theme: 'motivation' },
      { id: 13, image: '/cards/Richard Feynman.png', alt: 'Richard Feynman Quote', snippet: 'I would rather have questions that can\'t be answered than answers that can\'t be questioned.', fullQuote: 'I would rather have questions that can\'t be answered than answers that can\'t be questioned.', tags: ['science', 'curiosity'], theme: 'knowledge' },
      { id: 14, image: '/cards/Thomas Jefferson.png', alt: 'Thomas Jefferson Quote', snippet: 'I like the dreams of the future better than the history of the past.', fullQuote: 'I like the dreams of the future better than the history of the past.', tags: ['future', 'history'], theme: 'progress' },
      { id: 15, image: '/cards/William James.png', alt: 'William James Quote', snippet: 'Act as if what you do makes a difference. It does.', fullQuote: 'Act as if what you do makes a difference. It does.', tags: ['action', 'psychology'], theme: 'empowerment' },
    ]),
    []
  );

  const [showCardSelection, setShowCardSelection] = useState(false);
  const { sequence, nextStep } = useAnimationSequence();

  useEffect(() => {
    log('Hero component mounted');
    dispatch({ type: 'SET_LOADING', payload: false });
    return () => {
      log('Hero component unmounted');
    };
  }, []);

  const onCardAnimationComplete = useCallback(() => {
    log('Card animation completed');
    nextStep(); // Trigger card expansion
    setTimeout(() => {
      nextStep(); // Show title
      setTimeout(() => {
        nextStep(); // Show subtitle
        setTimeout(() => {
          nextStep(); // Show CTA
        }, 200);
      }, 200);
    }, 500);
  }, [nextStep]);

  const handleForgeClick = useCallback(() => {
    log('handleForgeClick called');
    setShowCardSelection(true);
    log('showCardSelection set to true');
  }, []);

  const handleSelectionComplete = useCallback((selectedCards: Card[]) => {
    log('handleSelectionComplete called', selectedCards);
    setShowCardSelection(false);
    log('showCardSelection set to false');
    // Here you can add logic to handle the selected cards
  }, []);

  log('Rendering Hero component', { showCardSelection, isLoading: state.isLoading, isTextVisible: state.isTextVisible });

  return (
    <motion.section
      className="relative min-h-screen w-full flex flex-col items-center justify-start overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <StarryBackground />

      <AnimatePresence mode="wait">
        {state.isLoading ? (
          <motion.div
            key="loader"
            className="relative z-20 text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: customEase }}
            />
          </motion.div>
        ) : showCardSelection ? (
          <motion.div
            key="card-selection"
            className="absolute inset-0 w-full h-full z-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <CardSelection
              initialCards={initialCards.slice(0, 8)} // Ensure we have at least 8 cards
              onSelectionComplete={handleSelectionComplete}
              viewportWidth={viewportWidth}
              viewportHeight={viewportHeight}
            />
          </motion.div>
        ) : (
          <motion.div
            key="content"
            className="container mx-auto px-6 relative z-20 flex flex-col lg:flex-row items-center justify-start min-h-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            {isMobile ? (
              <MobileLayout
                initialCards={initialCards}
                onAnimationComplete={onCardAnimationComplete}
                sequence={sequence}
                onForgeClick={handleForgeClick}
                viewportWidth={viewportWidth}
                viewportHeight={viewportHeight}
              />
            ) : (
              <DesktopLayout
                initialCards={initialCards}
                onAnimationComplete={onCardAnimationComplete}
                sequence={sequence}
                onForgeClick={handleForgeClick}
                viewportWidth={viewportWidth}
                viewportHeight={viewportHeight}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
};

export default Hero;

// Add these exports at the end of the file
export { useCardAnimation, useResponsiveCardSize, customEase, AnimationStage };