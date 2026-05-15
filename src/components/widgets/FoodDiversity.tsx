'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { useRitualStore } from '@/store/useRitualStore';

export default function FoodDiversity() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { weeklyPlantCount, incrementPlantCount, hasSeenFoodTooltip, dismissTooltip } = useRitualStore();
  const progress = (weeklyPlantCount / 30) * 100;

  const handleAdd = async () => {
    if (weeklyPlantCount >= 30) return;
    try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (e) {}
    incrementPlantCount();
  };

  return (
    <div className="w-full p-5 rounded-2xl bg-surface border border-muted shadow-sm">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between"
      >
        <h3 className="text-ink-primary text-xs font-semibold tracking-widest uppercase ml-1">
          Food Diversity (Weekly)
        </h3>
        <div className="flex items-center gap-3">
          <span className="text-xs text-ink-primary font-mono bg-canvas px-2 py-1 rounded-md border border-muted">
            {weeklyPlantCount} / 30
          </span>
          <span className="text-ink-tertiary text-lg font-light leading-none">{isExpanded ? '−' : '+'}</span>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-4">
              {!hasSeenFoodTooltip && (
                <div className="mb-4 p-3 bg-accent-teal/5 border border-accent-teal/10 rounded-lg flex items-start justify-between gap-3">
                  <p className="text-xs text-ink-secondary leading-relaxed">
                    Eating 30 different plants per week dramatically improves your gut microbiome. Each unique fruit, vegetable, grain, spice, or seed counts as +1.
                  </p>
                  <button 
                    onClick={() => dismissTooltip('hasSeenFoodTooltip')}
                    className="text-ink-tertiary hover:text-ink-primary p-1"
                  >
                    ✕
                  </button>
                </div>
              )}
              {/* Progress Bar */}
              <div className="h-2 w-full bg-canvas rounded-full overflow-hidden mb-4 border border-muted/50">
                <motion.div 
                  className="h-full bg-success"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>

              <button
                onClick={handleAdd}
                disabled={weeklyPlantCount >= 30}
                className={`w-full py-2.5 rounded-lg text-sm font-medium transition-all ${weeklyPlantCount < 30 ? 'bg-canvas border border-muted text-ink-primary hover:border-success/50' : 'bg-muted text-ink-tertiary'}`}
              >
                +1 Plant Source
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
