'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Playlist, useRitualStore } from '@/store/useRitualStore';
import { Plus, X, Info } from 'lucide-react';

export default function PlaylistCard({ 
  playlist, 
  metadata 
}: { 
  playlist: Playlist; 
  metadata?: { is_non_negotiable: boolean; baseline_target: number | null }; 
}) {
  const addGem = useRitualStore((state) => state.addGem);
  const deleteGem = useRitualStore((state) => state.deleteGem);
  
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);
  const [isGemDrawerOpen, setIsGemDrawerOpen] = useState(false);
  const [gemLabel, setGemLabel] = useState('');
  const [gemTagsInput, setGemTagsInput] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
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

  const handleAddGem = async () => {
    if (!gemLabel.trim() && selectedTags.length === 0 && !gemTagsInput.trim()) return;
    try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (e) {}
    
    const manualTags = gemTagsInput
      .split(',')
      .map(t => t.trim().replace(/^#/, ''))
      .filter(t => t.length > 0);
      
    const allTags = Array.from(new Set([...selectedTags, ...manualTags]));
      
    addGem(playlist.id, gemLabel.trim() || undefined, allTags);
    setGemLabel('');
    setGemTagsInput('');
    setSelectedTags([]);
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
        className={`p-5 rounded-2xl bg-white/[0.02] border border-white/5 shadow-sm hover:border-white/10 transition-all duration-300 relative overflow-hidden`}
      >
        {/* Glow effect if non-negotiable */}
        {metadata?.is_non_negotiable && (
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#E04C3C] to-transparent" />
        )}

        <div className="flex items-center justify-between">
          <div className="flex-1 pr-4 min-w-0">
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <p className="text-sm font-semibold break-words leading-relaxed text-white/90">
                {playlist.title}
              </p>
              {tooltipText && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsTooltipOpen(!isTooltipOpen);
                  }}
                  className="w-4 h-4 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-[#2A7F7F] hover:border-[#2A7F7F]/50 transition-all cursor-pointer bg-white/5"
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
                <span className="text-[8px] font-semibold tracking-wider text-white/40 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded-sm uppercase">
                  Target: {metadata.baseline_target}
                </span>
              )}
            </div>
            <p className="text-[9px] uppercase tracking-widest text-[#2A7F7F] mt-1.5 font-bold">
              Playlist
            </p>
          </div>
          
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsGemDrawerOpen(true);
              }}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2A7F7F] to-[#1e5c5c] text-white shadow-[0_0_15px_rgba(42,127,127,0.3)] hover:shadow-[0_0_25px_rgba(42,127,127,0.5)] flex items-center justify-center transition-all active:scale-95 cursor-pointer focus:outline-none"
            >
              <Plus className="w-5 h-5" />
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
              <div className="mt-4 pt-3 border-t border-white/5 text-[10px] text-[#2A7F7F] leading-relaxed italic bg-[#2A7F7F]/5 rounded-lg p-3">
                <span className="font-semibold uppercase tracking-wider text-[9px] not-italic text-white/60 mr-2">Context:</span> {tooltipText}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Transaction Logs */}
        {todayGems.length > 0 && (
          <div className="mt-5 pt-4 border-t border-white/5 flex flex-col gap-2">
            {todayGems.map(g => (
              <div key={g.id} className="flex items-start gap-3 bg-gradient-to-r from-[#2A7F7F]/10 to-transparent border-l-[2px] border-[#2A7F7F]/40 rounded-r-xl px-3 py-2.5">
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white/90 leading-snug">{g.label || 'Win Captured'}</span>
                    {g.createdAt && <span className="text-[8px] text-white/30 uppercase tracking-widest">{new Date(g.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    {g.tags && g.tags.length > 0 && (
                      <span className="text-[8px] font-bold text-[#2A7F7F] uppercase tracking-widest">{g.tags.map(t => `#${t}`).join(' ')}</span>
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
              onClick={() => setIsGemDrawerOpen(false)}
              className="absolute inset-0 bg-[#0a0a0c]/80 backdrop-blur-md"
            />

            {/* Content Drawer */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="relative w-full max-w-md bg-[#13131a] rounded-t-3xl border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] p-6 flex flex-col gap-6 z-10 pb-10"
            >
              <div className="w-12 h-1 bg-white/20 rounded-full self-center -mt-2 mb-2" />

              <div>
                <p className="text-[10px] tracking-widest font-bold text-[#2A7F7F] uppercase mb-1">
                  Log a Win
                </p>
                <h3 className="text-xl font-light text-white/90 tracking-tight">
                  {playlist.title}
                </h3>
              </div>

              {/* Input Fields */}
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-[9px] font-bold uppercase tracking-widest text-white/40 block mb-2">
                    Details
                  </label>
                  <input
                    type="text"
                    value={gemLabel}
                    onChange={(e) => setGemLabel(e.target.value)}
                    placeholder="e.g. 500ml, 8000 steps"
                    className="w-full p-4 rounded-2xl border border-white/10 bg-white/5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#2A7F7F] transition-all"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-bold uppercase tracking-widest text-white/40 block mb-2">
                    Tags (Optional)
                  </label>
                  <input
                    type="text"
                    value={gemTagsInput}
                    onChange={(e) => setGemTagsInput(e.target.value)}
                    placeholder="e.g. morning, outdoor"
                    className="w-full p-4 rounded-2xl border border-white/10 bg-white/5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#2A7F7F] transition-all"
                  />
                </div>

                {/* Suggested Quick Tags */}
                <div>
                  <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest mb-2">
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
                              ? 'bg-[#2A7F7F]/20 text-[#2A7F7F] border-[#2A7F7F]/50'
                              : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20'
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
              <button
                onClick={handleAddGem}
                disabled={!gemLabel.trim() && selectedTags.length === 0 && !gemTagsInput.trim()}
                className={`w-full py-4 rounded-2xl text-xs uppercase tracking-widest font-bold transition-all active:scale-98 flex items-center justify-center gap-2 mt-2 ${
                  gemLabel.trim() || selectedTags.length > 0 || gemTagsInput.trim()
                    ? 'bg-[#2A7F7F] text-white hover:bg-[#349e9e] shadow-[0_0_20px_rgba(42,127,127,0.4)]'
                    : 'bg-white/5 text-white/20 cursor-not-allowed'
                }`}
              >
                RECORD WIN
              </button>

              {/* Today's Gathers List */}
              <div className="flex flex-col gap-3 pt-4 border-t border-white/5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#2A7F7F]">
                  Today's Logs
                </label>
                {todayGems.length > 0 ? (
                  <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                    {todayGems.map((g) => (
                      <div key={g.id} className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl">
                        <div className="flex flex-col gap-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-white/90 font-medium break-words">
                              {g.label || 'Logged'}
                            </span>
                            <span className="text-[9px] text-white/30">
                              {g.createdAt ? new Date(g.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                            </span>
                          </div>
                          {g.tags && g.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {g.tags.map(t => (
                                <span key={t} className="text-[9px] text-[#2A7F7F] bg-[#2A7F7F]/10 border border-[#2A7F7F]/20 px-1.5 rounded uppercase tracking-widest font-bold">
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
                          className="text-white/30 hover:text-[#E04C3C] p-2 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 bg-white/5 border border-dashed border-white/10 rounded-xl">
                    <p className="text-xs text-white/30 italic">Empty canvas today.</p>
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
