'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Anchor, useRitualStore } from '@/store/useRitualStore';
import { getRandomPrompt } from '@/utils/prompts';

const PILLAR_LABELS: Record<string, string> = {
  nutrition: 'Nutrition',
  movement: 'Movement',
  sleep: 'Sleep',
  stress_mental: 'Stress & Mental Health',
  social: 'Social Connection',
  environment: 'Environment'
};

export default function AnchorCard({ anchor }: { anchor: Anchor }) {
  const toggleAnchor = useRitualStore((state) => state.toggleAnchor);
  const toggleSubItem = useRitualStore((state) => state.toggleSubItem);
  const anchors = useRitualStore((state) => state.anchors);
  
  const [justCompleted, setJustCompleted] = useState(false);
  
  // Drawer / Modal States for Reflection Type
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [reflectionInput, setReflectionInput] = useState('');
  const [currentPrompt, setCurrentPrompt] = useState('');

  // Drawer state for Checklist Stack Type
  const [isStackDrawerOpen, setIsStackDrawerOpen] = useState(false);

  const hasSubItems = anchor.subItems && anchor.subItems.length > 0;
  const subItems = anchor.subItems || [];
  const completedSubItemsCount = subItems.filter(s => s.completed).length;
  const totalSubItemsCount = subItems.length;
  const progressText = `${completedSubItemsCount}/${totalSubItemsCount} Items`;

  const handleTap = async (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }

    if (hasSubItems) {
      setIsStackDrawerOpen(true);
      return;
    }

    if (anchor.type === 'reflection' && !anchor.completed) {
      // Choose appropriate prompt: custom prompt or a deep psychological random prompt
      setCurrentPrompt(anchor.prompt || getRandomPrompt());
      setReflectionInput('');
      setIsDrawerOpen(true);
      return;
    }

    // Otherwise, normal action toggle
    const isCompleting = !anchor.completed;
    const willCompleteAll = isCompleting && anchors.filter(a => a.id !== anchor.id).every(a => a.completed);

    try {
      if (willCompleteAll) {
        await Haptics.impact({ style: ImpactStyle.Medium });
      } else {
        await Haptics.impact({ style: ImpactStyle.Light });
      }
    } catch (e) {
      // web fallback
    }
    
    toggleAnchor(anchor.id, false);

    if (isCompleting) {
      setJustCompleted(true);
      setTimeout(() => setJustCompleted(false), 200);
    }
  };

  const handleSaveReflection = async () => {
    if (!reflectionInput.trim()) return;

    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch (e) {
      // web fallback
    }

    toggleAnchor(anchor.id, false, reflectionInput.trim(), currentPrompt);
    setIsDrawerOpen(false);
    
    setJustCompleted(true);
    setTimeout(() => setJustCompleted(false), 200);
  };

  const handleBaseline = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch (e) {
      // web fallback
    }
    toggleAnchor(anchor.id, true);
  };

  // 1. COMPLETED REFLECTION CARD (Timeline Feed UI)
  if (anchor.type === 'reflection' && anchor.completed) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-5 rounded-2xl bg-accent-teal/[0.02] border-accent-teal/20 shadow-sm flex flex-col gap-3 relative overflow-hidden transition-all duration-300 hover:shadow-md"
      >
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-semibold text-ink-primary leading-snug">
                {anchor.title}
              </h4>
              <span className="bg-accent-teal/10 text-accent-teal text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 select-none">
                <span className="text-[9px]">✓</span> Logged
              </span>
            </div>
            <p className="text-[9px] uppercase tracking-widest text-ink-tertiary mt-0.5 font-medium">
              {PILLAR_LABELS[anchor.pillarId] || anchor.pillarId} • Reflection Logged
            </p>
          </div>
          <button
            onClick={handleTap} // Untoggles it
            className="text-[10px] tracking-wider uppercase font-semibold text-accent-teal hover:text-accent-teal/80 transition-colors ml-4 flex-shrink-0"
          >
            Reset
          </button>
        </div>

        <div className="pl-3 border-l-2 border-accent-teal/40 py-0.5">
          <p className="text-xs text-ink-secondary italic mb-2">
            "{anchor.prompt}"
          </p>
          <p className="text-sm text-ink-primary font-normal leading-relaxed whitespace-pre-wrap">
            {anchor.reflectionText || 'No reflection logged.'}
          </p>
        </div>
      </motion.div>
    );
  }

  // 2. STANDARD ACTION / INCOMPLETE REFLECTION CARD / SUB-STACK CARD
  return (
    <>
      <motion.div
        whileTap={{ scale: 0.98 }}
        onClick={hasSubItems ? (e) => handleTap(e) : undefined}
        animate={
          justCompleted 
            ? { scale: [1, 1.02, 1], backgroundColor: ['rgba(42, 127, 127, 0)', 'rgba(42, 127, 127, 0.1)', 'rgba(42, 127, 127, 0)'] }
            : {}
        }
        transition={{ duration: 0.2 }}
        className={`p-4 rounded-xl border transition-all ${hasSubItems ? 'cursor-pointer active:bg-muted/10' : ''} ${
          anchor.completed 
            ? (anchor.usedBaseline ? 'bg-accent-amber/5 border-accent-amber/20' : 'bg-success/5 border-success/20') 
            : 'bg-surface border-muted hover:border-muted/80'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 pr-4">
            <p className={`text-sm font-medium ${
              anchor.completed 
                ? (anchor.usedBaseline ? 'text-accent-amber' : 'text-success line-through') 
                : 'text-ink-primary'
            }`}>
              {anchor.title}
            </p>
            <p className="text-[10px] uppercase tracking-widest text-ink-tertiary mt-1 font-medium">
              {PILLAR_LABELS[anchor.pillarId] || anchor.pillarId} • {hasSubItems ? `STACK • ${progressText}` : anchor.type} {anchor.usedBaseline && '• BASELINE ACHIEVED'}
            </p>
          </div>
          
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={(e) => handleTap(e)}
            className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
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
      </motion.div>

      {/* Reflection Entry Modal Drawer */}
      <AnimatePresence>
        {isDrawerOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            />

            {/* Content Drawer */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-full max-w-md bg-canvas rounded-t-3xl border-t border-muted shadow-2xl p-6 flex flex-col gap-6 z-10"
            >
              {/* Drag Handle */}
              <div className="w-12 h-1 bg-muted rounded-full self-center -mt-2 mb-2" />

              <div>
                <p className="text-[10px] tracking-widest font-semibold text-accent-teal uppercase">
                  {PILLAR_LABELS[anchor.pillarId] || anchor.pillarId} • REFLECTION
                </p>
                <h3 className="text-lg font-semibold text-ink-primary mt-1">
                  {anchor.title}
                </h3>
              </div>

              {/* Prompt Box */}
              <div className="p-4 rounded-xl bg-surface border border-muted/60">
                <p className="text-xs font-semibold uppercase tracking-widest text-ink-secondary mb-1">
                  Prompt
                </p>
                <p className="text-sm font-medium text-ink-primary italic leading-relaxed">
                  "{currentPrompt}"
                </p>
              </div>

              {/* Text Input */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-ink-tertiary">
                  Your Reflection
                </label>
                <textarea
                  value={reflectionInput}
                  onChange={(e) => setReflectionInput(e.target.value)}
                  placeholder="Capture today's truth..."
                  rows={4}
                  className="w-full p-4 rounded-xl border border-muted bg-surface text-sm text-ink-primary font-normal focus:outline-none focus:border-accent-teal transition-all resize-none leading-relaxed"
                  autoFocus
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex-1 py-3 text-xs uppercase tracking-widest font-semibold border border-muted rounded-xl text-ink-secondary hover:text-ink-primary transition-all active:scale-98"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveReflection}
                  disabled={!reflectionInput.trim()}
                  className={`flex-1 py-3 text-xs uppercase tracking-widest font-semibold rounded-xl text-surface transition-all active:scale-98 ${
                    reflectionInput.trim() 
                      ? 'bg-accent-teal hover:bg-accent-teal/95' 
                      : 'bg-ink-tertiary/20 text-ink-tertiary cursor-not-allowed'
                  }`}
                >
                  Save Entry
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Type C Stack checklist Drawer */}
      <AnimatePresence>
        {isStackDrawerOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsStackDrawerOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            />

            {/* Content Drawer */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-full max-w-md bg-canvas rounded-t-3xl border-t border-muted shadow-2xl p-6 flex flex-col gap-6 z-10 pb-10"
            >
              {/* Drag Handle */}
              <div className="w-12 h-1 bg-muted rounded-full self-center -mt-2 mb-2" />

              <div>
                <p className="text-[10px] tracking-widest font-semibold text-accent-teal uppercase">
                  {PILLAR_LABELS[anchor.pillarId] || anchor.pillarId} • CHECKLIST STACK
                </p>
                <div className="flex items-center justify-between mt-1">
                  <h3 className="text-lg font-semibold text-ink-primary">
                    {anchor.title}
                  </h3>
                  <span className="text-xs font-semibold text-accent-teal bg-accent-teal/10 px-2.5 py-1 rounded-full">
                    {progressText}
                  </span>
                </div>
              </div>

              {/* Stack items */}
              <div className="flex flex-col gap-3 max-h-[40vh] overflow-y-auto pr-1">
                {subItems.map((item) => (
                  <motion.div
                    key={item.id}
                    whileTap={{ scale: 0.99 }}
                    onClick={async () => {
                      try {
                        await Haptics.impact({ style: ImpactStyle.Light });
                      } catch (e) {}
                      toggleSubItem(anchor.id, item.id);
                    }}
                    className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-colors ${
                      item.completed 
                        ? 'bg-success/[0.03] border-success/30' 
                        : 'bg-surface border-muted hover:border-muted/80'
                    }`}
                  >
                    <span className={`text-sm font-medium ${item.completed ? 'text-success line-through' : 'text-ink-primary'}`}>
                      {item.title}
                    </span>
                    
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                      item.completed 
                        ? 'bg-success border-success' 
                        : 'border-muted'
                    }`}>
                      {item.completed && (
                        <span className="text-surface text-xs font-bold">✓</span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Close Action */}
              <button
                onClick={() => setIsStackDrawerOpen(false)}
                className="w-full py-3.5 text-xs uppercase tracking-widest font-semibold bg-surface border border-muted rounded-xl text-ink-primary hover:bg-canvas transition-all active:scale-98 mt-2"
              >
                Close Checklist
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
