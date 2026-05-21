'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useRitualStore } from '@/store/useRitualStore';
import { defaultStarterAnchors } from '@/utils/defaultAnchors';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import Image from 'next/image';

const PILLARS = [
  { id: 'nutrition', title: 'Nutrition', icon: '🥑', description: 'Fuel your mind and body.' },
  { id: 'movement', title: 'Movement', icon: '💪', description: 'Keep your physical engine active.' },
  { id: 'sleep', title: 'Sleep', icon: '🌙', description: 'Power your recovery cycle.' },
  { id: 'stress_mental', title: 'Stress & Mental', icon: '🧘', description: 'Re-center your perspective.' },
  { id: 'social', title: 'Social Connection', icon: '🤝', description: 'Build intentional life lines.' },
  { id: 'environment', title: 'Environment', icon: '🌱', description: 'Optimize your sensory space.' }
];

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const addAnchor = useRitualStore(state => state.addAnchor);

  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [wakeTime, setWakeTime] = useState('07:00');
  const [hardestPillar, setHardestPillar] = useState<string | null>(null);
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
    if (!hardestPillar || isSubmitting) return;
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
          hardest_pillar: hardestPillar,
          pause_tokens_remaining: 2,
          current_streak: 0,
          longest_streak: 0,
          lifetime_anchor_count: 0
        }, { onConflict: 'user_id' });

      if (stateErr) throw stateErr;

      // 2. Inject starter anchors to local Zustand store
      // Clear old default anchors if they exist to prevent duplicates
      useRitualStore.setState({ anchors: [] });

      defaultStarterAnchors.forEach(a => {
        addAnchor(
          a.title,
          a.pillarId,
          a.type,
          a.baselineTitle,
          a.prompt,
          [],
          ['all']
        );
      });

      // 3. Post-patch metrics to Supabase user_anchors table
      setTimeout(async () => {
        const { data: userAnchors } = await supabase
          .from('user_anchors')
          .select('id, title')
          .eq('user_id', uid);

        if (userAnchors) {
          for (const item of userAnchors) {
            const match = defaultStarterAnchors.find(da => da.title === item.title);
            if (match && match.baselineTarget) {
              await supabase
                .from('user_anchors')
                .update({ baseline_target: match.baselineTarget })
                .eq('id', item.id);
            }
          }
        }
      }, 2000);

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
            Step {step} of 5
          </span>

          <div className="w-8" />
        </div>

        {/* 5-step thin tick indicator */}
        <div className="flex gap-1.5 w-full justify-between">
          {[1, 2, 3, 4, 5].map((num) => (
            <div 
              key={num} 
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                num <= step ? 'bg-accent-teal' : 'bg-muted'
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
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="w-full flex flex-col gap-6"
          >
            {/* SCREEN 1: Welcome Screen */}
            {step === 1 && (
              <div className="flex flex-col gap-6 text-left">
                <div className="w-14 h-14 rounded-2xl bg-surface flex items-center justify-center shadow-sm select-none mb-2">
                  <Image src="/logo-transparent.png" alt="Trelis Life Logo" width={36} height={36} className="object-contain" />
                </div>
                <h2 className="text-3xl font-bold tracking-tight text-ink-primary select-none">
                  Hi.
                </h2>
                <p className="text-base text-ink-secondary leading-relaxed font-normal">
                  Trelis Life is a daily checklist for the 6 things that decide how you feel.
                </p>
                <p className="text-base text-ink-secondary leading-relaxed font-normal">
                  No tracking, no judgment, just anchors.
                </p>
              </div>
            )}

            {/* SCREEN 2: Six Pillars Grid */}
            {step === 2 && (
              <div className="flex flex-col gap-4 text-left">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-ink-primary">
                    The 6 Pillars
                  </h2>
                  <p className="text-xs text-ink-secondary tracking-wide uppercase mt-1 font-medium">
                    These form your Concentric Daily Pulse
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-2">
                  {PILLARS.map((p) => (
                    <div 
                      key={p.id} 
                      className="p-4 rounded-xl bg-surface border border-muted flex flex-col gap-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                    >
                      <span className="text-lg select-none">{p.icon}</span>
                      <h4 className="text-xs font-semibold text-ink-primary select-none">
                        {p.title}
                      </h4>
                      <p className="text-[10px] text-ink-secondary leading-normal font-normal">
                        {p.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SCREEN 3: Wake Window Picker */}
            {step === 3 && (
              <div className="flex flex-col gap-6 text-left">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-ink-primary">
                    Wake Window
                  </h2>
                  <p className="text-xs text-ink-secondary tracking-wide uppercase mt-1 font-medium">
                    When do you usually wake up?
                  </p>
                </div>
                <p className="text-sm text-ink-secondary leading-relaxed">
                  We use this to organize your Morning Checklist Stack before the day takes over.
                </p>
                
                <div className="bg-surface rounded-2xl border border-muted p-6 flex flex-col items-center justify-center shadow-sm select-none gap-4">
                  <input 
                    type="time" 
                    value={wakeTime}
                    onChange={(e) => setWakeTime(e.target.value)}
                    className="w-full bg-canvas border border-muted text-ink-primary font-semibold text-center py-4 px-6 rounded-2xl focus:outline-none focus:border-accent-teal text-3xl select-none"
                  />
                  <span className="text-[10px] tracking-wider text-ink-secondary uppercase font-medium">
                    Native Time Picker
                  </span>
                </div>
              </div>
            )}

            {/* SCREEN 4: Pillar Weighting */}
            {step === 4 && (
              <div className="flex flex-col gap-4 text-left">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-ink-primary">
                    Friction Check
                  </h2>
                  <p className="text-xs text-ink-secondary tracking-wide uppercase mt-1 font-medium">
                    Which one is hardest for you right now?
                  </p>
                </div>
                <p className="text-sm text-ink-secondary leading-relaxed">
                  Your highest friction point is where structure matters most. We will watch this pillar closely.
                </p>

                <div className="flex flex-col gap-2 max-h-[45vh] overflow-y-auto pr-1">
                  {PILLARS.map((p) => {
                    const isSelected = hardestPillar === p.id;
                    return (
                      <div 
                        key={p.id}
                        onClick={() => setHardestPillar(p.id)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                          isSelected 
                            ? 'border-accent-teal bg-accent-teal/[0.02] shadow-sm' 
                            : 'border-muted bg-surface hover:border-muted/80'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg select-none">{p.icon}</span>
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-ink-primary">
                              {p.title}
                            </span>
                            <span className="text-[10px] text-ink-secondary">
                              {p.description}
                            </span>
                          </div>
                        </div>
                        <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-accent-teal bg-accent-teal' : 'border-muted'
                        }`}>
                          {isSelected && <span className="text-surface text-[10px] font-bold">✓</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SCREEN 5: Starter Templates Done */}
            {step === 5 && (
              <div className="flex flex-col gap-4 text-left">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-ink-primary">
                    Day 1 Ready
                  </h2>
                  <p className="text-xs text-ink-secondary tracking-wide uppercase mt-1 font-medium">
                    Your starter anchors are configured
                  </p>
                </div>
                <p className="text-sm text-ink-secondary leading-relaxed">
                  We have added 8 starter anchors. You can modify, delete, or add custom anchors anytime.
                </p>

                <div className="flex flex-col gap-2 max-h-[35vh] overflow-y-auto bg-surface border border-muted rounded-2xl p-4 shadow-inner">
                  {defaultStarterAnchors.map((a, idx) => (
                    <div key={idx} className="flex items-center justify-between py-1.5 border-b border-muted/50 last:border-b-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs select-none">
                          {PILLARS.find(p => p.id === a.pillarId)?.icon || '⚓'}
                        </span>
                        <span className="text-xs font-medium text-ink-primary truncate max-w-[200px]">
                          {a.title}
                        </span>
                      </div>
                      <span className="text-[8px] font-semibold tracking-wider text-ink-secondary bg-canvas px-1.5 py-0.5 rounded-sm select-none uppercase">
                        {PILLARS.find(p => p.id === a.pillarId)?.title || 'Pillar'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 3. Footer Action Button */}
      <div className="mt-4">
        {step < 5 ? (
          <button
            onClick={handleNext}
            disabled={step === 4 && !hardestPillar}
            className={`w-full py-4 rounded-2xl font-semibold text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 active:scale-98 shadow-sm ${
              step === 4 && !hardestPillar
                ? 'bg-ink-tertiary/20 text-ink-tertiary cursor-not-allowed'
                : 'bg-accent-teal text-surface hover:bg-accent-teal/95'
            }`}
          >
            Continue <ChevronRight className="w-4 h-4" />
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
