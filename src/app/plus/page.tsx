'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRitualStore } from '@/store/useRitualStore';
import { initializeCheckout } from '@/lib/payments/razorpay';
import { Haptics, NotificationType } from '@capacitor/haptics';
import { motion } from 'framer-motion';
import { ShieldCheck, Sparkles, CheckCircle2, ChevronLeft, Loader2 } from 'lucide-react';

export default function PlusPaywall() {
  const router = useRouter();
  const { setPremiumStatus } = useRitualStore();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCheckout = async () => {
    setIsLoading(true);
    setErrorMsg(null);

    // Simple haptic tick on tap
    try {
      await Haptics.vibrate();
    } catch {
      // web fallback ignore
    }

    await initializeCheckout({
      onSuccess: async () => {
        try {
          // Success haptic feedback
          await Haptics.notification({ type: NotificationType.Success });
        } catch {
          // web fallback ignore
        }
        
        setPremiumStatus(true);
        setIsLoading(false);
        router.push('/');
      },
      onError: (err: any) => {
        console.error('Plus Paywall Checkout Error:', err);
        setErrorMsg(err.message || 'Payment was canceled or could not be completed.');
        setIsLoading(false);
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#F7F6F2] text-[#1C1C1E] flex flex-col items-center px-6 py-12 relative overflow-hidden font-sans">
      {/* Decorative gradient blur background */}
      <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[60%] rounded-full bg-accent-teal/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[50%] rounded-full bg-[#3A86C8]/5 blur-[120px] pointer-events-none" />

      {/* Luxury Navigation Header */}
      <header className="w-full max-w-md flex items-center justify-between mb-12 z-10">
        <button
          onClick={() => {
            try { Haptics.vibrate(); } catch {}
            router.back();
          }}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#5C5C5E] hover:text-[#1C1C1E] transition-all bg-white px-3 py-1.5 rounded-full shadow-sm"
        >
          <ChevronLeft size={14} />
          <span>Back</span>
        </button>
        <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#5C5C5E] bg-white px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5">
          <Sparkles size={12} className="text-accent-teal" />
          <span>Membership</span>
        </span>
      </header>

      {/* Main Core Payload */}
      <main className="w-full max-w-md flex-1 flex flex-col justify-center items-center text-center z-10">
        {/* Luxury Logo Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="w-16 h-16 rounded-3xl bg-accent-teal flex items-center justify-center text-white text-3xl font-serif shadow-xl shadow-accent-teal/10 mb-8"
        >
          T+
        </motion.div>

        {/* Dynamic Title */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.1 }}
          className="text-4xl font-serif font-semibold tracking-tight text-[#1C1C1E] mb-3 leading-tight"
        >
          Trelis Plus
        </motion.h1>

        {/* Breathtaking luxury copy */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.2 }}
          className="text-[#5C5C5E] text-base max-w-[280px] leading-relaxed mb-10 font-sans font-normal"
        >
          Structure for a better life, uninterrupted.
        </motion.p>

        {/* Feature List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.3 }}
          className="w-full bg-white rounded-3xl p-6 shadow-md shadow-[#1c1c1e]/5 border border-[#1c1c1e]/5 text-left mb-8 space-y-4"
        >
          <div className="flex items-start gap-3">
            <CheckCircle2 className="text-accent-teal mt-0.5 shrink-0" size={18} />
            <div>
              <h3 className="text-sm font-semibold text-[#1C1C1E]">Circadian Theme Engine</h3>
              <p className="text-xs text-[#5C5C5E]">A warm ambient display dynamically adjusted to your local timezone.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle2 className="text-accent-teal mt-0.5 shrink-0" size={18} />
            <div>
              <h3 className="text-sm font-semibold text-[#1C1C1E]">Silent Wearables Sync</h3>
              <p className="text-xs text-[#5C5C5E]">Automated anchor checks connected safely via Android Health Connect.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle2 className="text-accent-teal mt-0.5 shrink-0" size={18} />
            <div>
              <h3 className="text-sm font-semibold text-[#1C1C1E]">Founder Beta Neural Echo</h3>
              <p className="text-xs text-[#5C5C5E]">Unlock localized AI reflections powered completely offline by Gemma 4.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle2 className="text-accent-teal mt-0.5 shrink-0" size={18} />
            <div>
              <h3 className="text-sm font-semibold text-[#1C1C1E]">Zero-Knowledge Privacy</h3>
              <p className="text-xs text-[#5C5C5E]">Completely encrypted journals with client-side AES-256-GCM.</p>
            </div>
          </div>
        </motion.div>

        {/* Error Handling Notification */}
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full bg-red-50 text-red-700 text-xs font-semibold px-4 py-3 rounded-2xl border border-red-100 mb-6 text-center"
          >
            {errorMsg}
          </motion.div>
        )}

        {/* Dynamic Pricing Info */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.4 }}
          className="mb-8"
        >
          <div className="text-3xl font-serif font-semibold text-[#1C1C1E]">
            ₹299 <span className="text-xs font-sans text-[#5C5C5E] font-medium">/ month</span>
          </div>
          <div className="text-[10px] uppercase tracking-wider text-[#5C5C5E] mt-1 font-semibold">
            Cancel anytime • 7-day free trial included
          </div>
        </motion.div>

        {/* Interactive Premium checkout trigger */}
        <motion.button
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.5 }}
          onClick={handleCheckout}
          disabled={isLoading}
          className="w-full bg-[#1C1C1E] text-white py-4 px-8 rounded-2xl font-semibold text-sm hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-black/10 active:scale-[0.98] disabled:opacity-75 disabled:pointer-events-none"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={16} />
              <span>Contacting Secure Gateway...</span>
            </>
          ) : (
            <span>Begin Trelis Plus</span>
          )}
        </motion.button>
      </main>

      {/* Footer Branding Protection */}
      <footer className="w-full max-w-md flex items-center justify-center gap-1.5 mt-12 text-[#5C5C5E] text-xs font-medium z-10">
        <ShieldCheck size={14} className="text-accent-teal" />
        <span>Secure checkout processed via Razorpay Web</span>
      </footer>
    </div>
  );
}
