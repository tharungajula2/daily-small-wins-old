'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRitualStore } from '@/store/useRitualStore';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { ChevronLeft, CheckCircle2, Sparkles, BookOpen } from 'lucide-react';

export default function SundayDebrief() {
  const router = useRouter();
  const supabase = createClient();
  const { anchors, addAnchor, toggleAnchor, completeWeeklyReview } = useRitualStore();

  const [isSunday, setIsSunday] = useState<boolean | null>(null);
  const [worked, setWorked] = useState('');
  const [brokeDown, setBrokeDown] = useState('');
  const [changeText, setChangeText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    // Confirm Sunday status (Sunday === 0)
    setIsSunday(new Date().getDay() === 0);
  }, []);

  if (isSunday === null) {
    return (
      <div className="min-h-screen bg-[#1C1C1E] flex items-center justify-center text-ink-secondary">
        <div className="animate-pulse text-xs tracking-widest uppercase">Initializing Debrief...</div>
      </div>
    );
  }

  if (!isSunday) {
    return (
      <div className="min-h-screen bg-[#1C1C1E] text-[#F7F6F2] flex flex-col items-center justify-center p-6 text-center select-none">
        <div className="w-16 h-16 rounded-full bg-[#2C2C2E] flex items-center justify-center mb-6">
          <BookOpen className="w-6 h-6 text-[#2A7F7F]" />
        </div>
        <h1 className="text-lg font-bold tracking-wider">Weekly Debrief Locked</h1>
        <p className="text-xs text-[#8E8E93] mt-2 max-w-[260px] leading-relaxed">
          Your weekly debrief opens on Sunday. Stay steady, focus on structure.
        </p>
        <button
          onClick={() => router.push('/')}
          className="mt-6 px-5 py-2.5 rounded-xl bg-[#2C2C2E] text-xs font-semibold text-[#F7F6F2] hover:bg-[#3A3A3C] transition-all"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!worked.trim() || !brokeDown.trim() || !changeText.trim()) return;

    setIsSubmitting(true);

    try {
      // 1. Check if "Sunday Weekly Debrief" anchor already exists in the store
      let debriefAnchor = anchors.find(
        (a) => a.title === 'Sunday Weekly Debrief' && a.pillarId === 'stress_mental'
      );

      // If it doesn't exist, create it dynamically
      if (!debriefAnchor) {
        addAnchor(
          'Sunday Weekly Debrief',
          'stress_mental',
          'reflection',
          undefined,
          'Three prompts: what worked, what broke down, and one change.'
        );
        
        // Find it in the newly updated state
        const updatedAnchors = useRitualStore.getState().anchors;
        debriefAnchor = updatedAnchors.find(
          (a) => a.title === 'Sunday Weekly Debrief' && a.pillarId === 'stress_mental'
        );
      }

      if (debriefAnchor) {
        const structuredReflectionText = `WHAT WORKED:\n${worked}\n\nWHAT BROKE DOWN:\n${brokeDown}\n\nCHANGE FOR NEXT WEEK:\n${changeText}`;
        
        // 2. Complete and log reflection to Zustand and remote database
        toggleAnchor(debriefAnchor.id, false, structuredReflectionText);
        
        // 3. Mark the review completed in the store
        completeWeeklyReview();
        
        setIsSuccess(true);
        setTimeout(() => {
          router.push('/');
        }, 1500);
      }
    } catch (err) {
      console.error('Failed to submit weekly review:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1C1C1E] text-[#F7F6F2] flex flex-col font-sans max-w-md mx-auto sm:border-x sm:border-[#2C2C2E]">
      {/* Header */}
      <header className="h-14 border-b border-[#2C2C2E]/60 flex items-center px-4 justify-between bg-[#1C1C1E]/80 backdrop-blur-md sticky top-0 z-50">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-1.5 text-xs text-ink-secondary hover:text-[#F7F6F2] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#2A7F7F]">
          Sunday Debrief
        </span>
        <div className="w-12" />
      </header>

      <div className="flex-1 p-6 flex flex-col justify-between">
        <AnimatePresence mode="wait">
          {!isSuccess ? (
            <motion.form
              key="debrief-form"
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="flex flex-col gap-6"
            >
              <div>
                <span className="text-[9px] uppercase tracking-widest text-[#2A7F7F] font-bold">
                  Reflection Circle
                </span>
                <h1 className="text-xl font-semibold tracking-tight mt-1 text-[#F7F6F2]">
                  Close Out Your Week
                </h1>
                <p className="text-xs text-[#8E8E93] mt-1.5 leading-relaxed">
                  Be direct. Honest reflection lowers stress cortisol and locks in clinical habit loops.
                </p>
              </div>

              {/* Prompt 1 */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-[#F7F6F2]">
                  1. What worked this week?
                </label>
                <textarea
                  required
                  value={worked}
                  onChange={(e) => setWorked(e.target.value)}
                  placeholder="One paragraph on what habits felt stable and fluid..."
                  className="w-full bg-[#2C2C2E] border border-[#3A3A3C] rounded-xl p-3.5 text-xs text-[#F7F6F2] placeholder-[#5C5C5E] focus:outline-none focus:border-[#2A7F7F] transition-all min-h-[90px] leading-relaxed resize-none"
                />
              </div>

              {/* Prompt 2 */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-[#F7F6F2]">
                  2. What broke down?
                </label>
                <textarea
                  required
                  value={brokeDown}
                  onChange={(e) => setBrokeDown(e.target.value)}
                  placeholder="Which specific anchor slipped, and what was the core trigger?"
                  className="w-full bg-[#2C2C2E] border border-[#3A3A3C] rounded-xl p-3.5 text-xs text-[#F7F6F2] placeholder-[#5C5C5E] focus:outline-none focus:border-[#2A7F7F] transition-all min-h-[90px] leading-relaxed resize-none"
                />
              </div>

              {/* Prompt 3 */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-[#F7F6F2]">
                  3. One change for next week
                </label>
                <textarea
                  required
                  value={changeText}
                  onChange={(e) => setChangeText(e.target.value)}
                  placeholder="Target dynamic: anchor, specific time, and cue..."
                  className="w-full bg-[#2C2C2E] border border-[#3A3A3C] rounded-xl p-3.5 text-xs text-[#F7F6F2] placeholder-[#5C5C5E] focus:outline-none focus:border-[#2A7F7F] transition-all min-h-[90px] leading-relaxed resize-none"
                />
              </div>

              <div className="flex items-center gap-2 p-3.5 rounded-xl bg-[#2A7F7F]/5 border border-[#2A7F7F]/10 text-[10px] text-[#2A7F7F] font-medium mt-1 leading-relaxed">
                <Sparkles className="w-4 h-4 flex-shrink-0" />
                Reflections are committed as clinical Type B logs under the Stress & Mental Health pillar.
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !worked.trim() || !brokeDown.trim() || !changeText.trim()}
                className="w-full py-4 mt-2 rounded-xl bg-[#2A7F7F] text-xs font-bold text-white hover:bg-[#206363] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md flex items-center justify-center gap-2"
              >
                {isSubmitting ? 'Committing Logs...' : 'Submit Debrief & Reset Week'}
              </button>
            </motion.form>
          ) : (
            <motion.div
              key="success-screen"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex flex-col items-center justify-center text-center py-16 gap-4"
            >
              <div className="w-14 h-14 rounded-full bg-[#2A7F7F]/10 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7 text-[#2A7F7F]" />
              </div>
              <h2 className="text-lg font-bold tracking-wide">Debrief Complete</h2>
              <p className="text-xs text-[#8E8E93] max-w-[220px] leading-relaxed">
                Weekly reflection logged. Entering the dashboard...
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
