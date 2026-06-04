'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRitualStore } from '@/store/useRitualStore';
import { Sparkles, X, Sunrise } from 'lucide-react';

export default function VisionPrimer() {
  const { visionText, isVisionEnabled } = useRitualStore();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isMorningTime, setIsMorningTime] = useState(false);

  useEffect(() => {
    // Determine if it is within the 06:00 - 10:00 local hours morning block
    const checkTime = () => {
      const hours = new Date().getHours();
      setIsMorningTime(hours >= 6 && hours < 10);
    };

    checkTime();
    // Re-verify time alignment every minute
    const interval = setInterval(checkTime, 60000);
    return () => clearInterval(interval);
  }, []);

  if (!isVisionEnabled || isDismissed || !isMorningTime) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="w-full relative rounded-2xl overflow-hidden bg-[#1C1C1E] border border-[#2C2C2E] shadow-lg mb-6 group transition-all"
      >
        {/* Soothing morning gradient background (the optional pinned backdrop) */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#1A3636] via-[#1C1C1E] to-[#2E2218] opacity-80" />

        {/* Sunrise glowing radial orb */}
        <div className="absolute -left-12 -top-12 w-40 h-40 rounded-full bg-[#2A7F7F]/10 blur-3xl pointer-events-none" />

        <div className="relative p-5 flex flex-col gap-4 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sunrise className="w-4 h-4 text-accent-teal" />
              <span className="text-[10px] uppercase tracking-widest font-semibold text-accent-teal">
                Morning Intention
              </span>
            </div>
            <button 
              onClick={() => setIsDismissed(true)}
              className="w-6 h-6 flex items-center justify-center rounded-full bg-[#2C2C2E] hover:bg-[#3A3A3C] transition-all"
              title="Dismiss for this session"
            >
              <X className="w-3.5 h-3.5 text-ink-secondary" />
            </button>
          </div>

          <div className="flex flex-col gap-1.5 py-1">
            <span className="text-[9px] uppercase tracking-widest text-ink-secondary font-semibold">
              Today's Focus
            </span>
            <p className="text-sm font-semibold text-[#F7F6F2] leading-relaxed italic pr-4">
              &ldquo;{visionText || 'Focus purely on what expands your power and clarity today.'}&rdquo;
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-[9px] text-[#2A7F7F]/90 font-semibold select-none">
            <Sparkles className="w-3 h-3" />
            Begin your day with clarity and aligned focus.
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
