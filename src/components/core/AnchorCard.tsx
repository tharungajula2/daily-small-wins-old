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
    toggleAnchor(anchor.id, false);
  };

  const handleBaseline = async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch (e) {
      // web fallback
    }
    toggleAnchor(anchor.id, true);
  };

  return (
    <div
      className={`p-4 rounded-xl border mb-3 transition-colors ${
        anchor.completed 
          ? (anchor.usedBaseline ? 'bg-accent-amber/5 border-accent-amber/20' : 'bg-success/5 border-success/20') 
          : 'bg-canvas border-muted'
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium ${
            anchor.completed 
              ? (anchor.usedBaseline ? 'text-accent-amber' : 'text-success line-through') 
              : 'text-ink-primary'
          }`}>
            {anchor.title}
          </p>
          <p className="text-[10px] uppercase tracking-widest text-ink-tertiary mt-1">
            {anchor.category} {anchor.usedBaseline && '• BASELINE ACHIEVED'}
          </p>
        </div>
        
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleTap}
          className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
            anchor.completed 
              ? (anchor.usedBaseline ? 'bg-accent-amber border-accent-amber' : 'bg-success border-success') 
              : 'border-muted hover:border-accent-teal/50'
          }`}
        >
          {anchor.completed && (
            <motion.span 
              initial={{ scale: 0 }} 
              animate={{ scale: 1 }} 
              className="text-surface text-sm"
            >
              ✓
            </motion.span>
          )}
        </motion.button>
      </div>

      {/* Baseline Dropdown Trigger */}
      {!anchor.completed && anchor.baselineTitle && (
        <div className="mt-3 pt-3 border-t border-muted/50 flex justify-between items-center">
          <span className="text-xs text-ink-tertiary italic">Hard day?</span>
          <button 
            onClick={handleBaseline}
            className="text-xs text-accent-amber hover:text-accent-amber/80 font-medium transition-colors flex items-center gap-1"
          >
            ↳ Drop to Baseline: {anchor.baselineTitle}
          </button>
        </div>
      )}
    </div>
  );
}
