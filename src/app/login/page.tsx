'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    
    setStatus('loading');
    setErrorMessage('');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;
      
      // Navigate to dashboard
      router.push('/');
    } catch (error: any) {
      setStatus('error');
      setErrorMessage(error.message || 'Invalid email or password.');
    }
  };

  const handleSignUp = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    
    setStatus('loading');
    setErrorMessage('');

    try {
      const { error, data } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      if (error) throw error;

      // In case auto-confirmation is enabled, a session is returned immediately
      if (data?.session) {
        router.push('/');
      } else {
        setStatus('success');
      }
    } catch (error: any) {
      setStatus('error');
      setErrorMessage(error.message || 'Failed to create account.');
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
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="p-6 bg-canvas border border-success/30 rounded-2xl text-center"
          >
            <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-success text-xl">✓</span>
            </div>
            <h3 className="text-ink-primary font-medium mb-2">Account Created</h3>
            <p className="text-sm text-ink-secondary">Please check your email to confirm your registration.</p>
            <button
              onClick={() => setStatus('idle')}
              className="mt-4 text-xs font-semibold uppercase tracking-wider text-accent-teal hover:underline"
            >
              Back to Login
            </button>
          </motion.div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-3">
              <div>
                <label htmlFor="email" className="sr-only">Email address</label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full bg-canvas border border-muted rounded-xl p-4 text-sm text-ink-primary placeholder:text-ink-tertiary focus:outline-none focus:ring-1 focus:ring-accent-teal focus:border-accent-teal transition-colors"
                  disabled={status === 'loading'}
                />
              </div>

              <div>
                <label htmlFor="password" className="sr-only">Password</label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-canvas border border-muted rounded-xl p-4 text-sm text-ink-primary placeholder:text-ink-tertiary focus:outline-none focus:ring-1 focus:ring-accent-teal focus:border-accent-teal transition-colors"
                  disabled={status === 'loading'}
                />
              </div>
            </div>
            
            {status === 'error' && (
              <p className="text-xs text-error mt-2">{errorMessage}</p>
            )}

            <div className="flex flex-col gap-3 pt-2">
              <button
                type="submit"
                disabled={status === 'loading' || !email.trim() || !password}
                className={`w-full py-4 rounded-xl font-medium transition-all ${
                  email.trim() && password && status !== 'loading' 
                    ? 'bg-ink-primary text-surface hover:bg-ink-primary/95' 
                    : 'bg-muted text-ink-tertiary cursor-not-allowed'
                }`}
              >
                {status === 'loading' ? 'Loading...' : 'Log In'}
              </button>

              <button
                type="button"
                onClick={handleSignUp}
                disabled={status === 'loading' || !email.trim() || !password}
                className={`w-full py-4 rounded-xl font-medium border border-muted transition-all ${
                  email.trim() && password && status !== 'loading' 
                    ? 'bg-surface text-ink-primary hover:bg-canvas' 
                    : 'bg-transparent text-ink-tertiary cursor-not-allowed'
                }`}
              >
                Create Account
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </main>
  );
}
