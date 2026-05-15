'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { useRitualStore } from '@/store/useRitualStore';

export default function NotesOfLife() {
  const { lifeNotes, addLifeNote, removeLifeNote } = useRitualStore();
  const [isAdding, setIsAdding] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [content, setContent] = useState('');
  const [attribution, setAttribution] = useState('');

  const handleSave = async () => {
    if (!content.trim()) return;
    try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (e) {}
    addLifeNote(content.trim(), attribution.trim());
    setContent('');
    setAttribution('');
    setIsAdding(false);
  };

  const handleDelete = async (id: string) => {
    try { await Haptics.impact({ style: ImpactStyle.Medium }); } catch (e) {}
    removeLifeNote(id);
  };

  return (
    <div className="w-full p-5 rounded-2xl bg-surface border border-muted shadow-sm">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between focus:outline-none"
      >
        <h3 className="text-ink-primary text-xs font-semibold tracking-widest uppercase ml-1">
          Notes of Life
        </h3>
        <div className="flex items-center gap-3">
          {isExpanded && !isAdding && (
            <span 
              onClick={(e) => { e.stopPropagation(); setIsAdding(true); }}
              className="text-xs text-ink-tertiary hover:text-accent-teal transition-colors flex items-center gap-1"
            >
              <span className="text-lg leading-none">+</span> Add Note
            </span>
          )}
          <span className="text-ink-tertiary text-lg font-light leading-none">{isExpanded ? '−' : '+'}</span>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-4">
              <AnimatePresence mode="wait">
                {isAdding && (
                  <motion.div key="add-form" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-6 overflow-hidden">
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="What's on your mind?"
                      className="w-full bg-canvas border border-muted rounded-xl p-3 text-sm text-ink-primary focus:outline-none focus:border-accent-teal transition-colors min-h-[80px] mb-2"
                    />
                    <input
                      type="text"
                      value={attribution}
                      onChange={(e) => setAttribution(e.target.value)}
                      placeholder="Attribution (e.g., Marcus Aurelius) - Optional"
                      className="w-full bg-canvas border border-muted rounded-xl p-3 text-sm text-ink-primary focus:outline-none focus:border-accent-teal transition-colors mb-3"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => setIsAdding(false)}
                        className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-muted text-ink-secondary hover:text-ink-primary transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={!content.trim()}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${content.trim() ? 'bg-ink-primary text-surface' : 'bg-muted text-ink-tertiary'}`}
                      >
                        Save Note
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                <AnimatePresence>
                  {lifeNotes.length === 0 && !isAdding && (
                     <p className="text-xs text-ink-tertiary text-center py-4 italic">No notes yet. Capture an insight.</p>
                  )}
                  {lifeNotes.map((note) => (
                    <motion.div 
                      key={note.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="p-4 bg-canvas rounded-xl border border-muted/50 group relative"
                    >
                      <p className="text-sm text-ink-primary leading-relaxed">&ldquo;{note.content}&rdquo;</p>
                      {note.attribution && (
                        <p className="text-xs text-ink-tertiary mt-2 font-medium">— {note.attribution}</p>
                      )}
                      <button 
                        onClick={() => handleDelete(note.id)}
                        className="absolute top-2 right-2 p-2 opacity-0 group-hover:opacity-100 text-error/50 hover:text-error transition-opacity"
                        aria-label="Delete note"
                      >
                        ✕
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
