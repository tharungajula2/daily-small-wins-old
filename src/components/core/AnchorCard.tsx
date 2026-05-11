'use client';

import { motion } from 'framer-motion';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Anchor, useRitualStore } from '@/store/useRitualStore';

export default function AnchorCard({ anchor }: { anchor: Anchor }) {
  const toggleAnchor = useRitualStore((state) => state.toggleAnchor);

  const handleTap = async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (e) {
      // web fallback
    }
    toggleAnchor(anchor.id);
  };

  return (
    <motion.button
      onClick={handleTap}
      whileTap={{ scale: 0.98 }}
      className={`w-full flex items-center justify-between p-4 mb-3 rounded-2xl border transition-colors ${
        anchor.completed 
          ? 'bg-canvas border-success/30' 
          : 'bg-surface border-muted shadow-sm hover:shadow-md'
      }`}
    >
      <div className="flex flex-col items-start">
        <span className={`text-sm font-medium transition-colors ${
          anchor.completed ? 'text-success' : 'text-ink-primary'
        }`}>
          {anchor.title}
        </span>
        <span className="text-xs text-ink-tertiary uppercase tracking-widest mt-1">
          {anchor.category}
        </span>
      </div>

      <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
        anchor.completed ? 'bg-success border-success' : 'border-muted'
      }`}>
        {anchor.completed && (
          <motion.span 
            initial={{ scale: 0 }} 
            animate={{ scale: 1 }} 
            className="text-surface text-sm"
          >
            ✓
          </motion.span>
        )}
      </div>
    </motion.button>
  );
}
