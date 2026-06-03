'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useRitualStore } from '@/store/useRitualStore';
import { ArrowLeft } from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const addAnchor = useRitualStore(state => state.addAnchor);

  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [wakeTime, setWakeTime] = useState('07:00');
  const [sleepTime, setSleepTime] = useState('23:00');
  const [firstAnchor, setFirstAnchor] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = () => {
    setDirection(1);
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setDirection(-1);
    setStep(prev => prev - 1);
  };

  const handleComplete = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        router.push('/login');
        return;
      }
      const uid = session.user.id;

      // 1. Supabase UPSERT to user_state
      const { error: stateErr } = await supabase
        .from('user_state')
        .upsert({
          user_id: uid,
          hardest_pillar: null,
          pause_tokens_remaining: 2,
          current_streak: 0,
          longest_streak: 0,
          lifetime_anchor_count: 0
        }, { onConflict: 'user_id' });

      if (stateErr) throw stateErr;

      // 2. Set wake/sleep windows in the store
      const store = useRitualStore.getState();
      store.setWakeWindow(wakeTime);
      store.setSleepWindow(sleepTime);

      // 3. Clear old anchors and insert first anchor if named
      useRitualStore.setState({ anchors: [] });

      if (firstAnchor.trim()) {
        addAnchor(
          firstAnchor.trim(),
          null,
          'action',
          undefined,
          undefined,
          [],
          ['all']
        );
      }

      // 4. Enter application
      router.push('/');
    } catch (err) {
      console.error("Onboarding setup failure:", err);
      setIsSubmitting(false);
    }
  };

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? '100%' : '-100%',
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (dir: number) => ({
      x: dir < 0 ? '100%' : '-100%',
      opacity: 0
    })
  };

  return (
    <main className="min-h-screen max-w-md mx-auto bg-canvas bg-[#F7F6F2] relative flex flex-col justify-between p-6 sm:border-x sm:border-muted shadow-sm select-none">
      
      {/* 1. Header Navigation and Progress Indicators */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between h-8 relative">
          {step > 1 ? (
            <button 
              onClick={handleBack} 
              className="text-ink-secondary hover:text-ink-primary transition-colors flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          ) : (
            <div className="w-8" />
          )}

          {/* Simple step indicator */}
          <span className="text-[10px] font-bold tracking-widest text-ink-secondary uppercase">
            Step {step} of 3
          </span>

          <div className="w-8" />
        </div>

        {/* Subtle, calm dots progress indicator */}
        <div className="flex justify-center gap-2 mt-2">
          {[1, 2, 3].map((num) => (
            <div 
              key={num} 
              className={`h-2 rounded-full transition-all duration-300 ${
                num === step ? 'bg-accent-teal w-5' : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </div>

      {/* 2. Slide Container */}
      <div className="flex-1 flex flex-col justify-center py-8 relative overflow-hidden">
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="w-full flex flex-col gap-6"
          >
            {/* SCREEN 1: Set Windows */}
            {step === 1 && (
              <div className="flex flex-col gap-6 text-left">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight text-ink-primary">
                    Set your windows
                  </h2>
                  <p className="text-xs text-ink-secondary tracking-wide uppercase mt-1 font-semibold">
                    Establish your target boundaries
                  </p>
                </div>
                <p className="text-sm text-ink-secondary leading-relaxed font-normal">
                  Your daily Arc is built around these times. We use them to structure your morning start and evening wind-down window.
                </p>
                
                <div className="flex flex-col gap-4">
                  <div className="bg-surface rounded-2xl border border-muted p-4 flex flex-col shadow-sm select-none gap-2">
                    <span className="text-[10px] tracking-wider text-ink-secondary uppercase font-semibold">
                      Wake Window Target
                    </span>
                    <input 
                      type="time" 
                      value={wakeTime}
                      onChange={(e) => setWakeTime(e.target.value)}
                      className="w-full bg-canvas border border-muted/50 text-ink-primary font-semibold text-center py-3 px-4 rounded-xl focus:outline-none focus:border-accent-teal text-2xl select-none"
                    />
                  </div>

                  <div className="bg-surface rounded-2xl border border-muted p-4 flex flex-col shadow-sm select-none gap-2">
                    <span className="text-[10px] tracking-wider text-ink-secondary uppercase font-semibold">
                      Sleep Window Target
                    </span>
                    <input 
                      type="time" 
                      value={sleepTime}
                      onChange={(e) => setSleepTime(e.target.value)}
                      className="w-full bg-canvas border border-muted/50 text-ink-primary font-semibold text-center py-3 px-4 rounded-xl focus:outline-none focus:border-accent-teal text-2xl select-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SCREEN 2: Meet The Arc */}
            {step === 2 && (
              <div className="flex flex-col gap-6 text-left">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight text-ink-primary">
                    Meet The Arc
                  </h2>
                  <p className="text-xs text-ink-secondary tracking-wide uppercase mt-1 font-semibold">
                    The one promise you keep every day
                  </p>
                </div>

                <div className="bg-surface rounded-2xl border border-muted p-6 flex flex-col shadow-sm gap-4">
                  <p className="text-sm text-ink-primary leading-relaxed font-normal">
                    This is the foundational rhythm of Trelis Life.
                  </p>
                  <div className="border-l-2 border-accent-teal pl-3 py-1">
                    <p className="text-xs text-ink-secondary leading-relaxed font-normal">
                      The Arc opens in the morning when you wake, and closes at night with your wind-down reflections. It centers your day in a single, simple promise.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* SCREEN 3: Name your first anchor */}
            {step === 3 && (
              <div className="flex flex-col gap-6 text-left">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight text-ink-primary">
                    Your First Anchor
                  </h2>
                  <p className="text-xs text-ink-secondary tracking-wide uppercase mt-1 font-semibold">
                    Name your daily anchor
                  </p>
                </div>
                <p className="text-sm text-ink-secondary leading-relaxed font-normal">
                  What's the one thing that, when you skip it, the day quietly falls apart?
                </p>
                
                <div className="bg-surface rounded-2xl border border-muted p-6 flex flex-col shadow-sm select-none gap-4">
                  <input 
                    type="text" 
                    placeholder="e.g. Morning Walk, Read 10 Pages, Meditate"
                    value={firstAnchor}
                    onChange={(e) => setFirstAnchor(e.target.value)}
                    className="w-full bg-canvas border border-muted text-ink-primary font-semibold text-left py-3 px-4 rounded-xl focus:outline-none focus:border-accent-teal text-base select-none"
                  />
                  <p className="text-[10px] text-ink-secondary leading-normal">
                    Leave blank to skip. You can always add, edit, or customize your anchors later inside the app.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 3. Footer Action Button */}
      <div className="mt-4">
        {step < 3 ? (
          <button
            onClick={handleNext}
            className="w-full py-4 rounded-2xl font-semibold text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 active:scale-98 shadow-sm bg-accent-teal text-surface hover:bg-accent-teal/95"
          >
            Continue
          </button>
        ) : (
          <button
            onClick={handleComplete}
            disabled={isSubmitting}
            className={`w-full py-4 rounded-2xl font-semibold text-sm uppercase tracking-widest bg-accent-teal text-surface hover:bg-accent-teal/95 transition-all flex items-center justify-center gap-2 active:scale-98 shadow-sm ${
              isSubmitting ? 'opacity-70 cursor-wait' : ''
            }`}
          >
            {isSubmitting ? 'Building Structure...' : 'Enter Trelis Life'}
          </button>
        )}
      </div>
    </main>
  );
}
