'use client';

import { motion } from 'framer-motion';
import { useRitualStore } from '@/store/useRitualStore';

export default function PulseSparkline() {
  const weeklyHistory = useRitualStore((state) => state.weeklyHistory);

  // Build exactly 7 bars, filling missing days with 0
  const today = new Date();
  const bars = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];

    const entry = weeklyHistory.find((e: any) => e.date === dateStr);
    if (!entry) return { date: dateStr, score: 0, label: d.toLocaleDateString('en', { weekday: 'narrow' }) };

    let score = 0;
    if (entry.feet_on_floor_logged) score += 25;
    if (entry.morning_ritual_done) score += 25;
    if (entry.sleep_quality && entry.sleep_quality > 0) score += 25;
    if (entry.win_of_the_day) score += 25;

    return { date: dateStr, score, label: d.toLocaleDateString('en', { weekday: 'narrow' }) };
  });

  const getBarColor = (score: number) => {
    if (score >= 75) return 'bg-accent-teal';
    if (score >= 50) return 'bg-accent-amber';
    return 'bg-muted';
  };

  // Silent when no data at all
  if (weeklyHistory.length === 0) return null;

  return (
    <div className="w-full mt-4">
      <div className="flex gap-2 items-end h-16 w-full justify-center">
        {bars.map((bar, index) => (
          <div key={bar.date} className="flex flex-col items-center gap-1">
            <motion.div
              className={`w-3 rounded-t-sm ${getBarColor(bar.score)}`}
              initial={{ height: 0 }}
              animate={{ height: `${Math.max(bar.score, 4)}%` }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              style={{ minHeight: bar.score > 0 ? '4px' : '2px' }}
            />
          </div>
        ))}
      </div>
      <div className="flex gap-2 w-full justify-center mt-1">
        {bars.map((bar) => (
          <span key={`label-${bar.date}`} className="w-3 text-center text-[8px] text-ink-tertiary">
            {bar.label}
          </span>
        ))}
      </div>
    </div>
  );
}
