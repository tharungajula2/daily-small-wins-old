'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Anchor, useRitualStore } from '@/store/useRitualStore';
import { getRandomPrompt } from '@/utils/prompts';



export default function AnchorCard({ 
  anchor, 
  metadata 
}: { 
  anchor: Anchor; 
  metadata?: { is_non_negotiable: boolean; baseline_target: number | null }; 
}) {
  const toggleAnchor = useRitualStore((state) => state.toggleAnchor);
  const toggleSubItem = useRitualStore((state) => state.toggleSubItem);
  const anchors = useRitualStore((state) => state.anchors);
  const focusThreeIds = useRitualStore((state) => state.focusThreeIds);
  const addGather = useRitualStore((state) => state.addGather);
  const deleteGather = useRitualStore((state) => state.deleteGather);
  
  const isFocusThreeActive = focusThreeIds && focusThreeIds.length > 0;
  const isMuted = isFocusThreeActive && !focusThreeIds.includes(anchor.id) && !anchor.completed;
  
  const [justCompleted, setJustCompleted] = useState(false);
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);
  const [isGatherDrawerOpen, setIsGatherDrawerOpen] = useState(false);
  const [gatherLabel, setGatherLabel] = useState('');
  const [gatherTagsInput, setGatherTagsInput] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  const getTooltipText = (title: string) => {
    const normalized = title.toLowerCase().trim();
    if (normalized.includes('water') || normalized.includes('2.5l')) {
      return 'Water keeps you hydrated and clear throughout the day.';
    }
    if (normalized.includes('protein') || normalized.includes('30g')) {
      return 'Protein keeps your energy stable between meals.';
    }
    if (normalized.includes('steps') || normalized.includes('7,000')) {
      return 'A simple walk clears the mind and keeps you moving.';
    }
    if (normalized.includes('desk rule') || normalized.includes('20-8-2')) {
      return 'Move a little every hour to stay limber.';
    }
    if (normalized.includes('in bed') || normalized.includes('23:00')) {
      return 'Going to bed on time gives you a clean head start tomorrow.';
    }
    if (normalized.includes('evening reflection') || normalized.includes('reflection')) {
      return 'Writing down your day helps clear your head for sleep.';
    }
    if (normalized.includes('conversation') || normalized.includes('one real')) {
      return 'Connecting with someone keeps you grounded.';
    }
    if (normalized.includes('sunlight') || normalized.includes('10 minutes')) {
      return 'A little morning light wakes up your body naturally.';
    }
    return null;
  };

  const tooltipText = getTooltipText(anchor.title);

  // Drawer / Modal States for Reflection Type
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [reflectionInput, setReflectionInput] = useState('');
  const [currentPrompt, setCurrentPrompt] = useState('');

  const handleAddGather = async () => {
    if (!gatherLabel.trim() && selectedTags.length === 0 && !gatherTagsInput.trim()) return;
    try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (e) {}
    
    const manualTags = gatherTagsInput
      .split(',')
      .map(t => t.trim().replace(/^#/, ''))
      .filter(t => t.length > 0);
      
    const allTags = Array.from(new Set([...selectedTags, ...manualTags]));
      
    addGather(anchor.id, gatherLabel.trim() || undefined, allTags);
    setGatherLabel('');
    setGatherTagsInput('');
    setSelectedTags([]);
  };

  const getSuggestedTags = (title: string) => {
    const normalized = title.toLowerCase().trim();
    if (normalized.includes('water') || normalized.includes('hydrate')) {
      return ['hydration', 'glass', 'bottle', 'morning'];
    }
    if (normalized.includes('step') || normalized.includes('walk') || normalized.includes('run')) {
      return ['cardio', 'walk', 'sunlight', 'active'];
    }
    if (normalized.includes('gym') || normalized.includes('workout') || normalized.includes('lift')) {
      return ['strength', 'fitness', 'lifting', 'gym'];
    }
    if (normalized.includes('read') || normalized.includes('book') || normalized.includes('study')) {
      return ['learning', 'focus', 'mind', 'growth'];
    }
    return ['active', 'focus', 'health', 'daily'];
  };
  
  const suggestedTags = getSuggestedTags(anchor.title);
  const todayGathers = anchor.gathers || [];

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

    const finalReflectionText = reflectionInput.trim();

    toggleAnchor(anchor.id, false, finalReflectionText, currentPrompt);
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
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="p-6 rounded-2xl bg-accent-teal/[0.02] border-accent-teal/20 shadow-sm flex flex-col gap-3 relative overflow-hidden transition-all duration-300 hover:shadow-md"
      >
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h4 className="text-sm font-semibold text-ink-primary leading-relaxed break-words">
                {anchor.codename || anchor.title}
              </h4>
              <span className="bg-accent-teal/10 text-accent-teal text-[8px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 select-none">
                <span className="text-[9px]">✓</span> Logged
              </span>
              {metadata?.is_non_negotiable && (
                <span className="text-[8px] font-semibold tracking-wider text-accent-teal bg-accent-teal/10 px-1.5 py-0.5 rounded-sm select-none uppercase">
                  ★ Non-negotiable
                </span>
              )}
              {metadata?.baseline_target && (
                <span className="text-[8px] font-semibold tracking-wider text-ink-secondary bg-canvas px-1.5 py-0.5 rounded-sm select-none uppercase">
                  Target: {metadata.baseline_target}
                </span>
              )}
            </div>
            <p className="text-[9px] uppercase tracking-widest text-ink-tertiary mt-0.5 font-semibold leading-relaxed">
              Reflection Logged
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0 ml-4">
            <button
              onClick={() => setIsGatherDrawerOpen(true)}
              className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-accent-teal border border-accent-teal/20 rounded-md hover:bg-accent-teal/5 transition-all select-none cursor-pointer focus:outline-none bg-surface"
            >
              + Log
            </button>
            <button
              onClick={handleTap} // Untoggles it
              className="text-[10px] tracking-wider uppercase font-semibold text-accent-teal hover:text-accent-teal/80 transition-colors flex-shrink-0"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="pl-3 border-l-2 border-accent-teal/40 py-0.5">
          <p className="text-xs text-ink-secondary italic mb-2 leading-relaxed">
            "{anchor.prompt}"
          </p>
          <p className="text-sm text-ink-primary font-normal leading-relaxed whitespace-pre-wrap break-words">
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
        animate={{
          ...(justCompleted 
            ? { scale: [1, 1.02, 1], backgroundColor: ['rgba(42, 127, 127, 0)', 'rgba(42, 127, 127, 0.1)', 'rgba(42, 127, 127, 0)'] }
            : {}),
          borderLeftColor: metadata?.is_non_negotiable 
            ? (anchor.completed ? 'rgba(52, 199, 89, 0.4)' : '#E04C3C') 
            : undefined,
          borderLeftWidth: metadata?.is_non_negotiable ? '4px' : undefined,
          borderLeftStyle: metadata?.is_non_negotiable ? 'solid' : undefined
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`p-6 rounded-2xl border ${hasSubItems ? 'cursor-pointer active:bg-muted/10' : ''} ${
          metadata?.is_non_negotiable ? 'border-l-4' : ''
        } ${
          anchor.completed 
            ? (anchor.usedBaseline ? 'bg-accent-amber/5 border-accent-amber/20 shadow-xs' : 'bg-success/5 border-success/20 shadow-xs') 
            : 'bg-surface border-muted/80 hover:border-muted shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-[0_6px_24px_-4px_rgba(0,0,0,0.08)]'
        } ${
          isMuted ? 'opacity-40 grayscale transition-all duration-500' : 'transition-all duration-500'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 pr-4 min-w-0">
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <p className={`text-sm font-semibold break-words leading-relaxed ${
                anchor.completed 
                  ? (anchor.usedBaseline ? 'text-accent-amber' : 'text-success line-through') 
                  : 'text-ink-primary'
              }`}>
                {anchor.codename || anchor.title}
              </p>
              {tooltipText && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsTooltipOpen(!isTooltipOpen);
                  }}
                  className="w-3.5 h-3.5 rounded-full border border-muted/50 flex items-center justify-center text-[9px] font-mono font-semibold text-ink-secondary hover:text-accent-teal hover:border-accent-teal/50 transition-all select-none cursor-pointer focus:outline-none bg-canvas/30"
                  title="Why this matters"
                >
                  i
                </button>
              )}
              {metadata?.is_non_negotiable && (
                <span className="text-[8px] font-semibold tracking-wider text-accent-teal bg-accent-teal/10 px-1.5 py-0.5 rounded-sm select-none uppercase">
                  ★ Non-negotiable
                </span>
              )}
              {metadata?.baseline_target && (
                <span className="text-[8px] font-semibold tracking-wider text-ink-secondary bg-canvas px-1.5 py-0.5 rounded-sm select-none uppercase">
                  Target: {metadata.baseline_target}
                </span>
              )}
            </div>
            <p className="text-[10px] uppercase tracking-widest text-ink-tertiary mt-1 font-semibold">
              {hasSubItems ? `STACK • ${progressText}` : anchor.type} {anchor.usedBaseline && '• BASELINE ACHIEVED'}
            </p>
          </div>
          
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsGatherDrawerOpen(true);
              }}
              className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-accent-teal border border-accent-teal/20 rounded-md hover:bg-accent-teal/5 transition-all select-none cursor-pointer focus:outline-none"
            >
              + Log
            </button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={(e) => handleTap(e)}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
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
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className="text-surface text-sm"
                >
                  ✓
                </motion.span>
              )}
            </motion.button>
          </div>
        </div>

        <AnimatePresence>
          {isTooltipOpen && tooltipText && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="overflow-hidden"
            >
              <div className="mt-3 pt-3 border-t border-muted/30 text-[10px] text-accent-teal leading-relaxed select-none italic bg-accent-teal/[0.03] rounded-lg p-3">
                <span className="font-semibold uppercase tracking-wider text-[9px] not-italic">Clinical Context:</span> {tooltipText}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Baseline Dropdown Trigger */}
        {!anchor.completed && anchor.baselineTitle && (
          <div className="mt-3 pt-3 border-t border-muted/50 flex justify-between items-center">
            <span className="text-xs text-ink-tertiary italic">Hard day?</span>
            <button 
              onClick={handleBaseline}
              className="text-xs text-accent-amber hover:text-accent-amber/80 font-semibold transition-colors flex items-center gap-1"
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
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={() => setIsDrawerOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            />

            {/* Content Drawer */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="relative w-full max-w-md bg-canvas rounded-t-3xl border-t border-muted shadow-2xl p-6 flex flex-col gap-6 z-10"
            >
              {/* Drag Handle */}
              <div className="w-12 h-1 bg-muted rounded-full self-center -mt-2 mb-2" />

              <div>
                <p className="text-[10px] tracking-widest font-semibold text-accent-teal uppercase">
                  REFLECTION
                </p>
                <h3 className="text-lg font-semibold text-ink-primary mt-1">
                  {anchor.codename || anchor.title}
                </h3>
              </div>

              {/* Prompt Box */}
              <div className="p-4 rounded-xl bg-surface border border-muted/60">
                <p className="text-xs font-semibold uppercase tracking-widest text-ink-secondary mb-1">
                  Prompt
                </p>
                <p className="text-sm font-semibold text-ink-primary italic leading-relaxed">
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
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={() => setIsStackDrawerOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            />

            {/* Content Drawer */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="relative w-full max-w-md bg-canvas rounded-t-3xl border-t border-muted shadow-2xl p-6 flex flex-col gap-6 z-10 pb-10"
            >
              {/* Drag Handle */}
              <div className="w-12 h-1 bg-muted rounded-full self-center -mt-2 mb-2" />

              <div>
                <p className="text-[10px] tracking-widest font-semibold text-accent-teal uppercase">
                  CHECKLIST STACK
                </p>
                <div className="flex items-center justify-between mt-1">
                  <h3 className="text-lg font-semibold text-ink-primary">
                    {anchor.codename || anchor.title}
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
                    <span className={`text-sm font-semibold ${item.completed ? 'text-success line-through' : 'text-ink-primary'}`}>
                      {item.title}
                    </span>
                    
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                      item.completed 
                        ? 'bg-success border-success' 
                        : 'border-muted'
                    }`}>
                      {item.completed && (
                        <span className="text-surface text-xs font-semibold">✓</span>
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
      {/* Gather Transaction Log Drawer */}
      <AnimatePresence>
        {isGatherDrawerOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={() => setIsGatherDrawerOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            />

            {/* Content Drawer */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="relative w-full max-w-md bg-canvas rounded-t-3xl border-t border-muted shadow-2xl p-6 flex flex-col gap-5 z-10 pb-10"
            >
              {/* Drag Handle */}
              <div className="w-12 h-1 bg-muted rounded-full self-center -mt-2 mb-2" />

              <div>
                <p className="text-[10px] tracking-widest font-semibold text-accent-teal uppercase">
                  TRANSACTION LOGGER
                </p>
                <h3 className="text-lg font-semibold text-ink-primary mt-1">
                  Gather: {anchor.codename || anchor.title}
                </h3>
                {anchor.keepDefinition && (
                  <p className="text-xs text-ink-secondary mt-0.5">
                    Target Keep: {anchor.keepDefinition}
                  </p>
                )}
              </div>

              {/* Input Fields */}
              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-ink-tertiary block mb-1">
                    Value / Note
                  </label>
                  <input
                    type="text"
                    value={gatherLabel}
                    onChange={(e) => setGatherLabel(e.target.value)}
                    placeholder="e.g. 500ml, 8000 steps, cold plunge done"
                    className="w-full p-3 rounded-xl border border-muted bg-surface text-sm text-ink-primary focus:outline-none focus:border-accent-teal transition-all"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-ink-tertiary block mb-1">
                    Tags (Optional, comma separated)
                  </label>
                  <input
                    type="text"
                    value={gatherTagsInput}
                    onChange={(e) => setGatherTagsInput(e.target.value)}
                    placeholder="e.g. morning, outdoor"
                    className="w-full p-3 rounded-xl border border-muted bg-surface text-sm text-ink-primary focus:outline-none focus:border-accent-teal transition-all"
                  />
                </div>

                {/* Suggested Quick Tags */}
                <div>
                  <p className="text-[9px] text-ink-tertiary font-semibold uppercase tracking-wider mb-1.5">
                    Quick Tags
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {suggestedTags.map((tag) => {
                      const isSelected = selectedTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setSelectedTags(selectedTags.filter(t => t !== tag));
                            } else {
                              setSelectedTags([...selectedTags, tag]);
                            }
                          }}
                          className={`px-2 py-1 text-[10px] font-medium rounded-md border transition-all ${
                            isSelected
                              ? 'bg-accent-teal/10 text-accent-teal border-accent-teal/30 font-semibold'
                              : 'bg-surface border-muted/80 text-ink-secondary hover:border-ink-secondary/35'
                          }`}
                        >
                          #{tag}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Log Button */}
              <button
                onClick={handleAddGather}
                disabled={!gatherLabel.trim() && selectedTags.length === 0 && !gatherTagsInput.trim()}
                className={`w-full py-3 rounded-xl text-xs uppercase tracking-widest font-semibold transition-all active:scale-98 ${
                  gatherLabel.trim() || selectedTags.length > 0 || gatherTagsInput.trim()
                    ? 'bg-accent-teal text-surface hover:bg-accent-teal/95'
                    : 'bg-ink-tertiary/20 text-ink-tertiary cursor-not-allowed'
                }`}
              >
                Log Entry
              </button>

              {/* Today's Gathers List */}
              <div className="flex flex-col gap-2 pt-2 border-t border-muted/50">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-ink-tertiary">
                  Today's Transaction Logs
                </label>
                {todayGathers.length > 0 ? (
                  <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                    {todayGathers.map((g) => (
                      <div key={g.id} className="flex items-center justify-between p-3 bg-surface border border-muted/65 rounded-xl">
                        <div className="flex flex-col gap-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-ink-primary font-semibold break-words">
                              {g.label || 'Logged'}
                            </span>
                            <span className="text-[9px] text-ink-tertiary">
                              {g.createdAt ? new Date(g.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                            </span>
                          </div>
                          {g.tags && g.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {g.tags.map(t => (
                                <span key={t} className="text-[9px] text-accent-teal/80 bg-accent-teal/5 border border-accent-teal/10 px-1 rounded-sm">
                                  #{t}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={async () => {
                            try { await Haptics.impact({ style: ImpactStyle.Medium }); } catch (e) {}
                            deleteGather(anchor.id, g.id);
                          }}
                          className="text-xs text-error hover:text-error/80 px-2 font-semibold uppercase tracking-wider text-[10px]"
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-3 bg-surface border border-dashed border-muted rounded-xl">
                    <p className="text-xs text-ink-tertiary">No logs captured today yet.</p>
                  </div>
                )}
              </div>

              {/* Close Drawer Button */}
              <button
                onClick={() => setIsGatherDrawerOpen(false)}
                className="w-full py-3 text-xs uppercase tracking-widest font-semibold border border-muted bg-surface rounded-xl text-ink-secondary hover:text-ink-primary transition-all active:scale-98"
              >
                Close Transaction Logger
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
