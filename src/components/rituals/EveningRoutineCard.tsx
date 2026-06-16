'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { useRitualStore } from '@/store/useRitualStore';
import { Moon, Shield, Check, ChevronDown, ChevronUp } from 'lucide-react';

export default function EveningRoutineCard() {
  const {
    sleepWindow,
    eveningCheckInDone,
    completeEveningCheckIn
  } = useRitualStore();

  const handleCloseDay = async () => {
    try {
      await void 0;
    } catch (e) {}
    // We send empty strings because Win and Park are removed
    await completeEveningCheckIn('', '');
  };

  return (
    <div className="w-full bg-surface rounded-3xl p-6 border border-muted/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.02)] transition-all">
      <div className="flex items-center justify-between pb-3 border-b border-muted/40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-accent-teal/5 flex items-center justify-center text-accent-teal">
            <Moon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-ink-primary leading-relaxed">Evening Wind-down</h3>
            <p className="text-[10px] text-ink-secondary leading-relaxed">Target sleep: {sleepWindow}</p>
          </div>
        </div>
        {eveningCheckInDone && (
          <div className="flex items-center gap-1.5 bg-canvas px-2.5 py-1 rounded-full text-[9px] font-semibold text-accent-teal select-none">
            <Check className="w-3 h-3" /> Closed
          </div>
        )}
      </div>

      <div className="mt-4">
        {eveningCheckInDone ? (
          <div className="p-4 rounded-2xl bg-canvas/30 border border-muted/30 flex flex-col gap-1.5 items-center text-center">
            <span className="text-[8px] font-semibold text-accent-teal uppercase tracking-widest leading-relaxed">Day Completed</span>
            <p className="text-xs font-semibold text-ink-primary mt-1 break-words leading-relaxed">
              Your thoughts are parked.
            </p>
            <p className="text-[10px] text-ink-secondary leading-relaxed">
              Nothing carries over to the bed. See you tomorrow.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-5 py-2">
            <span className="text-[10px] text-ink-secondary/70 uppercase tracking-widest font-semibold text-center">
              Stop the thinking. The day is done.
            </span>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleCloseDay}
              className="w-28 h-28 rounded-full bg-[#1C1C1E] border-[6px] border-canvas shadow-[0_4px_15px_-4px_rgba(0,0,0,0.2)] flex flex-col items-center justify-center transition-all hover:bg-[#2C2C2E] hover:scale-105 active:scale-95"
            >
              <Moon className="w-5 h-5 text-accent-teal mb-1.5 opacity-80" />
              <span className="text-[10px] uppercase tracking-widest text-[#F7F6F2] font-bold">Sleep</span>
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
}
