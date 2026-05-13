'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    setStatus('loading');
    setErrorMessage('');

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
      setStatus('success');
    } catch (error: any) {
      setStatus('error');
      setErrorMessage(error.message || 'Failed to send magic link.');
    }
  };

  return (
    <main className="flex flex-col min-h-screen max-w-md mx-auto items-center justify-center p-6 bg-surface sm:border-x sm:border-muted">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-10">
          <h1 className="text-2xl text-ink-primary font-medium tracking-wide mb-2">TRELIS</h1>
          <p className="text-sm text-ink-secondary">Structure for a better life.</p>
        </div>

        {status === 'success' ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 bg-canvas border border-success/30 rounded-2xl text-center">
            <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-success text-xl">✓</span>
            </div>
            <h3 className="text-ink-primary font-medium mb-2">Check your email</h3>
            <p className="text-sm text-ink-secondary">We sent a secure magic link to {email}</p>
          </motion.div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full bg-canvas border border-muted rounded-xl p-4 text-sm text-ink-primary placeholder:text-ink-tertiary focus:outline-none focus:border-accent-teal transition-colors"
                disabled={status === 'loading'}
              />
            </div>
            
            {status === 'error' && (
              <p className="text-xs text-error mt-2">{errorMessage}</p>
            )}

            <button
              type="submit"
              disabled={status === 'loading' || !email.trim()}
              className={`w-full py-4 rounded-xl font-medium transition-all ${email.trim() && status !== 'loading' ? 'bg-ink-primary text-surface' : 'bg-muted text-ink-tertiary'}`}
            >
              {status === 'loading' ? 'Sending...' : 'Send Magic Link'}
            </button>
          </form>
        )}
      </motion.div>
    </main>
  );
}
