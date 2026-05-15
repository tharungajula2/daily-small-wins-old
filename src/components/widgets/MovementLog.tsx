'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { useRitualStore } from '@/store/useRitualStore';

export default function MovementLog() {
  const { dailyMovementNote, logMovement } = useRitualStore();
  const [inputValue, setInputValue] = useState(dailyMovementNote);
  const [isEditing, setIsEditing] = useState(!dailyMovementNote);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSave = async () => {
    if (!inputValue.trim()) return;
    try { await Haptics.impact({ style: ImpactStyle.Medium }); } catch (e) {}
    logMovement(inputValue.trim());
    setIsEditing(false);
    setIsExpanded(false);
  };

  return (
    <div className="w-full p-5 rounded-2xl bg-surface border border-muted shadow-sm">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between"
      >
        <h3 className="text-ink-primary text-xs font-semibold tracking-widest uppercase ml-1">
          Martial Arts & Movement
        </h3>
        <div className="flex items-center gap-3">
          {isExpanded && !isEditing && (
            <span 
              onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
              className="text-xs text-ink-tertiary hover:text-accent-teal"
            >
              Edit
            </span>
          )}
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
              <AnimatePresence mode="wait">
                {isEditing ? (
                  <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="e.g., Roundhouse kicks, 20m Zone 2"
                      className="w-full bg-canvas border border-muted rounded-xl p-3 text-sm text-ink-primary focus:outline-none focus:border-accent-teal transition-colors mb-3"
                    />
                    <button
                      onClick={handleSave}
                      disabled={!inputValue.trim()}
                      className={`w-full py-2.5 rounded-lg text-sm font-medium transition-all ${inputValue.trim() ? 'bg-ink-primary text-surface' : 'bg-muted text-ink-tertiary'}`}
                    >
                      Log Session
                    </button>
                  </motion.div>
                ) : (
                  <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4 bg-canvas rounded-xl border border-muted/50 flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center shrink-0">
                       <span className="text-success text-sm">✓</span>
                     </div>
                     <p className="text-sm text-ink-primary font-medium">{dailyMovementNote}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
