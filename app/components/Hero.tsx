import React, { useEffect, useRef, useReducer, useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence, useAnimation, useMotionValue, animate, useTransform, useSpring, useReducedMotion, usePresence, LayoutGroup, cubicBezier } from 'framer-motion';
import Image from 'next/image';
import { FaChevronDown, FaFeather } from 'react-icons/fa';

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
    try {
      return controls.start(i => {
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
      });
    } catch (error) {
      console.error('Animation error:', error);
      return controls.start({ opacity: 1 });
    }
  }, [controls, getRandomPosition, prefersReducedMotion]);

  return { controls, animate, getRandomPosition };
};

const CardDeck: React.FC<{ 
  initialCards: Array<{ id: number; image: string; alt: string }>;
  onAnimationComplete: () => void;
  viewportWidth: number;
  viewportHeight: number;
}> = ({ initialCards, onAnimationComplete, viewportWidth, viewportHeight }) => {
  const { controls, animate, getRandomPosition } = useCardAnimation(initialCards.length, viewportWidth, viewportHeight);
  const { cardWidth, cardHeight } = useResponsiveCardSize(viewportWidth, viewportHeight);
  const deckRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [cards, setCards] = useState(initialCards);

  const shuffleCards = useCallback(() => {
    setCards(shuffleArray([...initialCards]));
  }, [initialCards]);

  const runAnimation = useCallback(async () => {
    log('Starting animation sequence');
    await animate(AnimationStage.INITIAL);
    log('Initial scattered position set');
    await new Promise(resolve => setTimeout(resolve, 500));
    await animate(AnimationStage.GATHER);
    log('Gather animation complete');
    await new Promise(resolve => setTimeout(resolve, 1000));
    await animate(AnimationStage.SPREAD);
    log('Spread animation complete');
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
      className="grid grid-cols-5 gap-4 place-items-center w-full"
      style={{ 
        maxWidth: `${cardWidth * 5 + 64}px`,
        margin: '0 auto',
        height: `${cardHeight * 2 + 16}px`
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
          />
        ))}
      </AnimatePresence>
    </motion.div>
  );
};

const TiltCard: React.FC<{
  card: { id: number; image: string; alt: string };
  index: number;
  controls: any;
  getRandomPosition: () => any;
  cardWidth: number;
  cardHeight: number;
  totalCards: number;
}> = ({ card, index, controls, getRandomPosition, cardWidth, cardHeight, totalCards }) => {
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
        width: `${cardWidth}px`, 
        height: `${cardHeight}px`,
        position: 'absolute',
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

const ContentReveal: React.FC<{ isVisible: boolean }> = ({ isVisible }) => {
  const controls = useAnimation();

  useEffect(() => {
    if (isVisible) {
      controls.start('visible');
    }
  }, [isVisible, controls]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
        delayChildren: 0.3,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6, 
        ease: customEase,
        type: 'spring',
        stiffness: 100,
        damping: 10
      }
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={controls}
          exit="hidden"
          className="flex flex-col items-center w-full"
        >
          <motion.h1 
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white tracking-wide leading-tight"
            variants={itemVariants}
            style={{
              textShadow: '0 0 10px rgba(255, 255, 255, 0.7), 0 0 20px rgba(255, 255, 255, 0.5), 0 0 30px rgba(255, 255, 255, 0.3)',
              letterSpacing: '0.05em',
              wordSpacing: '0.1em',
              lineHeight: '1.3',
            }}
          >
            <AnimatedWord text="Seek" />
            <AnimatedWord text="Wisdom" />
          </motion.h1>
          <motion.p 
            className="text-base sm:text-lg md:text-xl lg:text-2xl mb-8 text-indigo-100 max-w-2xl text-center"
            variants={itemVariants}
            style={{
              textShadow: '0 0 5px rgba(255, 255, 255, 0.5), 0 0 10px rgba(255, 255, 255, 0.3), 0 0 15px rgba(255, 255, 255, 0.2)',
              letterSpacing: '0.03em',
              lineHeight: '1.5',
            }}
          >
            Converse with legendary minds, and the deepest recesses of your own psyche. 
          </motion.p>
          <motion.button
            variants={itemVariants}
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

const Hero: React.FC = () => {
  const [state, dispatch] = useReducer(reducer, {
    animationStage: AnimationStage.INITIAL,
    isLoading: true,
    isButtonHovered: false,
    activeCard: null,
    isTextVisible: false,
  });

  const { width: viewportWidth, height: viewportHeight } = useViewportDimensions();

  const initialCards = useMemo(
    () => shuffleArray([
      { id: 1, image: '/cards/Alan Watts.png', alt: 'Alan Watts Quote' },
      { id: 2, image: '/cards/Alfred Tennyson.png', alt: 'Alfred Tennyson Quote' },
      { id: 3, image: '/cards/Baruch Spinoza.png', alt: 'Baruch Spinoza Quote' },
      { id: 4, image: '/cards/Bruce Lee.png', alt: 'Bruce Lee Quote' },
      { id: 5, image: '/cards/C.S. Lewis.png', alt: 'C.S. Lewis Quote' },
      { id: 6, image: '/cards/Carl Jung.png', alt: 'Carl Jung Quote' },
      { id: 7, image: '/cards/Coco Chanel.png', alt: 'Coco Chanel Quote' },
      { id: 8, image: '/cards/Isaac Newton.png', alt: 'Isaac Newton Quote' },
      { id: 9, image: '/cards/James Baldwin.png', alt: 'James Baldwin Quote' },
      { id: 10, image: '/cards/John Muir.png', alt: 'John Muir Quote' },
      { id: 11, image: '/cards/Joseph Campbell.png', alt: 'Joseph Campbell Quote' },
      { id: 12, image: '/cards/Rabindranath Tagore.png', alt: 'Rabindranath Tagore Quote' },
      { id: 13, image: '/cards/Richard Feynman.png', alt: 'Richard Feynman Quote' },
      { id: 14, image: '/cards/Thomas Jefferson.png', alt: 'Thomas Jefferson Quote' },
      { id: 15, image: '/cards/William James.png', alt: 'William James Quote' },
    ]),
    []
  );

  useEffect(() => {
    log('Hero component mounted');
    dispatch({ type: 'SET_LOADING', payload: false });
    return () => {
      log('Hero component unmounted');
    };
  }, []);

  const onCardAnimationComplete = useCallback(() => {
    log('Card animation completed');
    dispatch({ type: 'SET_TEXT_VISIBLE', payload: true });
  }, []);

  return (
    <motion.section
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-indigo-900 to-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-indigo-900/70 z-10" />

      <AnimatePresence>
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
        ) : (
          <motion.div
            key="content"
            className="container mx-auto px-6 text-center relative z-20 flex flex-col items-center justify-center min-h-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex flex-col items-center justify-center w-full h-full">
              <motion.div
                initial={{ y: 50 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                className="flex-shrink-0"
                style={{ height: '50vh' }}
              >
                <CardDeck 
                  initialCards={initialCards} 
                  onAnimationComplete={onCardAnimationComplete} 
                  viewportWidth={viewportWidth}
                  viewportHeight={viewportHeight}
                />
              </motion.div>
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1, duration: 0.8, ease: "easeOut" }}
                className="mt-2 flex-grow flex flex-col justify-start"
              >
                <ContentReveal isVisible={state.isTextVisible} />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
};

export default Hero;