'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Haptics, NotificationType } from '@capacitor/haptics';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Sparkles, ChevronLeft, Loader2, Check } from 'lucide-react';

type Phase = 'pitch' | 'survey' | 'success';

export default function PlusWaitlistPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [phase, setPhase] = useState<Phase>('pitch');
  const [userId, setUserId] = useState<string | null>(null);
  const [desiredFeatures, setDesiredFeatures] = useState('');
  const [willingnessToPay, setWillingnessToPay] = useState('₹199');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadUser() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
      }
    }
    loadUser();
  }, []);

  const handleShapeFuture = async () => {
    try {
      await Haptics.vibrate();
    } catch {}
    setPhase('survey');
  };

  const handleSubmitSurvey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      setErrorMsg('No active session found. Please sign in.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const { error } = await supabase
        .from('plus_waitlist')
        .insert({
          user_id: userId,
          desired_features: desiredFeatures.trim(),
          willingness_to_pay: willingnessToPay,
        });

      if (error) throw error;

      try {
        await Haptics.notification({ type: NotificationType.Success });
      } catch {}

      setPhase('success');
    } catch (err: any) {
      console.error('Waitlist submission error:', err);
      setErrorMsg(err.message || 'Unable to join waitlist. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReturn = () => {
    try {
      Haptics.vibrate();
    } catch {}
    router.push('/');
  };

  const springConfig = { type: 'spring', stiffness: 300, damping: 30 } as const;

  return (
    <div className="min-h-screen bg-canvas text-ink-primary flex flex-col items-center px-6 py-12 relative overflow-hidden font-sans select-none">
      {/* Dynamic luxury gradient glow */}
      <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[60%] rounded-full bg-accent-teal/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[50%] rounded-full bg-accent-teal/5 blur-[120px] pointer-events-none" />

      {/* Navigation Header */}
      <header className="w-full max-w-md flex items-center justify-between mb-12 z-10">
        <button
          onClick={() => {
            try { Haptics.vibrate(); } catch {}
            router.back();
          }}
          className="flex items-center gap-1.5 text-xs font-semibold text-ink-secondary hover:text-ink-primary transition-all bg-surface px-3 py-1.5 rounded-full shadow-sm border border-muted/30"
        >
          <ChevronLeft size={14} />
          <span>Back</span>
        </button>
        <span className="text-xs uppercase tracking-[0.2em] font-semibold text-ink-secondary bg-surface px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5 border border-muted/30">
          <Sparkles size={12} className="text-accent-teal animate-pulse" />
          <span>Waitlist</span>
        </span>
      </header>

      {/* Core Presentation Body */}
      <main className="w-full max-w-md flex-1 flex flex-col justify-center items-center z-10">
        <AnimatePresence mode="wait">
          {phase === 'pitch' && (
            <motion.div
              key="pitch"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={springConfig}
              className="w-full flex flex-col items-center text-center"
            >
              {/* Premium Logo Ring */}
              <div className="w-16 h-16 rounded-3xl bg-accent-teal flex items-center justify-center text-white text-3xl shadow-xl shadow-accent-teal/10 mb-8 select-none">
                T+
              </div>

              {/* Standard Typography Heading */}
              <h1 className="text-2xl font-semibold tracking-tight text-ink-primary mb-4 leading-tight">
                Trelis Plus is coming.
              </h1>

              {/* Standard Typography Paragraph */}
              <p className="text-base text-ink-secondary leading-relaxed mb-10">
                We are building the ultimate privacy-first Life OS. Shape the future and claim early beta access.
              </p>

              {/* Feature Value Map Card */}
              <div className="w-full bg-surface rounded-3xl p-6 shadow-md border border-muted/50 text-left mb-10 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-accent-teal/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 text-accent-teal stroke-[3]" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-ink-primary">Concentric Ring Insights</h3>
                    <p className="text-[11px] text-ink-secondary leading-normal font-medium mt-0.5">Deeply intuitive visualization tracking check-ins and anchor completions.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-accent-teal/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 text-accent-teal stroke-[3]" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-ink-primary">Health Connect Automation</h3>
                    <p className="text-[11px] text-ink-secondary leading-normal font-medium mt-0.5">Allow Android wearables to automatically and silently check off movement steps.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-accent-teal/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 text-accent-teal stroke-[3]" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-ink-primary">Local Beta Neural Echo</h3>
                    <p className="text-[11px] text-ink-secondary leading-normal font-medium mt-0.5">An offline Gemma 4 AI assistant running locally on-device for total privacy.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-accent-teal/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 text-accent-teal stroke-[3]" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-ink-primary">Zero-Knowledge Cryptography</h3>
                    <p className="text-[11px] text-ink-secondary leading-normal font-medium mt-0.5">Client-side AES-256-GCM encryption locks your reflections before backup syncs.</p>
                  </div>
                </div>
              </div>

              {/* Clinical Teal Activation Button */}
              <button
                onClick={handleShapeFuture}
                className="w-full bg-accent-teal hover:bg-opacity-95 text-white py-4 px-8 rounded-2xl font-semibold text-sm active:scale-[0.98] transition-all shadow-md shadow-accent-teal/5"
              >
                Shape the future of Trelis
              </button>
            </motion.div>
          )}

          {phase === 'survey' && (
            <motion.form
              key="survey"
              onSubmit={handleSubmitSurvey}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={springConfig}
              className="w-full flex flex-col text-left"
            >
              {/* Survey Header */}
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold tracking-tight text-ink-primary mb-2">Beta Survey</h2>
                <p className="text-ink-secondary text-xs font-medium">Your voice dictates what we build first.</p>
              </div>

              {errorMsg && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl p-3.5 text-xs font-semibold mb-6 text-center">
                  {errorMsg}
                </div>
              )}

              {/* Question 1: Feature INDISPENSABLE */}
              <div className="flex flex-col gap-2 mb-6">
                <label className="text-xs font-semibold text-ink-primary uppercase tracking-wider">
                  1. What feature would make this indispensable to you?
                </label>
                <textarea
                  required
                  value={desiredFeatures}
                  onChange={(e) => setDesiredFeatures(e.target.value)}
                  placeholder="E.g. Custom dashboards, offline-first notes sync, integration with other wearable smart rings..."
                  className="w-full bg-surface border border-muted/80 text-ink-primary focus:outline-none focus:border-accent-teal transition-all rounded-xl p-3.5 text-xs min-h-[120px] leading-relaxed resize-none font-medium"
                />
              </div>

              {/* Question 2: Willingness to Pay */}
              <div className="flex flex-col gap-2 mb-8">
                <label className="text-xs font-semibold text-ink-primary uppercase tracking-wider">
                  2. What is a fair monthly price for a private, ad-free Life OS?
                </label>
                <div className="relative">
                  <select
                    value={willingnessToPay}
                    onChange={(e) => setWillingnessToPay(e.target.value)}
                    className="w-full bg-surface border border-muted/80 text-ink-primary focus:outline-none focus:border-accent-teal transition-all rounded-xl p-3.5 text-xs font-semibold appearance-none cursor-pointer"
                  >
                    <option value="₹99">₹99 / month (~$1.20)</option>
                    <option value="₹199">₹199 / month (~$2.40)</option>
                    <option value="₹299">₹299 / month (~$3.60)</option>
                    <option value="₹499+">₹499+ / month (~$6.00+)</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-ink-secondary text-xs">
                    ▼
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-accent-teal hover:bg-opacity-95 text-white py-4 px-8 rounded-2xl font-semibold text-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-75"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    <span>Securing access...</span>
                  </>
                ) : (
                  <span>Submit Waitlist Response</span>
                )}
              </button>
            </motion.form>
          )}

          {phase === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={springConfig}
              className="w-full flex flex-col items-center text-center"
            >
              {/* Success Badge */}
              <div className="w-16 h-16 rounded-full bg-accent-teal/10 flex items-center justify-center text-accent-teal mb-8">
                <Check className="w-8 h-8 stroke-[3px]" />
              </div>

              {/* Standard Typography Success Title */}
              <h1 className="text-2xl font-semibold tracking-tight text-ink-primary mb-3">
                Thank you.
              </h1>

              <p className="text-base text-ink-secondary leading-relaxed mb-10">
                You are officially on the waitlist. Your input directly influences what we prioritize for Phase 6.
              </p>

              {/* Return to Dashboard */}
              <button
                onClick={handleReturn}
                className="w-full bg-ink-primary hover:bg-opacity-95 text-white py-4 px-8 rounded-2xl font-semibold text-sm active:scale-[0.98] transition-all shadow-md"
              >
                Return to Dashboard
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Assurance */}
      <footer className="w-full max-w-md flex items-center justify-center gap-1.5 mt-12 text-ink-secondary text-xs font-semibold z-10 select-none">
        <ShieldCheck size={14} className="text-accent-teal shrink-0" />
        <span>Your waitlist choices are encrypted and kept private.</span>
      </footer>
    </div>
  );
}
