'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { useRitualStore } from '@/store/useRitualStore';
import { MORNING_INTENTIONS } from '@/utils/prompts';

export default function VisionPriming() {
  const { visionText, setVisionText, hasSeenVisionTooltip, dismissTooltip } = useRitualStore();
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(visionText);

  const handleSave = async () => {
    if (!inputValue.trim()) return;
    try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (e) {}
    setVisionText(inputValue.trim());
    setIsEditing(false);
  };

  return (
    <div className="w-full p-5 mt-6 rounded-2xl bg-canvas border border-muted shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-ink-secondary text-xs uppercase tracking-widest ml-1">
          Vision Priming — your daily why
        </h3>
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} className="text-xs text-ink-tertiary hover:text-accent-teal transition-colors">
            Edit
          </button>
        )}
      </div>

      {!hasSeenVisionTooltip && (
        <div className="mb-4 p-3 bg-accent-teal/5 border border-accent-teal/10 rounded-lg flex items-start justify-between gap-3">
          <p className="text-xs text-ink-secondary leading-relaxed">
            Read this every morning. It points your day.
          </p>
          <button 
            onClick={() => dismissTooltip('hasSeenVisionTooltip')}
            className="text-ink-tertiary hover:text-ink-primary p-1"
          >
            ✕
          </button>
        </div>
      )}

      <AnimatePresence mode="wait">
        {isEditing ? (
          <motion.div 
            key="edit" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full bg-surface border border-muted rounded-xl p-4 text-sm text-ink-primary focus:outline-none focus:border-accent-teal transition-colors min-h-[100px] mb-3 leading-relaxed"
            />
            {/* Morning Intention Suggestions */}
            <div className="mb-4">
              <span className="block text-[9px] uppercase tracking-widest text-ink-tertiary font-bold mb-1.5 ml-1">
                Suggested Intentions
              </span>
              <div className="flex flex-wrap gap-1.5">
                {MORNING_INTENTIONS.map((intention) => (
                  <button
                    key={intention}
                    type="button"
                    onClick={() => setInputValue(intention)}
                    className="px-2 py-1 text-[10px] bg-canvas border border-muted/80 text-ink-secondary rounded-md hover:border-accent-teal transition-all text-left"
                  >
                    {intention}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={handleSave}
              className="w-full py-2.5 rounded-lg text-sm font-semibold bg-ink-primary text-surface transition-all"
            >
              Lock Vision
            </button>
          </motion.div>

        ) : (
          <motion.div 
            key="view" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <p className="text-base text-ink-primary font-semibold leading-relaxed italic border-l-2 border-accent-teal pl-4 py-1">
              &ldquo;{visionText}&rdquo;
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
