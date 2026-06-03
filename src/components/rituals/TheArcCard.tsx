'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { useRitualStore } from '@/store/useRitualStore';
import { Moon, Sun, Shield, Check, ChevronDown, ChevronUp } from 'lucide-react';

export default function TheArcCard() {
  const {
    wakeWindow,
    sleepWindow,
    feetOnFloorLogged,
    wakeTime,
    eveningCheckInDone,
    winOfTheDay,
    parkingLotNotes,
    completeEveningCheckIn
  } = useRitualStore();

  const [isExpanded, setIsExpanded] = useState(false);
  const [win, setWin] = useState('');
  const [parkingLot, setParkingLot] = useState('');

  const handleCloseDay = async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (e) {
      // web fallback
    }
    await completeEveningCheckIn(win, parkingLot);
    setIsExpanded(false);
  };

  return (
    <div className="w-full bg-surface rounded-3xl p-6 border border-muted/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-[0_6px_24px_-4px_rgba(0,0,0,0.08)] transition-all">
      {/* Card Header */}
      <div className="flex items-center justify-between pb-3 border-b border-muted/40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-accent-teal/5 flex items-center justify-center text-accent-teal">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-ink-primary leading-relaxed">The Arc</h3>
            <p className="text-[10px] text-ink-secondary leading-relaxed">Keystone Anchor • Permanent</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-canvas px-2.5 py-1 rounded-full text-[9px] font-semibold text-accent-teal select-none">
          <Check className="w-3 h-3" /> Kept
        </div>
      </div>

      {/* Grid of Wake/Sleep Settings & Statuses */}
      <div className="grid grid-cols-2 gap-4 pt-4 text-left">
        {/* Morning Tap */}
        <div className="flex flex-col gap-2 p-4 rounded-2xl bg-canvas/40 border border-muted/30 min-w-0">
          <div className="flex items-center gap-1 text-ink-secondary">
            <Sun className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[10px] font-semibold uppercase tracking-wider">Morning Tap</span>
          </div>
          <span className="text-xs font-semibold text-ink-primary break-words leading-relaxed">
            {feetOnFloorLogged ? `Checked in at ${wakeTime}` : 'Tap on waking'}
          </span>
          <span className="text-[9px] text-ink-secondary leading-relaxed break-words">
            Target wake: {wakeWindow}
          </span>
        </div>

        {/* Night Wind-down */}
        <div className="flex flex-col gap-2 p-4 rounded-2xl bg-canvas/40 border border-muted/30 min-w-0">
          <div className="flex items-center gap-1 text-ink-secondary">
            <Moon className="w-3.5 h-3.5 text-indigo-500" />
            <span className="text-[10px] font-semibold uppercase tracking-wider">Sleep Window</span>
          </div>
          <span className="text-xs font-semibold text-ink-primary break-words leading-relaxed">
            Bounded opportunity
          </span>
          <span className="text-[9px] text-ink-secondary leading-relaxed break-words">
            Sleep target: {sleepWindow}
          </span>
        </div>
      </div>

      {/* Evening wind-down control */}
      <div className="mt-4 border-t border-muted/30 pt-3">
        {eveningCheckInDone ? (
          <div className="p-4 rounded-2xl bg-canvas/30 border border-muted/30 flex flex-col gap-1.5">
            <span className="text-[8px] font-semibold text-accent-teal uppercase tracking-widest leading-relaxed">Evening Closed</span>
            {winOfTheDay && (
              <p className="text-xs font-semibold text-ink-primary mt-1 break-words leading-relaxed">
                Win: "{winOfTheDay}"
              </p>
            )}
            {parkingLotNotes && (
              <p className="text-[10px] text-ink-secondary leading-relaxed break-words">
                Parked: {parkingLotNotes}
              </p>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {!isExpanded ? (
              <button
                onClick={() => setIsExpanded(true)}
                className="w-full py-2.5 rounded-xl border border-muted hover:border-ink-secondary/30 text-[11px] font-semibold uppercase tracking-wider text-ink-secondary hover:text-ink-primary bg-canvas/20 hover:bg-canvas/50 transition-all flex items-center justify-center gap-1.5 active:scale-98"
              >
                Begin Evening Wind-down <ChevronDown className="w-3.5 h-3.5" />
              </button>
            ) : (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="flex flex-col gap-4 p-4 bg-canvas/30 rounded-2xl border border-muted/50 text-left"
              >
                <div className="flex items-center justify-between pb-1.5 border-b border-muted/40">
                  <span className="text-[10px] font-semibold text-ink-primary uppercase tracking-wider">Close the Day</span>
                  <button 
                    onClick={() => setIsExpanded(false)}
                    className="text-ink-secondary hover:text-ink-primary"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                </div>

                {/* Wind-down Input Fields */}
                <div className="flex flex-col gap-3">
                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-ink-secondary mb-1.5 block leading-relaxed">
                      Park tomorrow's thoughts (Optional)
                    </label>
                    <input
                      type="text"
                      value={parkingLot}
                      onChange={(e) => setParkingLot(e.target.value)}
                      placeholder="Clear your mind..."
                      className="w-full bg-surface border border-muted rounded-xl px-4 py-2.5 text-xs text-ink-primary placeholder:text-ink-tertiary focus:outline-none focus:border-accent-teal transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-ink-secondary mb-1.5 block leading-relaxed">
                      One win today (Optional)
                    </label>
                    <input
                      type="text"
                      value={win}
                      onChange={(e) => setWin(e.target.value)}
                      placeholder="What went right?"
                      className="w-full bg-surface border border-muted rounded-xl px-4 py-2.5 text-xs text-ink-primary placeholder:text-ink-tertiary focus:outline-none focus:border-accent-teal transition-colors"
                    />
                  </div>
                </div>

                <button
                  onClick={handleCloseDay}
                  className="w-full py-2.5 rounded-xl bg-accent-teal text-white hover:bg-accent-teal/95 font-semibold text-xs uppercase tracking-wider shadow-sm transition-all active:scale-98"
                >
                  Close the Day
                </button>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
