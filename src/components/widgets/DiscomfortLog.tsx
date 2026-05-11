'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { useRitualStore } from '@/store/useRitualStore';

export default function DiscomfortLog() {
  const { dailyDiscomfortLog, logDiscomfort } = useRitualStore();
  const [inputValue, setInputValue] = useState(dailyDiscomfortLog);
  const [isEditing, setIsEditing] = useState(!dailyDiscomfortLog);

  const handleSave = async () => {
    if (!inputValue.trim()) return;
    try { await Haptics.impact({ style: ImpactStyle.Medium }); } catch (e) {}
    logDiscomfort(inputValue.trim());
    setIsEditing(false);
  };

  return (
    <div className="w-full p-5 mt-6 rounded-2xl bg-surface border border-muted shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-ink-secondary text-xs uppercase tracking-widest ml-1">
          Voluntary Discomfort
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
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="What was one hard thing you did today?"
              className="w-full bg-canvas border border-muted rounded-xl p-3 text-sm text-ink-primary placeholder:text-ink-tertiary focus:outline-none focus:border-accent-teal transition-colors min-h-[80px] mb-3"
            />
            <button
              onClick={handleSave}
              disabled={!inputValue.trim()}
              className={`w-full py-2.5 rounded-lg text-sm font-medium transition-all ${inputValue.trim() ? 'bg-ink-primary text-surface' : 'bg-muted text-ink-tertiary'}`}
            >
              Log Discomfort
            </button>
          </motion.div>
        ) : (
          <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4 bg-canvas rounded-xl border border-muted/50">
            <p className="text-sm text-ink-primary italic">"{dailyDiscomfortLog}"</p>
            <div className="mt-3 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-accent-amber animate-pulse" />
              <span className="text-[10px] text-ink-tertiary uppercase tracking-widest">Resilience +1</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
