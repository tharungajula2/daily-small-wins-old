'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRitualStore } from '@/store/useRitualStore';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export default function SupplementManager({ onClose }: { onClose: () => void }) {
  const { supplements, addSupplement, removeSupplement } = useRitualStore();
  const [newName, setNewName] = useState('');
  const [newDosage, setNewDosage] = useState('');
  const [newInstruction, setNewInstruction] = useState('');
  const [newTiming, setNewTiming] = useState<'AM' | 'PM' | 'Evening'>('AM');

  const handleAdd = async () => {
    if (!newName.trim()) return;
    try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (e) {}
    
    addSupplement(newName.trim(), newTiming, newDosage.trim() || undefined, newInstruction.trim() || undefined);
    setNewName('');
    setNewDosage('');
    setNewInstruction('');
  };

  const handleRemove = async (id: string) => {
    try { await Haptics.impact({ style: ImpactStyle.Medium }); } catch (e) {}
    removeSupplement(id);
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
          <h3 className="text-ink-primary font-medium">Manage Supplements</h3>
          <button onClick={onClose} className="text-ink-tertiary hover:text-ink-primary p-2">
            ✕
          </button>
        </div>

        {/* Existing Supplements List */}
        <div className="space-y-3 mb-8">
          <AnimatePresence>
            {supplements.map((sup) => (
              <motion.div 
                key={sup.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center justify-between p-3 bg-canvas border border-muted rounded-xl"
              >
                <div>
                  <p className="text-sm font-medium text-ink-primary">{sup.name}{sup.dosage ? ` ${sup.dosage}` : ''}</p>
                  <p className="text-xs uppercase tracking-widest text-ink-tertiary">
                    {sup.timing} {sup.instruction && `• ${sup.instruction}`}
                  </p>
                </div>
                <button 
                  onClick={() => handleRemove(sup.id)}
                  className="text-error/70 hover:text-error text-sm p-2"
                >
                  Remove
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
          {supplements.length === 0 && (
            <p className="text-ink-tertiary text-sm text-center py-4">No supplements set.</p>
          )}
        </div>

        {/* Add New Supplement */}
        <div className="border-t border-muted pt-6">
          <h4 className="text-ink-secondary text-sm mb-4">Add New Supplement</h4>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="e.g., Vitamin C, Ashwagandha"
            className="w-full bg-canvas border border-muted rounded-xl p-3 text-sm text-ink-primary placeholder:text-ink-tertiary focus:outline-none focus:border-accent-teal mb-3"
          />
          <div className="flex gap-3 mb-4">
            <input
              type="text"
              value={newDosage}
              onChange={(e) => setNewDosage(e.target.value)}
              placeholder="Dosage (Optional)"
              className="flex-1 bg-canvas border border-muted rounded-xl p-3 text-sm text-ink-primary placeholder:text-ink-tertiary focus:outline-none focus:border-accent-teal min-w-0"
            />
            <input
              type="text"
              value={newInstruction}
              onChange={(e) => setNewInstruction(e.target.value)}
              placeholder="Instructions (Optional)"
              className="flex-1 bg-canvas border border-muted rounded-xl p-3 text-sm text-ink-primary placeholder:text-ink-tertiary focus:outline-none focus:border-accent-teal min-w-0"
            />
          </div>
          <div className="flex gap-2 mb-4">
            {(['AM', 'PM', 'Evening'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setNewTiming(t)}
                className={`flex-1 py-2 rounded-lg text-sm transition-colors ${newTiming === t ? 'bg-ink-primary text-surface' : 'bg-muted text-ink-secondary'}`}
              >
                {t}
              </button>
            ))}
          </div>
          <button
            onClick={handleAdd}
            disabled={!newName.trim()}
            className={`w-full py-3 rounded-xl font-medium transition-all ${newName.trim() ? 'bg-accent-teal text-surface' : 'bg-muted text-ink-tertiary'}`}
          >
            Add Supplement
          </button>
        </div>
      </div>
    </motion.div>
  );
}
