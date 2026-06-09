'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRitualStore } from '@/store/useRitualStore';
import { Target, Clock, Edit2 } from 'lucide-react';

export default function DDayTimer() {
  const { dDayTargetDate, dDayTitle, setDDayTargetDate, setDDayTitle } = useRitualStore();
  
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editDate, setEditDate] = useState(dDayTargetDate || '');
  const [editTitle, setEditTitle] = useState(dDayTitle || '');

  useEffect(() => {
    if (!dDayTargetDate) return;

    const targetTime = new Date(dDayTargetDate).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = targetTime - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000)
      });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [dDayTargetDate]);

  const handleSave = () => {
    setDDayTargetDate(editDate);
    setDDayTitle(editTitle);
    setIsEditing(false);
  };

  if (!timeLeft) return null;

  return (
    <div className="w-full relative rounded-2xl overflow-hidden bg-surface border border-muted/80 shadow-sm p-5 transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-accent-teal" />
          <span className="text-[10px] uppercase tracking-widest font-semibold text-ink-secondary">
            D-Day Target
          </span>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-canvas transition-all"
        >
          <Edit2 className="w-3 h-3 text-ink-tertiary hover:text-ink-primary" />
        </button>
      </div>

      <AnimatePresence mode="wait">
        {isEditing ? (
          <motion.div
            key="editing"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-col gap-3"
          >
            <div>
              <label className="text-[9px] uppercase tracking-widest font-semibold text-ink-tertiary mb-1 block">Goal Name</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="e.g. Jan 1, 2026"
                className="w-full bg-canvas border border-muted rounded-lg p-2 text-xs text-ink-primary focus:outline-none focus:border-accent-teal transition-colors"
              />
            </div>
            <div>
              <label className="text-[9px] uppercase tracking-widest font-semibold text-ink-tertiary mb-1 block">Target Date</label>
              <input
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                className="w-full bg-canvas border border-muted rounded-lg p-2 text-xs text-ink-primary focus:outline-none focus:border-accent-teal transition-colors"
              />
            </div>
            <button
              onClick={handleSave}
              className="mt-1 w-full bg-ink-primary text-surface py-2 rounded-lg text-[10px] uppercase tracking-widest font-semibold active:scale-95 transition-all"
            >
              Save Target
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="display"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="flex flex-col items-center justify-center py-2"
          >
            <h3 className="text-sm font-semibold text-ink-primary mb-4 italic text-center">
              {dDayTitle || 'Your Next Milestone'}
            </h3>
            
            <div className="flex items-center justify-center gap-4 w-full">
              <div className="flex flex-col items-center flex-1">
                <span className="text-3xl font-bold text-ink-primary tabular-nums tracking-tight">
                  {timeLeft.days.toString().padStart(2, '0')}
                </span>
                <span className="text-[9px] uppercase tracking-widest text-ink-tertiary mt-1 font-semibold">Days</span>
              </div>
              
              <div className="w-px h-10 bg-muted/50" />
              
              <div className="flex flex-col items-center flex-1">
                <span className="text-3xl font-bold text-ink-primary tabular-nums tracking-tight">
                  {timeLeft.hours.toString().padStart(2, '0')}
                </span>
                <span className="text-[9px] uppercase tracking-widest text-ink-tertiary mt-1 font-semibold">Hours</span>
              </div>
              
              <div className="w-px h-10 bg-muted/50" />
              
              <div className="flex flex-col items-center flex-1">
                <span className="text-3xl font-bold text-ink-primary tabular-nums tracking-tight">
                  {timeLeft.minutes.toString().padStart(2, '0')}
                </span>
                <span className="text-[9px] uppercase tracking-widest text-ink-tertiary mt-1 font-semibold">Mins</span>
              </div>
            </div>
            
            <div className="flex items-center gap-1.5 mt-6 px-3 py-1 bg-accent-teal/[0.05] rounded-full">
              <Clock className="w-3 h-3 text-accent-teal" />
              <span className="text-[10px] font-semibold text-accent-teal uppercase tracking-widest">
                {timeLeft.seconds.toString().padStart(2, '0')}s remaining
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
