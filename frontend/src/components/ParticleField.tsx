import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  type: 'star' | 'heart' | 'sparkle' | 'paw';
}

export function ParticleField() {
  const particles: Particle[] = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 16 + 8,
    duration: Math.random() * 10 + 15,
    delay: Math.random() * 5,
    type: ['star', 'heart', 'sparkle', 'paw'][Math.floor(Math.random() * 4)] as Particle['type'],
  }));

  const getEmoji = (type: Particle['type']) => {
    switch (type) {
      case 'star': return '✨';
      case 'heart': return '💖';
      case 'sparkle': return '⭐';
      case 'paw': return '🐾';
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute opacity-30"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            fontSize: particle.size,
          }}
          animate={{
            y: [0, -100, 0],
            x: [0, Math.random() * 50 - 25, 0],
            opacity: [0.2, 0.5, 0.2],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: 'easeInOut',
          }}
        >
          {getEmoji(particle.type)}
        </motion.div>
      ))}
    </div>
  );
}

export function FloatingElements() {
  const elements = [
    { emoji: '🐱', x: 5, y: 20, delay: 0 },
    { emoji: '🎀', x: 90, y: 15, delay: 1 },
    { emoji: '💎', x: 8, y: 70, delay: 2 },
    { emoji: '🌸', x: 92, y: 65, delay: 3 },
    { emoji: '🎮', x: 3, y: 45, delay: 4 },
    { emoji: '🏆', x: 95, y: 40, delay: 5 },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {elements.map((el, i) => (
        <motion.div
          key={i}
          className="absolute text-3xl md:text-4xl opacity-20"
          style={{ left: `${el.x}%`, top: `${el.y}%` }}
          animate={{
            y: [0, -20, 0],
            rotate: [-5, 5, -5],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            delay: el.delay,
            ease: 'easeInOut',
          }}
        >
          {el.emoji}
        </motion.div>
      ))}
    </div>
  );
}
