import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface Card {
  id: number;
  image: string;
  alt: string;
}

interface DeckProps {
  selectedCards: Card[];
  cardWidth: number;
  cardHeight: number;
}

const Deck: React.FC<DeckProps> = ({ selectedCards, cardWidth, cardHeight }) => {
  return (
    <div className="mt-8 flex justify-center">
      {selectedCards.map((card, index) => (
        <motion.div
          key={card.id}
          className="relative"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.2 }}
          style={{
            width: cardWidth / 2,
            height: cardHeight / 2,
            marginLeft: index > 0 ? -cardWidth / 4 : 0,
          }}
        >
          <Image
            src={card.image}
            alt={card.alt}
            fill
            sizes={`${cardWidth / 2}px`}
            style={{ objectFit: 'cover' }}
            className="rounded-lg shadow-lg"
          />
        </motion.div>
      ))}
    </div>
  );
};

export default Deck;