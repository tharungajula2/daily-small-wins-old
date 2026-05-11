'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { useRitualStore } from '@/store/useRitualStore';

export default function MovementLog() {
  const { dailyMovementNote, logMovement } = useRitualStore();
  const [inputValue, setInputValue] = useState(dailyMovementNote);
  const [isEditing, setIsEditing] = useState(!dailyMovementNote);

  const handleSave = async () => {
    if (!inputValue.trim()) return;
    try { await Haptics.impact({ style: ImpactStyle.Medium }); } catch (e) {}
    logMovement(inputValue.trim());
    setIsEditing(false);
  };

  return (
    <div className="w-full p-5 mt-6 rounded-2xl bg-surface border border-muted shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-ink-secondary text-xs uppercase tracking-widest ml-1">
          Martial Arts & Movement
        </h3>
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} className="text-xs text-ink-tertiary hover:text-accent-teal">
            Edit
          </button>
        )}
      </div>

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
  );
}
