import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Card } from './CardSelection'; // Make sure to import the Card type if it's not already imported

interface DeckProps {
  selectedCards: Card[];
  cardWidth: number;
  cardHeight: number;
  newCard: Card | null;
}

const Deck: React.FC<DeckProps> = ({ selectedCards, cardWidth, cardHeight, newCard }) => {
  return (
    <div className="flex justify-center items-center space-x-2">
      {selectedCards.map((card) => (
        <motion.div
          key={card.id}
          className="relative"
          style={{ width: cardWidth, height: cardHeight }}
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Image
            src={card.image}
            alt={card.alt}
            fill
            style={{ objectFit: 'cover' }}
            className="rounded-lg"
          />
        </motion.div>
      ))}
      {newCard && (
        <motion.div
          key={newCard.id}
          className="relative"
          style={{ width: cardWidth, height: cardHeight }}
          initial={{ scale: 0.5, y: -100 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Image
            src={newCard.image}
            alt={newCard.alt}
            fill
            style={{ objectFit: 'cover' }}
            className="rounded-lg"
          />
        </motion.div>
      )}
    </div>
  );
};

export default Deck;