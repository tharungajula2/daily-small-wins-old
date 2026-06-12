'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Playlist, useRitualStore } from '@/store/useRitualStore';
import { Sparkles, X, Info } from 'lucide-react';

export default function PlaylistCard({ 
  playlist, 
  metadata 
}: { 
  playlist: Playlist; 
  metadata?: { is_non_negotiable: boolean; baseline_target: number | null }; 
}) {
  const addGem = useRitualStore((state) => state.addGem);
  const deleteGem = useRitualStore((state) => state.deleteGem);
  const editGem = useRitualStore((state) => state.editGem);
  
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);
  const [isGemDrawerOpen, setIsGemDrawerOpen] = useState(false);
  const [editingGemId, setEditingGemId] = useState<string | null>(null);
  const [gemLabel, setGemLabel] = useState('');
  const [gemTagsInput, setGemTagsInput] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const handleCloseDrawer = () => {
    setIsGemDrawerOpen(false);
    setEditingGemId(null);
    setGemLabel('');
    setGemTagsInput('');
    setSelectedTags([]);
  };

  const handleOpenEdit = (g: any) => {
    setEditingGemId(g.id);
    setGemLabel(g.label || '');
    setGemTagsInput('');
    setSelectedTags(g.tags || []);
    setIsGemDrawerOpen(true);
  };
  
  const getTooltipText = (title: string) => {
    const normalized = title.toLowerCase().trim();
    if (normalized.includes('water') || normalized.includes('2.5l')) return 'Water keeps you hydrated and clear throughout the day.';
    if (normalized.includes('protein') || normalized.includes('30g')) return 'Protein keeps your energy stable between meals.';
    if (normalized.includes('steps') || normalized.includes('7,000')) return 'A simple walk clears the mind and keeps you moving.';
    if (normalized.includes('desk rule') || normalized.includes('20-8-2')) return 'Move a little every hour to stay limber.';
    if (normalized.includes('in bed') || normalized.includes('23:00')) return 'Going to bed on time gives you a clean head start tomorrow.';
    if (normalized.includes('evening reflection') || normalized.includes('reflection')) return 'Writing down your day helps clear your head for sleep.';
    if (normalized.includes('conversation') || normalized.includes('one real')) return 'Connecting with someone keeps you grounded.';
    if (normalized.includes('sunlight') || normalized.includes('10 minutes')) return 'A little morning light wakes up your body naturally.';
    return null;
  };

  const tooltipText = getTooltipText(playlist.title);

  const handleSaveGem = async () => {
    if (!gemLabel.trim() && selectedTags.length === 0 && !gemTagsInput.trim()) return;
    try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (e) {}
    
    const manualTags = gemTagsInput
      .split(',')
      .map(t => t.trim().replace(/^#/, ''))
      .filter(t => t.length > 0);
      
    const allTags = Array.from(new Set([...selectedTags, ...manualTags]));
      
    if (editingGemId) {
      editGem(playlist.id, editingGemId, gemLabel.trim() || undefined, allTags);
    } else {
      addGem(playlist.id, gemLabel.trim() || undefined, allTags);
    }
    handleCloseDrawer();
  };

  const handleDeleteGem = async () => {
    if (!editingGemId) return;
    try { await Haptics.impact({ style: ImpactStyle.Medium }); } catch (e) {}
    deleteGem(playlist.id, editingGemId);
    handleCloseDrawer();
  };

  const getSuggestedTags = (title: string) => {
    const normalized = title.toLowerCase().trim();
    if (normalized.includes('water') || normalized.includes('hydrate')) return ['hydration', 'glass', 'bottle', 'morning'];
    if (normalized.includes('step') || normalized.includes('walk') || normalized.includes('run')) return ['cardio', 'walk', 'sunlight', 'active'];
    if (normalized.includes('gym') || normalized.includes('workout') || normalized.includes('lift')) return ['strength', 'fitness', 'lifting', 'gym'];
    if (normalized.includes('read') || normalized.includes('book') || normalized.includes('study')) return ['learning', 'focus', 'mind', 'growth'];
    return ['active', 'focus', 'health', 'daily'];
  };
  
  const suggestedTags = getSuggestedTags(playlist.title);
  const todayGems = playlist.gems || [];

  return (
    <>
      <motion.div
        whileTap={{ scale: 0.98 }}
        className={`p-5 rounded-2xl bg-surface border border-muted/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] hover:shadow-md hover:border-muted transition-all duration-300 relative overflow-hidden`}
      >
        {/* Glow effect if non-negotiable */}
        {metadata?.is_non_negotiable && (
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#E04C3C] to-transparent" />
        )}

        <div className="flex items-center justify-between">
          <div className="flex-1 pr-4 min-w-0">
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <p className="text-sm font-semibold break-words leading-relaxed text-ink-primary">
                {playlist.title}
              </p>
              {tooltipText && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsTooltipOpen(!isTooltipOpen);
                  }}
                  className="w-4 h-4 rounded-full border border-muted flex items-center justify-center text-ink-tertiary hover:text-accent-teal hover:border-accent-teal/50 transition-all cursor-pointer bg-canvas/50"
                >
                  <Info className="w-2.5 h-2.5" />
                </button>
              )}
              {metadata?.is_non_negotiable && (
                <span className="text-[8px] font-semibold tracking-wider text-[#E04C3C] bg-[#E04C3C]/10 border border-[#E04C3C]/20 px-1.5 py-0.5 rounded-sm uppercase">
                  Non-negotiable
                </span>
              )}
              {metadata?.baseline_target && (
                <span className="text-[8px] font-semibold tracking-wider text-ink-secondary bg-canvas border border-muted/50 px-1.5 py-0.5 rounded-sm uppercase">
                  Target: {metadata.baseline_target}
                </span>
              )}
            </div>
            <p className="text-[9px] uppercase tracking-widest text-accent-teal mt-1.5 font-bold">
              Playlist
            </p>
          </div>
          
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsGemDrawerOpen(true);
              }}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-teal to-[#1e5c5c] text-white shadow-[0_0_15px_rgba(42,127,127,0.3)] hover:shadow-[0_0_25px_rgba(42,127,127,0.5)] flex items-center justify-center transition-all active:scale-95 cursor-pointer focus:outline-none"
            >
              <Sparkles className="w-5 h-5" />
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
              <div className="mt-4 pt-3 border-t border-muted/30 text-[10px] text-accent-teal leading-relaxed italic bg-accent-teal/5 rounded-lg p-3">
                <span className="font-semibold uppercase tracking-wider text-[9px] not-italic text-ink-secondary mr-2">Context:</span> {tooltipText}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Transaction Logs */}
        {todayGems.length > 0 && (
          <div className="mt-5 pt-4 border-t border-muted/30 flex flex-col gap-2">
            {todayGems.map(g => (
              <div 
                key={g.id} 
                onClick={() => handleOpenEdit(g)}
                className="flex items-start gap-3 bg-gradient-to-r from-accent-teal/10 to-transparent border-l-[2px] border-accent-teal/40 rounded-r-xl px-3 py-2.5 cursor-pointer hover:from-accent-teal/15 transition-colors"
              >
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-xs font-semibold text-ink-primary leading-snug flex-1 break-words">{g.label || 'Win Captured'}</span>
                    {g.createdAt && <span className="text-[8px] text-ink-tertiary uppercase tracking-widest shrink-0 mt-0.5">{new Date(g.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    {g.tags && g.tags.length > 0 && (
                      <span className="text-[8px] font-bold text-accent-teal uppercase tracking-widest">{g.tags.map(t => `#${t}`).join(' ')}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Drawer */}
      <AnimatePresence>
        {isGemDrawerOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={handleCloseDrawer}
              className="absolute inset-0 bg-black/40 backdrop-blur-md"
            />

            {/* Content Drawer */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="relative w-full max-w-md bg-surface rounded-t-3xl border-t border-muted/50 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] p-6 flex flex-col gap-6 z-10 pb-10"
            >
              <div className="w-12 h-1 bg-muted rounded-full self-center -mt-2 mb-2" />

              <div>
                <p className="text-[10px] tracking-widest font-bold text-accent-teal uppercase mb-1 flex justify-between items-center">
                  <span>{editingGemId ? 'Edit Win' : 'Log a Win'}</span>
                  <button onClick={handleCloseDrawer} className="text-ink-tertiary hover:text-ink-primary p-1 bg-canvas rounded-full"><X className="w-4 h-4" /></button>
                </p>
                <h3 className="text-xl font-light text-ink-primary tracking-tight">
                  {playlist.title}
                </h3>
              </div>

              {/* Input Fields */}
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-[9px] font-bold uppercase tracking-widest text-ink-secondary block mb-2">
                    Details
                  </label>
                  <input
                    type="text"
                    value={gemLabel}
                    onChange={(e) => setGemLabel(e.target.value)}
                    placeholder="e.g. 500ml, 8000 steps"
                    className="w-full p-4 rounded-2xl border border-muted bg-canvas text-sm text-ink-primary placeholder-ink-tertiary focus:outline-none focus:border-accent-teal transition-all"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-bold uppercase tracking-widest text-ink-secondary block mb-2">
                    Tags (Optional)
                  </label>
                  <input
                    type="text"
                    value={gemTagsInput}
                    onChange={(e) => setGemTagsInput(e.target.value)}
                    placeholder="e.g. morning, outdoor"
                    className="w-full p-4 rounded-2xl border border-muted bg-canvas text-sm text-ink-primary placeholder-ink-tertiary focus:outline-none focus:border-accent-teal transition-all"
                  />
                </div>

                {/* Suggested Quick Tags */}
                <div>
                  <p className="text-[9px] text-ink-secondary font-bold uppercase tracking-widest mb-2">
                    Quick Tags
                  </p>
                  <div className="flex flex-wrap gap-2">
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
                          className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-lg border transition-all ${
                            isSelected
                              ? 'bg-accent-teal/20 text-accent-teal border-accent-teal/50'
                              : 'bg-canvas border-muted text-ink-secondary hover:border-ink-secondary/50'
                          }`}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Log Button */}
              <div className="flex flex-col gap-3 mt-2">
                <button
                  onClick={handleSaveGem}
                  disabled={!gemLabel.trim() && selectedTags.length === 0 && !gemTagsInput.trim()}
                  className={`w-full py-4 rounded-2xl text-xs uppercase tracking-widest font-bold transition-all active:scale-98 flex items-center justify-center gap-2 ${
                    gemLabel.trim() || selectedTags.length > 0 || gemTagsInput.trim()
                      ? 'bg-accent-teal text-white hover:bg-[#349e9e] shadow-[0_4px_14px_0_rgba(42,127,127,0.39)]'
                      : 'bg-muted text-ink-tertiary cursor-not-allowed'
                  }`}
                >
                  {editingGemId ? 'SAVE CHANGES' : 'RECORD WIN'}
                  <Sparkles className="w-4 h-4 ml-1" />
                </button>
                {editingGemId && (
                  <button
                    onClick={handleDeleteGem}
                    className="w-full py-4 rounded-2xl text-xs uppercase tracking-widest font-bold transition-all active:scale-98 text-red-500 bg-red-500/10 hover:bg-red-500/20"
                  >
                    DELETE WIN
                  </button>
                )}
              </div>

              {/* Today's Gathers List */}
              <div className="flex flex-col gap-3 pt-4 border-t border-muted/50">
                <label className="text-[10px] font-bold uppercase tracking-widest text-accent-teal">
                  Today's Logs
                </label>
                {todayGems.length > 0 ? (
                  <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                    {todayGems.map((g) => (
                      <div 
                        key={g.id} 
                        onClick={() => handleOpenEdit(g)}
                        className="flex items-center justify-between p-3 bg-canvas border border-muted/65 rounded-xl cursor-pointer hover:border-accent-teal/50 transition-colors"
                      >
                        <div className="flex flex-col gap-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-ink-primary font-medium break-words">
                              {g.label || 'Logged'}
                            </span>
                            <span className="text-[9px] text-ink-tertiary shrink-0">
                              {g.createdAt ? new Date(g.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                            </span>
                          </div>
                          {g.tags && g.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {g.tags.map(t => (
                                <span key={t} className="text-[9px] text-accent-teal bg-accent-teal/10 border border-accent-teal/20 px-1.5 rounded uppercase tracking-widest font-bold">
                                  {t}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={async () => {
                            try { await Haptics.impact({ style: ImpactStyle.Medium }); } catch (e) {}
                            deleteGem(playlist.id, g.id);
                          }}
                          className="text-ink-tertiary hover:text-error p-2 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 bg-canvas border border-dashed border-muted rounded-xl">
                    <p className="text-xs text-ink-tertiary italic">Empty canvas today.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
