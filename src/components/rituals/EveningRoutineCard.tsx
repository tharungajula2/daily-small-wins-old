'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
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
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (e) {}
    // We send empty strings because Win and Park are removed
    await completeEveningCheckIn('', '');
  };

  return (
    <div className="w-full bg-surface rounded-3xl p-6 border border-muted/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.02)] transition-all">
      <div className="flex items-center justify-between pb-3 border-b border-muted/40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-accent-teal/5 flex items-center justify-center text-indigo-500">
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
          <button
            onClick={handleCloseDay}
            className="w-full py-4 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-semibold text-xs uppercase tracking-wider shadow-sm transition-all active:scale-98 flex flex-col items-center gap-1 border border-indigo-500/20"
          >
            <span className="text-[10px] opacity-80 uppercase tracking-widest">Stop the thinking. The day is done.</span>
            Let's sleep
          </button>
        )}
      </div>
    </div>
  );
}
