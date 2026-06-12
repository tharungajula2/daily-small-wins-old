'use client';

import { useState, useEffect } from 'react';
import { Target, Clock } from 'lucide-react';

export default function DDayTimer() {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    // Hardcoded D-Day Target: Jan 1, 2027
    const targetTime = new Date('2027-01-01T00:00:00Z').getTime();

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
  }, []);

  if (!timeLeft) return null;

  return (
  return (
    <div className="w-full p-5 mt-4 rounded-2xl bg-canvas border border-muted shadow-sm">
      <div className="flex items-center justify-between mb-3 border-b border-muted/30 pb-3">
        <h3 className="text-ink-secondary text-xs uppercase tracking-widest ml-1 flex items-center gap-2">
          <Target className="w-3.5 h-3.5 text-accent-teal" /> The Horizon
        </h3>
        <span className="text-[10px] uppercase tracking-wider font-semibold text-ink-tertiary">Jan 1, 2027</span>
      </div>

      <div className="flex items-end justify-between px-2 pt-1">
        <div className="flex flex-col">
          <span className="text-4xl font-light text-ink-primary tabular-nums tracking-tighter leading-none">
            {timeLeft.days}
          </span>
          <span className="text-[9px] uppercase tracking-widest text-ink-secondary mt-2 font-bold">Days Away</span>
        </div>
        
        <div className="flex gap-5 mb-0.5">
          <div className="flex flex-col items-end">
            <span className="text-xl font-light text-ink-secondary tabular-nums leading-none">
              {timeLeft.hours.toString().padStart(2, '0')}
            </span>
            <span className="text-[8px] uppercase tracking-widest text-ink-tertiary mt-1.5 font-semibold">Hrs</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-xl font-light text-ink-secondary tabular-nums leading-none">
              {timeLeft.minutes.toString().padStart(2, '0')}
            </span>
            <span className="text-[8px] uppercase tracking-widest text-ink-tertiary mt-1.5 font-semibold">Min</span>
          </div>
        </div>
      </div>
    </div>
  );
}
