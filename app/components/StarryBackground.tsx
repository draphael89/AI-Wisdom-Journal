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
    return Array.from({ length: 100 * intensity }, (_, i) => ({
      id: i,
      x: `${Math.random() * 100}%`,
      y: `${Math.random() * 100}%`,
      size: Math.random() * 2 + 1,
      opacity: Math.min(1, (Math.random() * 0.5 + 0.5) * intensity),
      blinkDuration: Math.random() * 3 + 2,
    }));
  }, [intensity]);

  const shootingStars = useMemo(() => {
    return Array.from({ length: 3 }, (_, i) => ({
      id: i,
      x: `${Math.random() * 100}%`,
      y: `${Math.random() * 50}%`,
      duration: Math.random() * 2 + 1,
      delay: Math.random() * 5,
    }));
  }, []);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-900 via-purple-900 to-black"></div>
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
              opacity: [star.opacity, star.opacity * 0.5, star.opacity],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: star.blinkDuration,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        ))}
        {shootingStars.map((star) => (
          <motion.div
            key={star.id}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              top: star.y,
              left: "-2%",
            }}
            animate={{
              x: ["0%", "104%"],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: star.duration,
              delay: star.delay,
              repeat: Infinity,
              repeatDelay: Math.random() * 10 + 5,
            }}
          >
            <motion.div
              className="absolute top-0 right-0 w-8 h-[1px] bg-gradient-to-l from-white to-transparent"
              style={{ transformOrigin: "right center" }}
              animate={{ scaleX: [0, 1] }}
              transition={{
                duration: 0.2,
                repeat: Infinity,
              }}
            />
          </motion.div>
        ))}
      </div>
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-indigo-900/30"></div>
    </div>
  );
};

export default StarryBackground;