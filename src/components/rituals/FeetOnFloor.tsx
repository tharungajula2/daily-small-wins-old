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
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="text-ink-primary text-2xl font-serif"
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
          backgroundColor: '#2A7F7F', // success
          borderColor: '#2A7F7F'
        } : {
          backgroundColor: '#FFFFFF', // surface
          borderColor: '#EEEDE8'      // muted
        }}
        transition={{ duration: 0.3 }}
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
              className="text-ink-primary text-lg font-medium"
            >
              I'm up
            </motion.span>
          ) : (
            <motion.div
              key="logged"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-ink-inverse flex flex-col items-center"
            >
              <span className="text-3xl font-mono mb-1">{currentStreak}</span>
              <span className="text-xs uppercase tracking-wider opacity-80">Day Streak</span>
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
              transition={{ delay: 0.5, duration: 0.2 }}
              className="text-ink-tertiary text-sm text-center max-w-[200px]"
            >
              Phone face down. <br/> See you in 30 minutes.
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
