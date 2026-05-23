'use client';

import { motion, useInView } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

export default function PulseScore({ 
  score, 
  morningScore = 0, 
  eveningScore = 0, 
  engineScore = 0 
}: { 
  score: number; 
  morningScore?: number; 
  eveningScore?: number; 
  engineScore?: number; 
}) {
  const [displayScore, setDisplayScore] = useState(0);
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true });

  // 1. Asymmetric grade thresholds
  const getGradeInfo = (s: number) => {
    if (s >= 90) return { title: 'Peak Day', color: '#D4AF37', desc: 'Optimal synchrony.' };
    if (s >= 75) return { title: 'Strong Day', color: '#A0A0A0', desc: 'Excellent alignment.' };
    if (s >= 55) return { title: 'Steady Day', color: '#2A7F7F', desc: 'Solid consistency.' };
    if (s >= 30) return { title: 'Light Day', color: '#52BE80', desc: 'Anchors that landed today' };
    return { title: 'Rest Day', color: '#85929E', desc: 'Tomorrow is a new day.' };
  };

  const gradeInfo = getGradeInfo(score);

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

  // Circumferences for concentric rings
  const circOuter = 2 * Math.PI * 84;
  const circMiddle = 2 * Math.PI * 68;
  const circInner = 2 * Math.PI * 52;

  // Percentages for check-ins
  const enginePct = engineScore / 70; // Engine is out of 70 max
  const eveningPct = eveningScore / 20; // Evening is out of 20 max
  const morningPct = morningScore / 10; // Morning is out of 10 max

  return (
    <div ref={containerRef} className="flex flex-col items-center justify-center my-6">
      <div className="relative w-48 h-48 flex items-center justify-center">
        {/* Concentric Progress Rings */}
        <svg className="absolute inset-0 w-full h-full transform -rotate-90 select-none">
          {/* 1. OUTER RING: Daily Anchor Engine (70%) */}
          <circle
            cx="96"
            cy="96"
            r="84"
            fill="transparent"
            stroke="var(--color-muted)"
            strokeWidth="8"
          />
          <motion.circle
            cx="96"
            cy="96"
            r="84"
            fill="transparent"
            stroke={gradeInfo.color} // Dynamic Asymmetric Grade Accent
            strokeWidth="8"
            strokeLinecap="round"
            initial={{ strokeDasharray: `0 ${circOuter}` }}
            animate={isInView ? { strokeDasharray: `${enginePct * circOuter} ${circOuter}` } : {}}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />

          {/* 2. MIDDLE RING: Evening Check-In (20%) */}
          <circle
            cx="96"
            cy="96"
            r="68"
            fill="transparent"
            stroke="var(--color-muted)"
            strokeWidth="8"
          />
          <motion.circle
            cx="96"
            cy="96"
            r="68"
            fill="transparent"
            stroke="#6A5ACD" // Evening Slate Blue
            strokeWidth="8"
            strokeLinecap="round"
            initial={{ strokeDasharray: `0 ${circMiddle}` }}
            animate={isInView ? { strokeDasharray: `${eveningPct * circMiddle} ${circMiddle}` } : {}}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
          />

          {/* 3. INNER RING: Morning Check-In (10%) */}
          <circle
            cx="96"
            cy="96"
            r="52"
            fill="transparent"
            stroke="var(--color-muted)"
            strokeWidth="8"
          />

          <motion.circle
            cx="96"
            cy="96"
            r="52"
            fill="transparent"
            stroke="#D97706" // Morning Amber
            strokeWidth="8"
            strokeLinecap="round"
            initial={{ strokeDasharray: `0 ${circInner}` }}
            animate={isInView ? { strokeDasharray: `${morningPct * circInner} ${circInner}` } : {}}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          />
        </svg>

        {/* Inner Content - Supportively Framed & Mathematically Centered */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none z-10 w-full h-full">
          <div className="flex flex-col items-center justify-center max-w-[76px] px-1 overflow-hidden">
            {score >= 55 ? (
              <>
                <motion.span 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-3xl font-mono font-bold leading-none tracking-tight"
                  style={{ color: gradeInfo.color }}
                >
                  {displayScore}
                </motion.span>
                <span className="text-ink-secondary text-[8px] uppercase tracking-widest mt-1 font-semibold leading-none">
                  Pulse
                </span>
              </>
            ) : score >= 30 ? (
              <>
                <span className="text-xl leading-none mb-0.5">🌱</span>
                <span className="text-ink-primary font-bold text-[9px] uppercase tracking-wide leading-none">
                  Light
                </span>
                <span className="text-ink-secondary text-[7.5px] leading-snug mt-1 font-medium text-center">
                  {gradeInfo.desc}
                </span>
              </>
            ) : (
              <>
                <span className="text-xl leading-none mb-0.5">🧘</span>
                <span className="text-ink-primary font-bold text-[9px] uppercase tracking-wide leading-none">
                  Rest
                </span>
                <span className="text-ink-secondary text-[7.5px] leading-snug mt-1 font-medium text-center">
                  {gradeInfo.desc}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Dynamic Grade Badge */}
      <div className="mt-4 flex items-center justify-center">
        <span 
          style={{ 
            color: gradeInfo.color, 
            borderColor: `${gradeInfo.color}33`, 
            backgroundColor: `${gradeInfo.color}0a` 
          }}
          className="px-3 py-1 rounded-full border text-[9px] font-bold uppercase tracking-wider select-none animate-fade-in"
        >
          {gradeInfo.title}
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
              <span className={`text-xs font-semibold select-none tracking-tight transition-all duration-300 ${isActive ? 'text-accent-teal font-bold scale-110' : 'text-ink-secondary/40'}`}>
                {day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
