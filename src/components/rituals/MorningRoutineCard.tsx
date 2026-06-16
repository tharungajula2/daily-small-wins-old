'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { useRitualStore } from '@/store/useRitualStore';
import { Sun, Check } from 'lucide-react';
import { format } from 'date-fns';

export default function MorningRoutineCard() {
  const {
    wakeWindow,
    feetOnFloorLogged,
    wakeTime,
    markFeetOnFloor
  } = useRitualStore();

  const [mounted, setMounted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getWakeTimeDisplay = () => {
    if (!feetOnFloorLogged) return 'Tap to Wake';
    if (!wakeTime) return 'Checked in';
    if (!mounted) return 'Checked in';
    try {
      const date = new Date(wakeTime);
      if (!isNaN(date.getTime())) {
        return `Checked in at ${format(date, 'h:mm a')}`;
      }
    } catch (e) {}
    return `Checked in at ${wakeTime}`;
  };

  const handleWakeTap = async () => {
    if (feetOnFloorLogged || isAnimating) return;
    setIsAnimating(true);
    try {
      await void 0;
    } catch (e) {}
    setTimeout(() => {
      markFeetOnFloor(new Date().toISOString());
      setIsAnimating(false);
    }, 150);
  };

  return (
    <div className="w-full bg-surface rounded-3xl p-6 border border-muted/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.02)] transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-accent-teal/5 flex items-center justify-center text-amber-500">
            <Sun className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-ink-primary leading-relaxed">Morning Start</h3>
            <p className="text-[10px] text-ink-secondary leading-relaxed">Target wake: {wakeWindow}</p>
          </div>
        </div>
        
        {feetOnFloorLogged ? (
          <div className="flex items-center gap-1.5 bg-canvas px-2.5 py-1 rounded-full text-[9px] font-semibold text-accent-teal select-none">
            <Check className="w-3 h-3" /> Woke up
          </div>
        ) : (
          <button
            onClick={handleWakeTap}
            disabled={isAnimating}
            className="flex items-center gap-1.5 bg-accent-teal text-white px-4 py-2 rounded-full text-[10px] uppercase tracking-wider font-semibold shadow-sm active:scale-95 transition-all"
          >
            Wake Up
          </button>
        )}
      </div>

      {feetOnFloorLogged && (
        <div className="mt-4 p-3 rounded-xl bg-canvas/40 border border-muted/30 text-center">
          <span className="text-xs font-semibold text-ink-primary">
            {getWakeTimeDisplay()}
          </span>
        </div>
      )}
    </div>
  );
}
