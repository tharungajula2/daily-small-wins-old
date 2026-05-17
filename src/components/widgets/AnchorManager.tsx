'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRitualStore, PillarId, AnchorType } from '@/store/useRitualStore';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

const PILLAR_OPTIONS: { id: PillarId; label: string }[] = [
  { id: 'nutrition', label: 'Nutrition' },
  { id: 'movement', label: 'Movement' },
  { id: 'sleep', label: 'Sleep' },
  { id: 'stress_mental', label: 'Stress & Mental' },
  { id: 'social', label: 'Social' },
  { id: 'environment', label: 'Environment' }
];

export default function AnchorManager({ onClose }: { onClose: () => void }) {
  const { anchors, addAnchor, removeAnchor } = useRitualStore();
  const [newTitle, setNewTitle] = useState('');
  const [newPillarId, setNewPillarId] = useState<PillarId>('stress_mental');
  const [newType, setNewType] = useState<AnchorType>('action');
  const [newPrompt, setNewPrompt] = useState('');
  const [newBaseline, setNewBaseline] = useState('');

  const handleAdd = async () => {
    if (!newTitle.trim()) return;
    try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (e) {}
    
    addAnchor(
      newTitle.trim(),
      newPillarId,
      newType,
      newBaseline.trim() || undefined,
      newType === 'reflection' ? (newPrompt.trim() || undefined) : undefined
    );
    setNewTitle('');
    setNewBaseline('');
    setNewPrompt('');
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
                  <p className="text-xs uppercase tracking-widest text-ink-tertiary">
                    {PILLAR_OPTIONS.find(p => p.id === anchor.pillarId)?.label || anchor.pillarId} • {anchor.type}
                  </p>
                  {anchor.prompt && (
                    <p className="text-xs text-ink-secondary italic mt-0.5">Prompt: "{anchor.prompt}"</p>
                  )}
                  {anchor.baselineTitle && (
                    <p className="text-xs text-accent-amber/70 mt-1">↳ {anchor.baselineTitle}</p>
                  )}
                </div>
                <button 
                  onClick={() => handleRemove(anchor.id)}
                  className="text-error/70 hover:text-error text-sm p-2 text-right shrink-0"
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
          
          <label className="block text-xs uppercase tracking-widest text-ink-tertiary mb-1 ml-1">Title</label>
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="e.g., Cold Plunge, Read 10 Pages"
            className="w-full bg-canvas border border-muted rounded-xl p-3 text-sm text-ink-primary placeholder:text-ink-tertiary focus:outline-none focus:border-accent-teal mb-3"
          />
          
          <label className="block text-xs uppercase tracking-widest text-ink-tertiary mb-1 ml-1">Pillar</label>
          <select
            value={newPillarId}
            onChange={(e) => setNewPillarId(e.target.value as PillarId)}
            className="w-full bg-canvas border border-muted rounded-xl p-3 text-sm text-ink-primary focus:outline-none focus:border-accent-teal mb-3 appearance-none"
          >
            {PILLAR_OPTIONS.map(p => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </select>

          <label className="block text-xs uppercase tracking-widest text-ink-tertiary mb-1 ml-1">Type</label>
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setNewType('action')}
              className={`flex-1 py-2 rounded-lg text-sm transition-colors ${newType === 'action' ? 'bg-accent-teal text-surface' : 'bg-muted text-ink-secondary'}`}
            >
              Action
            </button>
            <button
              onClick={() => setNewType('reflection')}
              className={`flex-1 py-2 rounded-lg text-sm transition-colors ${newType === 'reflection' ? 'bg-accent-teal text-surface' : 'bg-muted text-ink-secondary'}`}
            >
              Reflection
            </button>
          </div>

          {newType === 'reflection' && (
            <>
              <label className="block text-xs uppercase tracking-widest text-ink-tertiary mb-1 ml-1">Mindfulness Prompt (Optional)</label>
              <input
                type="text"
                value={newPrompt}
                onChange={(e) => setNewPrompt(e.target.value)}
                placeholder="e.g., What did I learn from today's discomfort?"
                className="w-full bg-canvas border border-muted rounded-xl p-3 text-sm text-ink-primary placeholder:text-ink-tertiary focus:outline-none focus:border-accent-teal mb-3 animate-in slide-in-from-top-1 duration-200"
              />
            </>
          )}

          <label className="block text-xs uppercase tracking-widest text-ink-tertiary mb-1 ml-1">Baseline Title (Optional)</label>
          <input
            type="text"
            value={newBaseline}
            onChange={(e) => setNewBaseline(e.target.value)}
            placeholder="Baseline fallback (e.g., Read 1 page)"
            className="w-full bg-canvas border border-muted rounded-xl p-3 text-sm text-ink-primary placeholder:text-ink-tertiary focus:outline-none focus:border-accent-teal mb-4"
          />

          <button
            onClick={handleAdd}
            disabled={!newTitle.trim()}
            className={`w-full py-3 rounded-xl font-medium transition-all ${newTitle.trim() ? 'bg-ink-primary text-surface' : 'bg-muted text-ink-tertiary'}`}
          >
            Add Anchor
          </button>
        </div>
      </div>
    </motion.div>
  );
}
