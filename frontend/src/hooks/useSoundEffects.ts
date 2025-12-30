import { useCallback } from 'react';

// Web Audio API context for sound generation
let audioContext: AudioContext | null = null;

const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
};

// Haptic feedback utility
const triggerHaptic = (style: 'light' | 'medium' | 'heavy' = 'light') => {
  if ('vibrate' in navigator) {
    const patterns = {
      light: [10],
      medium: [20],
      heavy: [30, 10, 30],
    };
    navigator.vibrate(patterns[style]);
  }
};

// Sound effect generators using Web Audio API
const playTone = (
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume: number = 0.1
) => {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
    
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  } catch (e) {
    console.log('Audio not available');
  }
};

const playChord = (frequencies: number[], duration: number, volume: number = 0.05) => {
  frequencies.forEach((freq, i) => {
    setTimeout(() => playTone(freq, duration, 'sine', volume), i * 30);
  });
};

export const useSoundEffects = () => {
  // Button click - short pop
  const playClick = useCallback(() => {
    playTone(800, 0.08, 'sine', 0.08);
    triggerHaptic('light');
  }, []);

  // Card hover - soft whoosh
  const playHover = useCallback(() => {
    playTone(400, 0.05, 'sine', 0.03);
  }, []);

  // Card select - cheerful ding
  const playSelect = useCallback(() => {
    playChord([523, 659, 784], 0.15, 0.06);
    triggerHaptic('medium');
  }, []);

  // Success - ascending chime
  const playSuccess = useCallback(() => {
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.2, 'sine', 0.08), i * 80);
    });
    triggerHaptic('heavy');
  }, []);

  // Error - descending tone
  const playError = useCallback(() => {
    playTone(300, 0.3, 'sawtooth', 0.06);
    triggerHaptic('heavy');
  }, []);

  // Battle attack - impact sound
  const playAttack = useCallback(() => {
    playTone(150, 0.15, 'square', 0.1);
    setTimeout(() => playTone(100, 0.1, 'sawtooth', 0.08), 50);
    triggerHaptic('heavy');
  }, []);

  // Battle damage - hit sound
  const playDamage = useCallback(() => {
    playTone(200, 0.1, 'square', 0.12);
    playTone(120, 0.15, 'triangle', 0.08);
    triggerHaptic('medium');
  }, []);

  // Battle victory - fanfare
  const playVictory = useCallback(() => {
    const fanfare = [523, 659, 784, 1047, 1319];
    fanfare.forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.3, 'sine', 0.1), i * 100);
    });
    triggerHaptic('heavy');
  }, []);

  // Breeding sparkle
  const playBreeding = useCallback(() => {
    const sparkle = [880, 1108, 1318, 1760];
    sparkle.forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.15, 'sine', 0.05), i * 60);
    });
    triggerHaptic('medium');
  }, []);

  // Coin/reward sound
  const playCoin = useCallback(() => {
    playTone(1200, 0.1, 'sine', 0.08);
    setTimeout(() => playTone(1500, 0.15, 'sine', 0.06), 80);
    triggerHaptic('light');
  }, []);

  return {
    playClick,
    playHover,
    playSelect,
    playSuccess,
    playError,
    playAttack,
    playDamage,
    playVictory,
    playBreeding,
    playCoin,
  };
};
