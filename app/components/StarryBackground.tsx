import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface Star {
  id: number;
  x: string;
  y: string;
  size: number;
  opacity: number;
  blinkDuration: number;
}

interface StarryBackgroundProps {
  intensity?: number;
}

const StarryBackground: React.FC<StarryBackgroundProps> = ({ intensity = 1 }) => {
  const stars = useMemo(() => {
    return Array.from({ length: 150 * intensity }, (_, i) => ({
      id: i,
      x: `${Math.random() * 100}%`,
      y: `${Math.random() * 100}%`,
      size: Math.random() * 3 + 0.5,
      opacity: Math.min(1, (Math.random() * 0.7 + 0.3) * intensity),
      blinkDuration: Math.random() * 4 + 2,
    }));
  }, [intensity]);

  const shootingStars = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => ({
      id: i,
      x: `${Math.random() * 100}%`,
      y: `${Math.random() * 40}%`,
      duration: Math.random() * 1.5 + 0.5,
      delay: Math.random() * 8,
    }));
  }, []);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-950 via-purple-950 to-black"></div>
      <div className="absolute inset-0">
        {stars.map((star) => (
          <motion.div
            key={star.id}
            className="absolute rounded-full bg-white"
            style={{
              top: star.y,
              left: star.x,
              width: star.size,
              height: star.size,
            }}
            animate={{
              opacity: [star.opacity, star.opacity * 0.3, star.opacity],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: star.blinkDuration,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
          />
        ))}
        {shootingStars.map((star) => (
          <motion.div
            key={star.id}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              top: star.y,
              left: "-5%",
            }}
            animate={{
              x: ["0%", "110%"],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: star.duration,
              delay: star.delay,
              repeat: Infinity,
              repeatDelay: Math.random() * 15 + 10,
              ease: "easeInOut",
            }}
          >
            <motion.div
              className="absolute top-0 right-0 w-12 h-[1px] bg-gradient-to-l from-white via-white to-transparent"
              style={{ transformOrigin: "right center" }}
              animate={{ scaleX: [0, 1, 0] }}
              transition={{
                duration: 0.3,
                repeat: Infinity,
                ease: "easeOut",
              }}
            />
          </motion.div>
        ))}
      </div>
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-indigo-950/40"></div>
    </div>
  );
};

export default StarryBackground;