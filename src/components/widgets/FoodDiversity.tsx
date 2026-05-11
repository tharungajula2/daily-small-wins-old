'use client';

import { motion } from 'framer-motion';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { useRitualStore } from '@/store/useRitualStore';

export default function FoodDiversity() {
  const { weeklyPlantCount, incrementPlantCount } = useRitualStore();
  const progress = (weeklyPlantCount / 30) * 100;

  const handleAdd = async () => {
    if (weeklyPlantCount >= 30) return;
    try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (e) {}
    incrementPlantCount();
  };

  return (
    <div className="w-full p-5 mt-6 rounded-2xl bg-surface border border-muted shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-ink-secondary text-xs uppercase tracking-widest ml-1">
          Food Diversity (Weekly)
        </h3>
        <span className="text-xs text-ink-primary font-mono bg-canvas px-2 py-1 rounded-md border border-muted">
          {weeklyPlantCount} / 30
        </span>
      </div>

      {/* Progress Bar */}
      <div className="h-2 w-full bg-canvas rounded-full overflow-hidden mb-4 border border-muted/50">
        <motion.div 
          className="h-full bg-success"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      <button
        onClick={handleAdd}
        disabled={weeklyPlantCount >= 30}
        className={`w-full py-2.5 rounded-lg text-sm font-medium transition-all ${weeklyPlantCount < 30 ? 'bg-canvas border border-muted text-ink-primary hover:border-success/50' : 'bg-muted text-ink-tertiary'}`}
      >
        +1 Plant Source
      </button>
    </div>
  );
}
