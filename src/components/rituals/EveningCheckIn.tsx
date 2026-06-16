'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

import { useRitualStore } from '@/store/useRitualStore';

export default function EveningCheckIn() {
  const [win, setWin] = useState('');
  const [parkingLot, setParkingLot] = useState('');
  
  const completeEveningCheckIn = useRitualStore((state) => state.completeEveningCheckIn);

  const handleComplete = async () => {
    if (!win.trim()) return; // Win is mandatory
    
    try {
      await void 0;
    } catch (e) {
      // web fallback
    }
    
    completeEveningCheckIn(win, parkingLot);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="w-full bg-surface rounded-2xl p-5 border border-muted shadow-sm"
    >
      <h3 className="text-ink-primary font-semibold mb-6">Evening Wind-down</h3>
      
      {/* Parking Lot */}
      <div className="mb-6">
        <label className="text-ink-secondary text-sm mb-2 block font-semibold">
          Park tomorrow's thoughts
        </label>
        <textarea
          value={parkingLot}
          onChange={(e) => setParkingLot(e.target.value)}
          placeholder="Get it out of your head..."
          className="w-full bg-canvas border border-muted rounded-xl p-3 text-sm text-ink-primary placeholder:text-ink-tertiary focus:outline-none focus:border-accent-teal transition-colors min-h-[80px] font-normal"
        />
      </div>

      {/* Daily Win */}
      <div className="mb-8">
        <label className="text-ink-secondary text-sm mb-2 block font-semibold">
          One win today <span className="text-error">*</span>
        </label>
        <input
          type="text"
          value={win}
          onChange={(e) => setWin(e.target.value)}
          placeholder="What went right?"
          className="w-full bg-canvas border border-muted rounded-xl p-3 text-sm text-ink-primary placeholder:text-ink-tertiary focus:outline-none focus:border-accent-teal transition-colors font-normal"
        />
      </div>

      <button
        onClick={handleComplete}
        disabled={!win.trim()}
        className={`w-full py-3 rounded-xl font-semibold transition-all ${win.trim() ? 'bg-ink-primary text-surface' : 'bg-muted text-ink-tertiary'}`}
      >
        Close the Day
      </button>
    </motion.div>
  );
}
