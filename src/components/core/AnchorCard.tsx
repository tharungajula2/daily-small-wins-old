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
  const anchors = useRitualStore((state) => state.anchors);
  const focusThreeIds = useRitualStore((state) => state.focusThreeIds);
  const addGather = useRitualStore((state) => state.addGather);
  const deleteGather = useRitualStore((state) => state.deleteGather);
  
  const isFocusThreeActive = focusThreeIds && focusThreeIds.length > 0;
  const isMuted = isFocusThreeActive && !focusThreeIds.includes(anchor.id) && !anchor.completed;
  
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



  // handleTap removed since anchors cannot be completed.



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
                {anchor.title}
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
              Reflection 
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0 ml-4">
            <button
              onClick={() => setIsGatherDrawerOpen(true)}
              className="px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-widest text-white bg-gradient-to-r from-amber-400 to-amber-500 rounded-xl hover:from-amber-500 hover:to-amber-600 shadow-[0_2px_10px_rgba(245,158,11,0.25)] hover:shadow-[0_4px_16px_rgba(245,158,11,0.4)] transition-all active:scale-95 select-none cursor-pointer focus:outline-none flex items-center gap-1.5"
            >
              <span className="text-[13px] leading-none drop-shadow-sm">✨</span>
              <span className="drop-shadow-sm pt-[1px]">GEM</span>
            </button>
          </div>
        </div>



        {/* Home Screen Transaction Logs (Gems) */}
        {todayGathers.length > 0 && (
          <div className="mt-4 pt-4 border-t border-black/[0.04] dark:border-white/[0.05] flex flex-col gap-2">
            {todayGathers.map(g => (
              <div key={g.id} className="flex items-start gap-2.5 bg-gradient-to-r from-amber-500/10 to-transparent border-l-[3px] border-amber-500/40 rounded-r-xl px-3 py-2.5">
                <span className="text-[13px] mt-0.5 leading-none opacity-90 drop-shadow-sm">✨</span>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-[13px] font-bold text-ink-primary leading-snug">{g.label || 'Win Captured'}</span>
                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                    {g.tags && g.tags.length > 0 && (
                      <span className="text-[9px] font-bold text-amber-600/80 uppercase tracking-widest">{g.tags.map(t => `#${t}`).join(' ')}</span>
                    )}
                    {g.createdAt && <span className="text-[9px] opacity-40 font-semibold tracking-wider">({new Date(g.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    );
  }

  // 2. STANDARD ACTION / INCOMPLETE REFLECTION CARD / SUB-STACK CARD
  return (
    <>
      <motion.div
        whileTap={{ scale: 0.98 }}
        onClick={undefined}
        animate={{
          borderLeftColor: metadata?.is_non_negotiable 
            ? '#E04C3C' 
            : undefined,
          borderLeftWidth: metadata?.is_non_negotiable ? '4px' : undefined,
          borderLeftStyle: metadata?.is_non_negotiable ? 'solid' : undefined
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`p-5 mb-4 rounded-2xl bg-surface border border-muted/80 shadow-sm hover:shadow-md transition-all duration-300 ${
          metadata?.is_non_negotiable ? 'border-l-4 border-l-error' : ''
        } ${
          isMuted ? 'opacity-40 grayscale' : ''
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 pr-4 min-w-0">
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <p className={`text-sm font-semibold break-words leading-relaxed text-ink-primary`}>
                {anchor.title}
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
              {anchor.type}
            </p>
          </div>
          
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsGatherDrawerOpen(true);
              }}
              className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-amber-700 bg-amber-500/10 rounded-xl border border-amber-500/20 hover:bg-amber-500/20 hover:border-amber-500/30 transition-all active:scale-95 select-none cursor-pointer focus:outline-none flex items-center gap-1.5"
            >
              <span className="text-xs leading-none">✨</span>
              <span className="pt-[1px]">GEM</span>
            </button>
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



        {/* Home Screen Transaction Logs (Gems) */}
        {todayGathers.length > 0 && (
          <div className="mt-4 pt-4 border-t border-black/[0.04] dark:border-white/[0.05] flex flex-col gap-2">
            {todayGathers.map(g => (
              <div key={g.id} className="flex items-start gap-2.5 bg-gradient-to-r from-amber-500/10 to-transparent border-l-[3px] border-amber-500/40 rounded-r-xl px-3 py-2.5">
                <span className="text-[13px] mt-0.5 leading-none opacity-90 drop-shadow-sm">✨</span>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-[13px] font-bold text-ink-primary leading-snug">{g.label || 'Win Captured'}</span>
                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                    {g.tags && g.tags.length > 0 && (
                      <span className="text-[9px] font-bold text-amber-600/80 uppercase tracking-widest">{g.tags.map(t => `#${t}`).join(' ')}</span>
                    )}
                    {g.createdAt && <span className="text-[9px] opacity-40 font-semibold tracking-wider">({new Date(g.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>




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
                <p className="text-[10px] tracking-widest font-semibold text-amber-500 uppercase flex items-center gap-2">
                  <span>✨</span> LOG A GEM
                </p>
                <h3 className="text-lg font-semibold text-ink-primary mt-1">
                  {anchor.title}
                </h3>
                <p className="text-xs text-ink-secondary mt-1">Capture a small win for this playlist.</p>
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
                className={`w-full py-3 rounded-xl text-xs uppercase tracking-widest font-bold transition-all active:scale-98 flex items-center justify-center gap-2 ${
                  gatherLabel.trim() || selectedTags.length > 0 || gatherTagsInput.trim()
                    ? 'bg-amber-500 text-surface hover:bg-amber-600 shadow-[0_4px_14px_0_rgba(245,158,11,0.39)]'
                    : 'bg-ink-tertiary/20 text-ink-tertiary cursor-not-allowed'
                }`}
              >
                <span>CAPTURE GEM</span>
                <span>✨</span>
              </button>

              {/* Today's Gathers List */}
              <div className="flex flex-col gap-2 pt-2 border-t border-muted/50">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-amber-600/80">
                  Today's Gems ✨
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
