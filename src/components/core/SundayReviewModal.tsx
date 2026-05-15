'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useRitualStore } from '@/store/useRitualStore';

export default function SundayReviewModal() {
  const { 
    lastWeeklyReviewDate, 
    completeWeeklyReview, 
    weeklyHistory, 
    weeklyPlantCount 
  } = useRitualStore();

  const today = new Date();
  const isSunday = today.getDay() === 0;
  const todayStr = today.toISOString().split('T')[0];

  const shouldShow = isSunday && lastWeeklyReviewDate !== todayStr;

  if (!shouldShow) return null;

  // Calculate Average Pulse
  const avgPulse = weeklyHistory.length > 0
    ? Math.round(
        weeklyHistory.reduce((acc: number, curr: any) => {
          let dayScore = 0;
          if (curr.feet_on_floor_logged) dayScore += 25;
          if (curr.morning_ritual_done) dayScore += 25;
          if (curr.sleep_quality && curr.sleep_quality > 0) dayScore += 25;
          if (curr.win_of_the_day) dayScore += 25;
          return acc + dayScore;
        }, 0) / 7
      )
    : 0;

  const plantDiversityPercent = Math.min(Math.round((weeklyPlantCount / 30) * 100), 100);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-canvas flex flex-col p-6 overflow-y-auto"
      >
        <div className="flex-1 flex flex-col items-center justify-center max-w-sm mx-auto w-full py-12">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-12"
          >
            <h2 className="text-accent-teal text-xs font-bold tracking-[0.2em] uppercase mb-4">
              Weekly Debrief
            </h2>
            <h1 className="text-ink-primary text-3xl font-serif">
              Sunday Reflection
            </h1>
          </motion.div>

          <div className="grid grid-cols-2 gap-4 w-full mb-12">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-surface p-5 rounded-2xl border border-muted shadow-sm flex flex-col items-center"
            >
              <span className="text-ink-secondary text-[10px] uppercase tracking-widest mb-2">Avg Pulse</span>
              <span className="text-3xl font-mono text-accent-teal">{avgPulse}%</span>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-surface p-5 rounded-2xl border border-muted shadow-sm flex flex-col items-center"
            >
              <span className="text-ink-secondary text-[10px] uppercase tracking-widest mb-2">Plants</span>
              <span className="text-3xl font-mono text-ink-primary">{weeklyPlantCount}</span>
              <div className="w-full h-1 bg-muted rounded-full mt-3 overflow-hidden">
                <div 
                  className="h-full bg-accent-teal transition-all duration-1000" 
                  style={{ width: `${plantDiversityPercent}%` }}
                />
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mb-12 px-4"
          >
            <p className="text-ink-secondary text-sm leading-relaxed mb-6">
              "Structure is the space within which we create."
            </p>
            <p className="text-ink-primary text-sm font-medium">
              Take 5 minutes to review your Notes of Life and plan the week ahead.
            </p>
          </motion.div>

          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            whileTap={{ scale: 0.98 }}
            onClick={completeWeeklyReview}
            className="w-full py-5 rounded-2xl bg-ink-primary text-surface font-semibold shadow-lg shadow-ink-primary/10 hover:shadow-xl transition-all"
          >
            Close Out Week & Enter Dashboard
          </motion.button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
