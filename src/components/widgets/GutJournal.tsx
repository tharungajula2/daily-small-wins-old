'use client';

import { motion } from 'framer-motion';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { useRitualStore } from '@/store/useRitualStore';

const SCALE = [1, 2, 3, 4, 5];

export default function GutJournal() {
  const { morningGut, eveningGut, logMorningGut, logEveningGut, hasSeenGutTooltip, dismissTooltip } = useRitualStore();

  const handleTap = async (type: 'morning' | 'evening', score: number) => {
    try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (e) {}
    if (type === 'morning') logMorningGut(score);
    else logEveningGut(score);
  };

  const renderScale = (type: 'morning' | 'evening', currentValue: number | null, label: string, descLow: string, descHigh: string) => (
    <div className="mb-6 last:mb-0">
      <div className="flex justify-between items-end mb-3">
        <h4 className="text-ink-primary text-sm font-medium">{label}</h4>
        {currentValue !== null && (
          <span className="text-xs text-success font-medium flex items-center gap-1">
            Logged <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}>✓</motion.span>
          </span>
        )}
      </div>
      <div className="flex justify-between items-center gap-2 mb-2">
        {SCALE.map((score) => (
          <button
            key={score}
            onClick={() => handleTap(type, score)}
            className={`flex-1 h-10 rounded-lg text-sm font-mono transition-colors ${
              currentValue === score 
                ? 'bg-accent-teal text-surface shadow-sm' 
                : 'bg-canvas border border-muted text-ink-secondary hover:border-accent-teal/50'
            }`}
          >
            {score}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-[10px] text-ink-tertiary uppercase tracking-widest px-1">
        <span>{descLow}</span>
        <span>{descHigh}</span>
      </div>
    </div>
  );

  const hasPending = morningGut === null || eveningGut === null;

  return (
    <div className={`w-full p-5 rounded-2xl bg-surface border shadow-sm ${hasPending ? 'border-l-2 border-accent-teal border-y-muted border-r-muted' : 'border-muted'}`}>
      <h3 className="text-ink-primary text-xs font-semibold tracking-widest uppercase mb-5 ml-1">
        Gut-Brain Axis
      </h3>

      {!hasSeenGutTooltip && (
        <div className="mb-4 p-3 bg-accent-teal/5 border border-accent-teal/10 rounded-lg flex items-start justify-between gap-3">
          <p className="text-xs text-ink-secondary leading-relaxed">
            Your gut and brain are connected. Tracking both helps you spot what affects your digestion and mood.
          </p>
          <button 
            onClick={() => dismissTooltip('hasSeenGutTooltip')}
            className="text-ink-tertiary hover:text-ink-primary p-1"
          >
            ✕
          </button>
        </div>
      )}
      
      {renderScale(
        'morning', 
        morningGut, 
        'Morning Digestion & Calm', 
        'Poor', 
        'Optimal'
      )}
      <div className="h-px w-full bg-muted my-5" />
      {renderScale(
        'evening', 
        eveningGut, 
        'Evening Vagal Tone / Comfort', 
        'Stressed', 
        'Rest & Digest'
      )}
    </div>
  );
}
