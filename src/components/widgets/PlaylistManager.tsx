'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRitualStore } from '@/store/useRitualStore';

import { 
  ANCHOR_NAME_SUGGESTIONS
} from '@/utils/prompts';
import { PUBLIC_TEMPLATES } from '@/lib/templates';
import { Shield, Sparkles } from 'lucide-react';

export default function PlaylistManager({ onClose }: { onClose: () => void }) {
  const { playlists, addPlaylist, removePlaylist, renamePlaylist, togglePlaylistActive } = useRitualStore();
  
  const activePlaylistsCount = playlists.filter((a: any) => a.isActive !== false && a.title !== 'Sunday Weekly Debrief').length;

  // Add Playlist form states
  const [selectedTemplateKey, setSelectedTemplateKey] = useState<string>('scratch');
  const [newTitle, setNewTitle] = useState('');
  const [bypassCap, setBypassCap] = useState(false);

  // Editing States
  const [editingPlaylistId, setEditingPlaylistId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const selectTemplate = (key: string) => {
    setSelectedTemplateKey(key);
    if (key === 'scratch') {
      setNewTitle('');
    } else {
      const tmpl = PUBLIC_TEMPLATES.find(t => t.key === key);
      if (tmpl) {
        setNewTitle(tmpl.title);
      }
    }
  };

  const handleAdd = async () => {
    if (!newTitle.trim()) return;
    try { await void 0; } catch (e) {}
    


    addPlaylist(
      newTitle.trim()
    );

    // Reset forms
    setNewTitle('');
    setSelectedTemplateKey('scratch');
  };

  const handleRemove = async (id: string) => {
    try { await void 0; } catch (e) {}
    removePlaylist(id);
  };

  const handleToggleActive = async (id: string) => {
    const playlist = playlists.find((a: any) => a.id === id);
    if (!playlist) return;
    if (playlist.isActive === false && activePlaylistsCount >= 5) {
      alert("Up to 5 categories — keep it focused.");
      return;
    }
    try { await void 0; } catch (e) {}
    togglePlaylistActive(id);
  };

  const startEditing = (playlist: any) => {
    setEditingPlaylistId(playlist.id);
    setEditTitle(playlist.title);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editTitle.trim()) return;
    try { await void 0; } catch (e) {}
    
    renamePlaylist(id, editTitle.trim());
    setEditingPlaylistId(null);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-overlay/20 backdrop-blur-sm sm:items-center p-0"
    >
      <div className="w-full max-w-md bg-surface rounded-t-3xl sm:rounded-3xl p-6 shadow-lg border border-muted max-h-[85vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-ink-primary font-semibold text-sm">Manage Categories</h3>
            <p className="text-[10px] text-ink-secondary mt-0.5">Categories are the pillars you collect wins for. Add up to five.</p>
          </div>
          <button onClick={onClose} className="text-ink-tertiary hover:text-ink-primary p-2 focus:outline-none">
            ✕
          </button>
        </div>

        {/* Existing Categories List */}
        <div className="space-y-3 mb-8">
          <AnimatePresence>
            {playlists.map((playlist: any) => (
              editingPlaylistId === playlist.id ? (
                <motion.div 
                  key={playlist.id}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="p-4 bg-canvas border border-accent-teal/30 rounded-xl flex flex-col gap-3.5"
                >
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-ink-secondary font-semibold mb-1">
                      Rename Category
                    </label>
                    <input 
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full bg-surface border border-muted rounded-lg p-2.5 text-xs text-ink-primary focus:outline-none focus:border-accent-teal"
                    />
                    
                    {/* Anchor Title Suggestions */}
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {ANCHOR_NAME_SUGGESTIONS.map((name) => (
                        <button
                          key={name}
                          type="button"
                          onClick={() => setEditTitle(name)}
                          className="px-2.5 py-1 text-[10px] bg-canvas hover:bg-muted text-ink-primary border border-muted/90 rounded-md font-medium hover:border-accent-teal transition-all"
                        >
                          {name}
                        </button>
                      ))}
                    </div>
                  </div>


                  <div className="flex gap-2.5 mt-1 pt-2.5 border-t border-muted/40">
                    <button
                      type="button"
                      onClick={() => setEditingPlaylistId(null)}
                      className="flex-1 py-2 text-xs uppercase tracking-widest font-semibold border border-muted rounded-lg text-ink-secondary hover:text-ink-primary bg-surface transition-all active:scale-98"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveEdit(playlist.id)}
                      disabled={!editTitle.trim()}
                      className={`flex-1 py-2 text-xs uppercase tracking-widest font-semibold rounded-lg text-surface transition-all active:scale-98 ${
                        editTitle.trim()
                          ? 'bg-accent-teal hover:bg-accent-teal/95'
                          : 'bg-ink-tertiary/20 text-ink-tertiary cursor-not-allowed'
                      }`}
                    >
                      Save
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key={playlist.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className="flex items-start justify-between p-4 bg-canvas border border-muted rounded-xl animate-in fade-in-20 duration-300"
                >
                  <div className="min-w-0 flex-1 pr-3">
                    <div className="flex items-center gap-2 flex-wrap min-w-0">
                      <p className={`text-sm font-semibold truncate ${playlist.isActive === false ? 'text-ink-secondary line-through' : 'text-ink-primary'}`}>{playlist.title}</p>

                      {playlist.isActive === false && (
                        <span className="text-[8px] tracking-wider uppercase font-semibold text-ink-tertiary bg-muted/60 px-1.5 py-0.5 rounded-sm">
                          Dormant
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-4 shrink-0">
                    <button 
                      onClick={() => startEditing(playlist)}
                      className="text-accent-teal text-xs font-semibold px-1.5 py-1 hover:opacity-80 focus:outline-none"
                    >
                      Edit
                    </button>
                    <span className="text-ink-tertiary/20 text-xs">|</span>
                    <button 
                      onClick={() => handleToggleActive(playlist.id)}
                      className="text-ink-secondary hover:text-ink-primary text-xs font-semibold px-1.5 py-1 focus:outline-none"
                    >
                      {playlist.isActive !== false ? 'Retire' : 'Activate'}
                    </button>
                    <span className="text-ink-tertiary/20 text-xs">|</span>
                    <button 
                      onClick={() => handleRemove(playlist.id)}
                      className="text-error/70 hover:text-error text-xs px-1.5 py-1 focus:outline-none"
                    >
                      Delete
                    </button>
                  </div>
                </motion.div>
              )
            ))}
          </AnimatePresence>
          {playlists.length === 0 && (
            <p className="text-ink-secondary text-xs text-center py-6 leading-relaxed max-w-[280px] mx-auto">
              No anchors yet. Start with one — what's the thing that, when you skip it, your whole day quietly falls apart?
            </p>
          )}
        </div>

        {/* Add New Playlist */}
        {activePlaylistsCount >= 5 && !bypassCap ? (
          <div className="border-t border-muted pt-6 text-center flex flex-col items-center gap-3">
            <span className="text-xl select-none">⚓</span>
            <div>
              <h4 className="text-sm font-semibold text-ink-primary">Personal Playlists Cap</h4>
              <p className="text-xs text-ink-secondary leading-relaxed max-w-[280px] mx-auto font-normal mt-1">
                Up to 5 personal playlists — keep it focused.
              </p>
            </div>
            <button
              onClick={() => setBypassCap(true)}
              className="mt-2 text-[10px] uppercase tracking-widest font-semibold text-ink-tertiary hover:text-ink-secondary underline underline-offset-2"
            >
              I understand the risk of clutter, add anyway
            </button>
          </div>
        ) : (
          <div className="border-t border-muted pt-6 flex flex-col gap-4 text-left">
            <h4 className="text-ink-secondary text-sm font-semibold uppercase tracking-wider">Add New Playlist</h4>
            
            {/* Template Selection */}
            <div>
              <span className="block text-[10px] uppercase tracking-widest text-ink-tertiary font-bold mb-2">
                1. Pick a template
              </span>
              <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2 select-none" style={{ WebkitOverflowScrolling: 'touch' }}>
                <button
                  type="button"
                  onClick={() => selectTemplate('scratch')}
                  className={`p-3 rounded-xl border text-center shrink-0 min-w-[100px] flex flex-col justify-center gap-1 transition-all ${
                    selectedTemplateKey === 'scratch'
                      ? 'bg-accent-teal/5 border-accent-teal text-ink-primary'
                      : 'bg-canvas border-muted text-ink-secondary'
                  }`}
                >
                  <Sparkles className="w-4 h-4 mx-auto text-accent-teal" />
                  <span className="text-[10px] font-semibold">Scratch</span>
                </button>

                {PUBLIC_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.key}
                    type="button"
                    onClick={() => selectTemplate(tmpl.key)}
                    className={`p-3 rounded-xl border text-left shrink-0 min-w-[140px] flex flex-col justify-between gap-1 transition-all ${
                      selectedTemplateKey === tmpl.key
                        ? 'bg-accent-teal/5 border-accent-teal text-ink-primary'
                        : 'bg-canvas border-muted text-ink-secondary'
                    }`}
                  >
                    <span className="text-[10px] font-semibold truncate block w-full">{tmpl.title}</span>
                    <span className="text-[8px] opacity-75 line-clamp-2 leading-tight block w-full">{tmpl.keepDefinition}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Title / Name Field */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-ink-tertiary font-bold mb-1 ml-1">
                2. Playlist Name / Title
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g., Deep Work, Stillness"
                className="w-full bg-canvas border border-muted rounded-xl p-3 text-xs text-ink-primary placeholder:text-ink-tertiary focus:outline-none focus:border-accent-teal"
              />

              {/* Title Suggestions */}
              <div className="mt-1.5 flex flex-wrap gap-1">
                {ANCHOR_NAME_SUGGESTIONS.map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => {
                      setNewTitle(name);
                      setSelectedTemplateKey('scratch');
                    }}
                    className="px-2.5 py-1 text-[10px] bg-canvas hover:bg-muted text-ink-primary border border-muted/90 rounded-md font-medium hover:border-accent-teal transition-all"
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>


            <button
              onClick={handleAdd}
              disabled={!newTitle.trim()}
              className={`w-full py-3.5 rounded-xl font-semibold transition-all text-xs uppercase tracking-widest mt-2 ${
                newTitle.trim() 
                  ? 'bg-ink-primary text-surface hover:bg-ink-primary/95' 
                  : 'bg-muted text-ink-tertiary cursor-not-allowed'
              }`}
            >
              Add Playlist
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
