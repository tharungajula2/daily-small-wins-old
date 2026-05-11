'use client';

import { motion, useAnimation, useInView } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

export default function PulseScore({ score }: { score: number }) {
  const [displayScore, setDisplayScore] = useState(0);
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true });

  // Determine color based on score thresholds
  const getColor = (s: number) => {
    if (s < 40) return '#C0564A'; // pulse.low
    if (s < 70) return '#C8923A'; // pulse.mid
    return '#3D7A55';             // pulse.high
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
    </div>
  );
}
