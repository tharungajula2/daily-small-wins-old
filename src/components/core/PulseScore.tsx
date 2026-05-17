'use client';

import { motion, useAnimation, useInView } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

export default function PulseScore({ score }: { score: number }) {
  const [displayScore, setDisplayScore] = useState(0);
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true });

  // Determine color based on score thresholds
  const getColor = (s: number) => {
    if (s < 40) return '#C0564A'; // Red (<40)
    if (s < 80) return '#C8923A'; // Amber (40-79)
    return '#2A7F7F';             // Green (80+)
  };

  const color = getColor(score);

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const end = score;
      if (start === end) return;

      const duration = 800; // 800ms animation
      const incrementTime = Math.abs(Math.floor(duration / end));

      const timer = setInterval(() => {
        start += 1;
        setDisplayScore(start);
        if (start === end) clearInterval(timer);
      }, incrementTime);

      return () => clearInterval(timer);
    }
  }, [score, isInView]);

  return (
    <div ref={containerRef} className="flex flex-col items-center justify-center my-8">
      <div className="relative w-48 h-48 flex items-center justify-center">
        {/* Background Ring */}
        <svg className="absolute inset-0 w-full h-full transform -rotate-90">
          <circle
            cx="96"
            cy="96"
            r="88"
            fill="transparent"
            stroke="#EEEDE8" // muted
            strokeWidth="12"
          />
          {/* Animated Progress Ring */}
          <motion.circle
            cx="96"
            cy="96"
            r="88"
            fill="transparent"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            initial={{ strokeDasharray: "0 1000" }}
            animate={isInView ? { strokeDasharray: `${(score / 100) * (2 * Math.PI * 88)} 1000` } : {}}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </svg>

        {/* Inner Content */}
        <div className="flex flex-col items-center z-10">
          <motion.span 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-5xl font-mono font-semibold"
            style={{ color: color }}
          >
            {displayScore}
          </motion.span>
          <span className="text-ink-secondary text-xs uppercase tracking-widest mt-2">
            Daily Pulse
          </span>
        </div>
      </div>

      {/* Weekly Day Tracker */}
      <div className="flex gap-5 mt-6 justify-center w-full">
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

