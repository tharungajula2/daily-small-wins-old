'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface GentleReEntryScreenProps {
  onResume: () => void;
}

export default function GentleReEntryScreen({ onResume }: GentleReEntryScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-8 bg-[#1E1B17] text-[#F7F6F2] font-serif select-none"
    >
      <div className="max-w-xs text-center flex flex-col items-center gap-12">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.4 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 300, damping: 30 }}
          className="w-16 h-16 rounded-full border border-[#F7F6F2]/30 flex items-center justify-center text-xl"
        >
          ✦
        </motion.div>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 300, damping: 30 }}
          className="text-lg leading-relaxed text-[#F7F6F2]/90 tracking-wide"
        >
          Welcome back. Your anchors are exactly where you left them.
        </motion.p>

        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, type: 'spring', stiffness: 300, damping: 30 }}
          onClick={onResume}
          className="px-8 py-3 rounded-xl border border-[#F7F6F2]/20 hover:border-[#F7F6F2]/40 text-xs font-semibold uppercase tracking-widest text-[#F7F6F2]/70 hover:text-[#F7F6F2] hover:bg-[#F7F6F2]/5 transition-all duration-300 active:scale-95 focus:outline-none"
        >
          Resume
        </motion.button>
      </div>
    </motion.div>
  );
}
