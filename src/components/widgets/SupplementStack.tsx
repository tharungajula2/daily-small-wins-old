'use client';

import { motion } from 'framer-motion';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Supplement, useRitualStore } from '@/store/useRitualStore';

export default function SupplementStack({ onEdit }: { onEdit: () => void }) {
  const { supplements, toggleSupplement } = useRitualStore();

  const handleTap = async (id: string) => {
    try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (e) {}
    toggleSupplement(id);
  };

  const renderGroup = (timing: 'AM' | 'PM' | 'Evening', title: string) => {
    const group = supplements.filter(s => s.timing === timing);
    if (group.length === 0) return null;

    return (
      <div className="mb-6 last:mb-0">
        <h4 className="text-ink-tertiary text-xs uppercase tracking-widest mb-3 ml-1">{title}</h4>
        <div className="space-y-2">
          {group.map((sup) => (
            <motion.button
              key={sup.id}
              onClick={() => handleTap(sup.id)}
              whileTap={{ scale: 0.98 }}
              className={`w-full flex items-center justify-between p-3 rounded-xl border transition-colors ${
                sup.taken ? 'bg-canvas border-success/30' : 'bg-surface border-muted hover:border-accent-teal/50'
              }`}
            >
              <span className={`text-sm transition-colors text-left ${sup.taken ? 'text-success line-through opacity-70' : 'text-ink-primary'}`}>
                {sup.name}
              </span>
              <div className={`shrink-0 ml-3 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                sup.taken ? 'bg-success border-success' : 'border-muted'
              }`}>
                {sup.taken && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-surface text-xs">✓</motion.span>}
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full p-5 mt-6 rounded-2xl bg-surface border border-muted shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h3 className="text-ink-primary font-medium">Supplement Stack</h3>
          <button 
            onClick={onEdit}
            className="text-ink-tertiary hover:text-accent-teal text-xs uppercase tracking-widest transition-colors"
          >
            Edit
          </button>
        </div>
        <span className="text-xs text-ink-secondary bg-canvas px-2 py-1 rounded-md border border-muted">
          {supplements.filter(s => s.taken).length} / {supplements.length}
        </span>
      </div>
      
      {renderGroup('AM', 'Morning Protocol')}
      {renderGroup('PM', 'Afternoon / Lunch')}
      {renderGroup('Evening', 'Evening Wind-down')}
    </div>
  );
}
