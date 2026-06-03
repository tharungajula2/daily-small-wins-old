'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { useRitualStore } from '@/store/useRitualStore';

export default function FeetOnFloor() {
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Zustand state
  const { feetOnFloorLogged, currentStreak, markFeetOnFloor } = useRitualStore();

  const todayDate = format(new Date(), 'EEEE, MMMM do');
  const encouragement = "Begin.";

  const handleTap = async () => {
    if (feetOnFloorLogged || isAnimating) return;
    
    setIsAnimating(true);

    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch (e) {
      console.log('Haptics not available in web context');
    }

    // Small delay to allow the tap animation to feel impactful
    setTimeout(() => {
      markFeetOnFloor(new Date().toISOString());
      setIsAnimating(false);
    }, 300);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] bg-canvas px-6">
      
      {/* Header Area */}
      <div className="mb-12 text-center h-12 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {feetOnFloorLogged && (
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="text-ink-primary text-2xl font-semibold tracking-tight"
            >
              {encouragement}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* The Core Interaction Button */}
      <motion.button
        onClick={handleTap}
        disabled={feetOnFloorLogged}
        whileTap={!feetOnFloorLogged ? { scale: 0.95 } : {}}
        animate={feetOnFloorLogged ? { 
          scale: [1, 1.05, 1],
          backgroundColor: 'var(--color-accent-teal)', // success
          borderColor: 'var(--color-accent-teal)'
        } : {
          backgroundColor: 'var(--color-surface)', // surface
          borderColor: 'var(--color-muted)'      // muted
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`relative w-48 h-48 rounded-full border-2 shadow-sm flex flex-col items-center justify-center transition-colors overflow-hidden ${
          feetOnFloorLogged ? 'cursor-default' : 'cursor-pointer hover:shadow-md'
        }`}
      >
        <AnimatePresence mode="wait">
          {!feetOnFloorLogged ? (
            <motion.span
              key="unlogged"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: 4 }}
              className="text-ink-primary text-base font-semibold px-4 text-center leading-snug"
            >
              I'm here.<br/>Still breathing.
            </motion.span>
          ) : (
            <motion.div
              key="logged"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-white flex flex-col items-center justify-center p-4 text-center"
            >
              <span className="text-3xl font-semibold mb-1">
                {currentStreak > 0 ? `${currentStreak}` : '🌱'}
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-widest opacity-90 leading-tight">
                {currentStreak > 0 ? (currentStreak >= 7 ? 'Days Strong 🔥' : 'Days Strong 🌱') : 'Fresh Arc'}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Post-Action Instruction */}
      <div className="mt-16 h-12">
        <AnimatePresence>
          {feetOnFloorLogged && (
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, type: 'spring', stiffness: 300, damping: 30 }}
              className="text-ink-secondary text-sm text-center font-normal leading-relaxed"
            >
              Step through the seam. <br/> Resume the arc.
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
