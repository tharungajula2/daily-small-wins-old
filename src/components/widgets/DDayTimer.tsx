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
    <div className="w-full relative rounded-2xl overflow-hidden bg-surface border border-muted/80 shadow-sm p-5 transition-all mb-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-accent-teal" />
          <span className="text-[10px] uppercase tracking-widest font-semibold text-ink-secondary">
            D-Day Target
          </span>
        </div>
      </div>

      <div className="flex flex-col items-center mt-2">
        <h3 className="text-sm font-semibold tracking-wider text-ink-primary mb-5 uppercase text-center w-full italic">
          Jan 1, 2027
        </h3>
        
        <div className="flex items-center justify-center gap-4 w-full">
          <div className="flex flex-col items-center flex-1">
            <span className="text-3xl font-bold text-ink-primary tabular-nums tracking-tight">
              {timeLeft.days.toString().padStart(2, '0')}
            </span>
            <span className="text-[9px] uppercase tracking-widest text-ink-tertiary mt-1 font-semibold">Days</span>
          </div>
          
          <div className="w-px h-8 bg-muted/50"></div>
          
          <div className="flex flex-col items-center flex-1">
            <span className="text-3xl font-bold text-ink-primary tabular-nums tracking-tight">
              {timeLeft.hours.toString().padStart(2, '0')}
            </span>
            <span className="text-[9px] uppercase tracking-widest text-ink-tertiary mt-1 font-semibold">Hours</span>
          </div>
          
          <div className="w-px h-8 bg-muted/50"></div>
          
          <div className="flex flex-col items-center flex-1">
            <span className="text-3xl font-bold text-ink-primary tabular-nums tracking-tight">
              {timeLeft.minutes.toString().padStart(2, '0')}
            </span>
            <span className="text-[9px] uppercase tracking-widest text-ink-tertiary mt-1 font-semibold">Mins</span>
          </div>
        </div>

        <div className="mt-5 bg-accent-teal/10 px-3 py-1.5 rounded-full flex items-center gap-1.5">
          <Clock className="w-3 h-3 text-accent-teal" />
          <span className="text-[10px] uppercase tracking-widest font-bold text-accent-teal">
            {timeLeft.seconds.toString().padStart(2, '0')}s remaining
          </span>
        </div>
      </div>
    </div>
  );
}
