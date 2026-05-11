'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRitualStore } from '@/store/useRitualStore';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export default function AnchorManager({ onClose }: { onClose: () => void }) {
  const { anchors, addAnchor, removeAnchor } = useRitualStore();
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'body' | 'mind'>('body');

  const handleAdd = async () => {
    if (!newTitle.trim()) return;
    try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (e) {}
    
    addAnchor(newTitle.trim(), newCategory);
    setNewTitle('');
  };

  const handleRemove = async (id: string) => {
    try { await Haptics.impact({ style: ImpactStyle.Medium }); } catch (e) {}
    removeAnchor(id);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-overlay/20 backdrop-blur-sm sm:items-center"
    >
      <div className="w-full max-w-md bg-surface rounded-t-3xl sm:rounded-3xl p-6 shadow-lg border border-muted max-h-[85vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-ink-primary font-medium">Manage Anchors</h3>
          <button onClick={onClose} className="text-ink-tertiary hover:text-ink-primary p-2">
            ✕
          </button>
        </div>

        {/* Existing Anchors List */}
        <div className="space-y-3 mb-8">
          <AnimatePresence>
            {anchors.map((anchor) => (
              <motion.div 
                key={anchor.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center justify-between p-3 bg-canvas border border-muted rounded-xl"
              >
                <div>
                  <p className="text-sm font-medium text-ink-primary">{anchor.title}</p>
                  <p className="text-xs uppercase tracking-widest text-ink-tertiary">{anchor.category}</p>
                </div>
                <button 
                  onClick={() => handleRemove(anchor.id)}
                  className="text-error/70 hover:text-error text-sm p-2"
                >
                  Remove
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
          {anchors.length === 0 && (
            <p className="text-ink-tertiary text-sm text-center py-4">No anchors set.</p>
          )}
        </div>

        {/* Add New Anchor */}
        <div className="border-t border-muted pt-6">
          <h4 className="text-ink-secondary text-sm mb-4">Add New Anchor</h4>
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="e.g., 3.5L Water, Box Breathing"
            className="w-full bg-canvas border border-muted rounded-xl p-3 text-sm text-ink-primary placeholder:text-ink-tertiary focus:outline-none focus:border-accent-teal mb-4"
          />
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setNewCategory('body')}
              className={`flex-1 py-2 rounded-lg text-sm transition-colors ${newCategory === 'body' ? 'bg-ink-primary text-surface' : 'bg-muted text-ink-secondary'}`}
            >
              Body
            </button>
            <button
              onClick={() => setNewCategory('mind')}
              className={`flex-1 py-2 rounded-lg text-sm transition-colors ${newCategory === 'mind' ? 'bg-ink-primary text-surface' : 'bg-muted text-ink-secondary'}`}
            >
              Mind
            </button>
          </div>
          <button
            onClick={handleAdd}
            disabled={!newTitle.trim()}
            className={`w-full py-3 rounded-xl font-medium transition-all ${newTitle.trim() ? 'bg-accent-teal text-surface' : 'bg-muted text-ink-tertiary'}`}
          >
            Add Anchor
          </button>
        </div>
      </div>
    </motion.div>
  );
}
