'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRitualStore } from '@/store/useRitualStore';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Plus, X, Sparkles, FolderPlus } from 'lucide-react';

export default function QuickLogDrawer({
  isOpen,
  onClose,
  onOpenPlaylistManager,
}: {
  isOpen: boolean;
  onClose: () => void;
  onOpenPlaylistManager: () => void;
}) {
  const playlists = useRitualStore((state) => state.playlists);
  const activePlaylists = playlists.filter(p => p.isActive !== false);
  const addGem = useRitualStore((state) => state.addGem);

  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(
    activePlaylists.length > 0 ? activePlaylists[0].id : null
  );
  const [label, setLabel] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  
  const handleLog = async () => {
    if (!selectedPlaylistId) return;
    if (!label.trim() && !tagsInput.trim()) return;

    try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (e) {}

    const tags = tagsInput
      .split(',')
      .map(t => t.trim().replace(/^#/, ''))
      .filter(t => t.length > 0);

    addGem(selectedPlaylistId, label.trim() || undefined, tags);
    
    // Reset and close
    setLabel('');
    setTagsInput('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative w-full max-w-md bg-surface rounded-t-3xl border-t border-muted/50 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] p-6 flex flex-col gap-6 z-10 pb-10 max-h-[85vh] overflow-y-auto"
          >
            <div className="w-12 h-1 bg-muted rounded-full self-center -mt-2 mb-2" />

            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] tracking-widest font-bold text-accent-teal uppercase flex items-center gap-2">
                  <Sparkles className="w-3 h-3" /> Quick Capture
                </p>
                <h3 className="text-xl font-light text-ink-primary tracking-tight mt-1">
                  Log a Small Win
                </h3>
              </div>
              <button onClick={onClose} className="p-2 text-ink-tertiary hover:text-ink-primary transition-colors bg-canvas rounded-full border border-muted/50">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Playlist Selector */}
            <div className="flex flex-col gap-2">
              <label className="text-[9px] font-bold uppercase tracking-widest text-ink-secondary flex items-center justify-between">
                <span>Select Playlist</span>
              </label>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x">
                <button
                  onClick={() => {
                    onClose();
                    onOpenPlaylistManager();
                  }}
                  className="flex-shrink-0 snap-start flex flex-col items-center justify-center gap-1.5 w-24 h-24 rounded-2xl border-2 border-dashed border-muted/80 bg-canvas text-ink-tertiary hover:text-accent-teal hover:border-accent-teal/50 hover:bg-accent-teal/5 transition-all"
                >
                  <FolderPlus className="w-6 h-6" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-center">New<br/>Playlist</span>
                </button>
                
                {activePlaylists.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPlaylistId(p.id)}
                    className={`flex-shrink-0 snap-start flex flex-col items-center justify-center gap-2 w-24 h-24 rounded-2xl border-2 transition-all p-2 ${
                      selectedPlaylistId === p.id
                        ? 'border-accent-teal bg-accent-teal/10 shadow-[0_0_15px_rgba(42,127,127,0.15)]'
                        : 'border-muted/50 bg-canvas text-ink-secondary hover:border-muted hover:bg-surface'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedPlaylistId === p.id ? 'bg-accent-teal text-white' : 'bg-surface border border-muted/50'}`}>
                      {selectedPlaylistId === p.id ? <Sparkles className="w-4 h-4" /> : <span className="text-xs font-bold">{p.title.charAt(0).toUpperCase()}</span>}
                    </div>
                    <span className={`text-[10px] font-bold leading-tight text-center line-clamp-2 ${selectedPlaylistId === p.id ? 'text-accent-teal' : 'text-ink-secondary'}`}>
                      {p.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Input Fields */}
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-[9px] font-bold uppercase tracking-widest text-ink-secondary block mb-2">
                  Win Details
                </label>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="e.g. Meditated for 10 mins"
                  className="w-full p-4 rounded-2xl border border-muted bg-canvas text-sm text-ink-primary placeholder-ink-tertiary focus:outline-none focus:border-accent-teal focus:ring-1 focus:ring-accent-teal transition-all"
                />
              </div>

              <div>
                <label className="text-[9px] font-bold uppercase tracking-widest text-ink-secondary block mb-2">
                  Tags (Optional, comma separated)
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="e.g. morning, focus, health"
                  className="w-full p-4 rounded-2xl border border-muted bg-canvas text-sm text-ink-primary placeholder-ink-tertiary focus:outline-none focus:border-accent-teal focus:ring-1 focus:ring-accent-teal transition-all"
                />
              </div>
            </div>

            {/* Log Button */}
            <button
              onClick={handleLog}
              disabled={(!label.trim() && !tagsInput.trim()) || !selectedPlaylistId}
              className={`w-full py-4 rounded-2xl text-xs uppercase tracking-widest font-bold transition-all active:scale-98 flex items-center justify-center gap-2 mt-2 ${
                (label.trim() || tagsInput.trim()) && selectedPlaylistId
                  ? 'bg-accent-teal text-white hover:bg-[#349e9e] shadow-[0_4px_14px_0_rgba(42,127,127,0.39)]'
                  : 'bg-muted text-ink-tertiary cursor-not-allowed'
              }`}
            >
              RECORD WIN
              <Sparkles className="w-4 h-4 ml-1" />
            </button>
            
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
