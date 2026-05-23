'use client';

import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { motion, AnimatePresence } from 'framer-motion';
import { TrelisLLM } from '@/lib/plugins/TrelisLLM';
import { createClient } from '@/lib/supabase/client';
import { Sparkles, Cpu, RefreshCw, AlertCircle } from 'lucide-react';

interface ReflectionEchoProps {
  entryText: string;
}

export default function ReflectionEcho({ entryText }: ReflectionEchoProps) {
  const [isNative, setIsNative] = useState<boolean>(false);
  const [initializing, setInitializing] = useState<boolean>(true);
  const [generating, setGenerating] = useState<boolean>(false);
  const [echoText, setEchoText] = useState<string>('');
  const [error, setError] = useState<string>('');
  
  // Security Session & Feature Flag states
  const [profileEmail, setProfileEmail] = useState<string | null>(null);
  const [sessionChecked, setSessionChecked] = useState<boolean>(false);

  const modelPath = 'public/assets/gemma-4-E2B-it.litertlm';

  useEffect(() => {
    const native = Capacitor.isNativePlatform();
    setIsNative(native);

    async function checkSession() {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        const email = session?.user?.email || null;
        setProfileEmail(email);

        if (native && email === 'tharune4ir@gmail.com') {
          await initModel();
        } else {
          setInitializing(false);
        }
      } catch (err) {
        console.error('Session load error in ReflectionEcho:', err);
        setInitializing(false);
      } finally {
        setSessionChecked(true);
      }
    }

    checkSession();
  }, []);

  const initModel = async () => {
    setInitializing(true);
    setError('');
    try {
      await TrelisLLM.initializeModel({ modelPath });
    } catch (err: any) {
      setError('Neural model initialization failed.');
      console.error(err);
    } finally {
      setInitializing(false);
    }
  };

  const generateEcho = async () => {
    if (!entryText || entryText.trim().length < 5) {
      setError('Please write a slightly longer reflection first.');
      return;
    }

    setGenerating(true);
    setError('');
    setEchoText('');

    try {
      const prompt = `You are Trelis Echo, a clinical-grade counselor. Based on the user's reflection: "${entryText}", ask exactly one short, deep, reflective question that prompts introspection. Do not offer advice, analysis, or introductory remarks. Output exactly one sentence only.`;
      
      const res = await TrelisLLM.generateResponse({
        prompt,
        maxTokens: 120,
      });

      setEchoText(res.text.trim());
    } catch (err: any) {
      setError('Echo engine failed to generate question.');
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const springConfig = { type: 'spring' as const, stiffness: 300, damping: 30 };

  const isFounder = profileEmail === 'tharune4ir@gmail.com';

  // 1. Loading state until session has resolved
  if (!sessionChecked) {
    return null;
  }

  // 2. Lockout Gatekeep State for standard beta users
  if (sessionChecked && !isFounder) {
    return (
      <div className="w-full bg-canvas/30 border border-dashed border-muted/50 p-4 rounded-xl text-center">
        <p className="text-[10px] text-ink-secondary leading-relaxed font-normal select-none">
          Trelis Neural Engine is currently in closed founder beta. Your reflections remain safely offline.
        </p>
      </div>
    );
  }

  // 3. Web Guard fallback (strictly if they are the Founder but on Web)
  if (sessionChecked && isFounder && !isNative) {
    return (
      <div className="w-full bg-surface/50 border border-muted/80 rounded-3xl p-6 shadow-sm flex flex-col gap-4 text-center">
        <div className="mx-auto w-10 h-10 rounded-full bg-accent-teal/5 flex items-center justify-center text-accent-teal">
          <Cpu className="w-5 h-5" />
        </div>
        <div className="flex flex-col gap-1.5">
          <h4 className="text-sm font-semibold tracking-wide text-ink-primary">Reflection Echo</h4>
          <p className="text-xs text-ink-secondary leading-relaxed font-serif italic max-w-xs mx-auto">
            "Trelis Reflection Echo runs entirely offline to protect your privacy. Access the on-device neural engine via the Android App."
          </p>
        </div>
      </div>
    );
  }

  // 4. God Mode Native Founder AI Interface
  return (
    <div className="w-full bg-surface border border-muted/80 rounded-3xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.02)] transition-all flex flex-col gap-4">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-accent-teal/5 flex items-center justify-center text-accent-teal">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold tracking-wide text-ink-primary">Reflection Echo</h4>
            <p className="text-[10px] uppercase tracking-wider text-ink-secondary font-semibold">On-Device AI</p>
          </div>
        </div>
        
        {!initializing && (
          <button
            onClick={generateEcho}
            disabled={generating}
            className="px-3.5 py-1.5 rounded-full bg-accent-teal text-white text-[11px] font-semibold flex items-center gap-1.5 shadow-sm hover:opacity-90 disabled:opacity-50 transition-all"
          >
            {generating ? (
              <RefreshCw className="w-3 h-3 animate-spin" />
            ) : (
              <Cpu className="w-3 h-3" />
            )}
            {generating ? 'Echoing...' : 'Ask Echo'}
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {/* Error State */}
        {error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={springConfig}
            className="flex items-center gap-2 p-3 rounded-2xl bg-red-50 text-red-700 text-xs font-semibold"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Model Initializing State */}
        {initializing && (
          <motion.div
            key="initializing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={springConfig}
            className="flex flex-col items-center gap-3 py-6"
          >
            <RefreshCw className="w-6 h-6 text-accent-teal animate-spin" />
            <p className="text-xs font-semibold text-ink-secondary">Initializing secure neural network...</p>
          </motion.div>
        )}

        {/* Inference State Output */}
        {generating && (
          <motion.div
            key="generating-pulsing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={springConfig}
            className="flex flex-col gap-2.5 py-4"
          >
            <div className="flex flex-col gap-2">
              <div className="h-4 w-3/4 bg-canvas rounded animate-pulse" />
              <div className="h-4 w-1/2 bg-canvas rounded animate-pulse" />
            </div>
            <p className="text-[10px] text-ink-secondary/70 italic">Processing securely on-device...</p>
          </motion.div>
        )}

        {/* Ready State / Result Display */}
        {!initializing && !generating && (
          <motion.div
            key="ready-result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={springConfig}
            className="flex flex-col gap-3"
          >
            {echoText ? (
              <div className="p-4 rounded-2xl bg-canvas border border-muted/50">
                <p className="text-sm text-ink-primary font-serif italic leading-relaxed text-center">
                  "{echoText}"
                </p>
              </div>
            ) : (
              <p className="text-xs text-ink-secondary leading-relaxed italic text-center">
                Ready to echo. Ask a reflective question based on your writing.
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
