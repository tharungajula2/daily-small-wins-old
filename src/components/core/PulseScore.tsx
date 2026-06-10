'use client';

import { motion, useInView } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

interface PulseScoreProps {
  completedCount: number;
  totalCount: number;
}

export default function PulseScore({ completedCount, totalCount }: PulseScoreProps) {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true });

  const pct = totalCount > 0 ? completedCount / totalCount : 0;
  const score = Math.round(pct * 100);
  const [displayScore, setDisplayScore] = useState(0);

  const isFullyCompleted = completedCount === totalCount && totalCount > 0;
  const [wasFullyCompleted, setWasFullyCompleted] = useState(false);

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const end = score;
      if (start === end) {
        setDisplayScore(end);
        return;
      }

      const duration = 800; // 800ms animation
      const incrementTime = Math.max(5, Math.abs(Math.floor(duration / (end || 1))));

      const timer = setInterval(() => {
        start += 1;
        if (start >= end) {
          setDisplayScore(end);
          clearInterval(timer);
        } else {
          setDisplayScore(start);
        }
      }, incrementTime);

      return () => clearInterval(timer);
    }
  }, [score, isInView]);

  useEffect(() => {
    if (isFullyCompleted && !wasFullyCompleted) {
      const playHaptic = async () => {
        try {
          await Haptics.impact({ style: ImpactStyle.Light });
        } catch (e) {
          if (typeof window !== 'undefined' && 'vibrate' in navigator) {
            navigator.vibrate(10);
          }
        }
      };
      playHaptic();
      setWasFullyCompleted(true);
    } else if (!isFullyCompleted) {
      setWasFullyCompleted(false);
    }
  }, [isFullyCompleted, wasFullyCompleted]);

  // Seam-and-arc Ring dimensions
  // Inside w-48 h-48 (192px), let's use radius r=75, center (96, 96)
  const r = 75;
  const circ = 2 * Math.PI * r; // ~471.24
  const gapPct = 0.15; // 15% gap at the bottom
  const drawableLength = circ * (1 - gapPct); // ~400.55
  const gapLength = circ * gapPct; // ~70.69

  // Rotation: standard starting angle is 0 (3 o'clock). 
  // We want the gap centered at the bottom (270 degrees in SVG rotation, or 90 degrees).
  // 90 degrees plus half the gap percentage in degrees (15% gap = 54 degrees -> half is 27 degrees).
  // So rotation angle = 90 + 27 = 117 degrees.
  const rotationAngle = 117;

  const filledLength = pct * drawableLength;

  // Simple state description based on completions
  const getStatusInfo = () => {
    if (completedCount === totalCount) return { title: 'Arc Complete', color: '#2A7F7F', desc: 'The daily foundation is set.' };
    if (completedCount > 0) return { title: 'Steady', color: '#2A7F7F', desc: `${completedCount} of ${totalCount} phases done` };
    return { title: 'Rest', color: '#85929E', desc: 'Awaiting the morning.' };
  };

  const statusInfo = getStatusInfo();

  return (
    <div ref={containerRef} className="flex flex-col items-center justify-center my-6">
      <div className="relative w-48 h-48 flex items-center justify-center">
        {/* Seam-and-Arc Progress Ring */}
        <motion.svg 
          className="absolute inset-0 w-full h-full select-none" 
          style={{ transformOrigin: '96px 96px' }}
          animate={{
            rotate: rotationAngle,
            scale: isFullyCompleted ? 1.04 : 1
          }}
          transition={{
            type: 'spring',
            stiffness: 80,
            damping: 25
          }}
        >
          {/* Background Track with Seam */}
          <circle
            cx="96"
            cy="96"
            r={r}
            fill="transparent"
            stroke="rgba(0, 0, 0, 0.05)"
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={`${drawableLength} ${circ}`}
          />
          {/* Foreground Active Arc */}
          <motion.circle
            cx="96"
            cy="96"
            r={r}
            fill="transparent"
            stroke="#2A7F7F" // bg-accent-teal
            strokeWidth="7"
            strokeLinecap="round"
            initial={{ strokeDasharray: `0 ${circ}` }}
            animate={isInView ? { strokeDasharray: `${filledLength} ${circ}` } : {}}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        </motion.svg>

        {/* Inner Content - Mathematically Centered */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none z-10 w-full h-full">
          <div className="flex flex-col items-center justify-center max-w-[120px] px-2 overflow-hidden">
            <span className="text-2xl font-mono font-semibold leading-none tracking-tight text-ink-primary">
              {completedCount}/{totalCount}
            </span>
            <span className="text-ink-secondary text-[10px] uppercase tracking-[0.2em] mt-1.5 font-bold leading-none">
              Daily Arc
            </span>
            {completedCount === totalCount && totalCount > 0 && (
              <span className="text-xs mt-1 text-accent-teal font-semibold leading-none animate-pulse">
                Kept today
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Dynamic Status Badge */}
      <div className="mt-4 flex items-center justify-center">
        <span 
          style={{ 
            color: statusInfo.color, 
            borderColor: `${statusInfo.color}33`, 
            backgroundColor: `${statusInfo.color}0a` 
          }}
          className="px-3 py-1 rounded-full border text-xs font-semibold uppercase tracking-wider select-none animate-fade-in"
        >
          {statusInfo.title}
        </span>
      </div>

      {/* Weekly Day Tracker */}
      <div className="flex gap-5 mt-5 justify-center w-full">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => {
          const todayIndex = new Date().getDay();
          const activeIndex = todayIndex === 0 ? 6 : todayIndex - 1;
          const isActive = index === activeIndex;
          return (
            <div key={index} className="flex flex-col items-center gap-1.5 w-6">
              {/* Active Day Indicator Line */}
              <div className="h-1 w-4 flex justify-center">
                <span className={`h-1 w-full rounded-full transition-all duration-300 ${isActive ? 'bg-accent-teal shadow-[0_0_8px_rgba(42,127,127,0.5)]' : 'bg-transparent'}`} />
              </div>
              {/* Day Letter */}
              <span className={`text-xs font-semibold select-none tracking-tight transition-all duration-300 ${isActive ? 'text-accent-teal font-semibold scale-110' : 'text-ink-secondary/40'}`}>
                {day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
