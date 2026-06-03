'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { useRitualStore } from '@/store/useRitualStore';

export default function MorningCheckIn() {
  const [sleep, setSleep] = useState<number | null>(null);
  const [mood, setMood] = useState<number | null>(null);
  const [ritualDone, setRitualDone] = useState(false);
  
  // New State for Detailed Sleep
  const [bedTime, setBedTime] = useState<string>('22:30');
  const [duration, setDuration] = useState<string>('7.5');
  
  const { completeMorningCheckIn } = useRitualStore();

  const handleComplete = async () => {
    if (sleep === null || mood === null || !ritualDone || !bedTime || !duration) return;
    
    try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (e) {}
    
    completeMorningCheckIn(sleep, mood, bedTime, parseFloat(duration));
  };

  const isReady = sleep !== null && mood !== null && ritualDone && bedTime !== '' && duration !== '';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="p-6 mx-6 mt-8 rounded-2xl bg-surface border border-muted shadow-sm"
    >
      <h3 className="text-ink-primary font-semibold mb-6">Morning Check-in</h3>
      
      {/* Detailed Sleep Metrics */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <label className="text-ink-secondary text-xs uppercase tracking-widest mb-2 block">Bedtime</label>
          <input 
            type="time" 
            value={bedTime}
            onChange={(e) => setBedTime(e.target.value)}
            className="w-full bg-canvas border border-muted rounded-xl p-3 text-sm text-ink-primary focus:outline-none focus:border-accent-teal transition-colors"
          />
        </div>
        <div className="flex-1">
          <label className="text-ink-secondary text-xs uppercase tracking-widest mb-2 block">Hours</label>
          <input 
            type="number" 
            step="0.5"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full bg-canvas border border-muted rounded-xl p-3 text-sm text-ink-primary focus:outline-none focus:border-accent-teal transition-colors"
          />
        </div>
      </div>

      {/* Sleep Scale */}
      <div className="mb-6">
        <p className="text-ink-secondary text-sm mb-3">Sleep Quality</p>
        <div className="flex justify-between px-2">
          {[1, 2, 3, 4, 5].map((val, idx) => (
            <button
              key={`sleep-${idx}`}
              onClick={() => setSleep(idx)}
              className={`w-10 h-10 rounded-full border text-sm font-semibold transition-all ${
                sleep === idx 
                  ? 'bg-accent-teal/10 border-accent-teal text-accent-teal scale-110' 
                  : 'bg-canvas border-muted/50 text-ink-secondary hover:border-ink-secondary/50'
              }`}
            >
              {val}
            </button>
          ))}
        </div>
      </div>

      {/* Mood Scale */}
      <div className="mb-6">
        <p className="text-ink-secondary text-sm mb-3">How do you feel right now?</p>
        <div className="flex justify-between px-2">
          {[1, 2, 3, 4, 5].map((val, idx) => (
            <button
              key={`mood-${idx}`}
              onClick={() => setMood(idx)}
              className={`w-10 h-10 rounded-full border text-sm font-semibold transition-all ${
                mood === idx 
                  ? 'bg-accent-teal/10 border-accent-teal text-accent-teal scale-110' 
                  : 'bg-canvas border-muted/50 text-ink-secondary hover:border-ink-secondary/50'
              }`}
            >
              {val}
            </button>
          ))}
        </div>
      </div>

      {/* Ritual Checkbox */}
      <div className="mb-8 flex items-center gap-3">
        <button 
          onClick={() => setRitualDone(!ritualDone)}
          className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${ritualDone ? 'bg-success border-success' : 'border-muted'}`}
        >
          {ritualDone && <span className="text-surface text-sm">✓</span>}
        </button>
        <p className="text-ink-primary text-sm">Morning ritual done (30 min)</p>
      </div>

      <button
        onClick={handleComplete}
        disabled={!isReady}
        className={`w-full py-3 rounded-xl font-semibold transition-all ${isReady ? 'bg-ink-primary text-surface' : 'bg-muted text-ink-tertiary'}`}
      >
        Complete Check-in
      </button>
    </motion.div>
  );
}
