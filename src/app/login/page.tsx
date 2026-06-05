'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isResetMode, setIsResetMode] = useState(false);
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [showSignUpPrompt, setShowSignUpPrompt] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    
    setStatus('loading');
    setErrorMessage('');
    setShowSignUpPrompt(false);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        // If login fails, we show the custom prompt with create account link
        setStatus('error');
        setErrorMessage("We couldn't find an account with those details.");
        setShowSignUpPrompt(true);
        return;
      }
      
      // Navigate to dashboard
      router.push('/');
    } catch (error: any) {
      setStatus('error');
      setErrorMessage(error.message || 'Invalid email or password.');
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password || !confirmPassword) return;

    if (password !== confirmPassword) {
      setStatus('error');
      setErrorMessage('Passwords do not match.');
      return;
    }
    
    setStatus('loading');
    setErrorMessage('');

    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      if (error) throw error;

      setStatus('success');
    } catch (error: any) {
      setStatus('error');
      setErrorMessage(error.message || 'Failed to create account.');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    setStatus('loading');
    setErrorMessage('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
      });

      if (error) throw error;
      
      setStatus('success');
    } catch (error: any) {
      setStatus('error');
      setErrorMessage(error.message || 'Failed to send reset link.');
    }
  };

  return (
    <main className="flex flex-col min-h-screen max-w-md mx-auto items-center justify-center p-6 bg-surface sm:border-x sm:border-muted">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-10 flex flex-col items-center">
          <img 
            src="/icons/icon-192.webp" 
            alt="Trelis Logo" 
            className="w-16 h-16 object-contain mb-6 select-none"
          />
          <h1 className="text-2xl text-ink-primary font-semibold tracking-wide mb-2">TRELIS</h1>
          <p className="text-sm text-ink-secondary">Structure for a better life.</p>
        </div>

        {status === 'success' ? (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="p-6 bg-canvas border border-success/30 rounded-2xl text-center"
          >
            <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-success text-xl">✓</span>
            </div>
            <h3 className="text-ink-primary font-semibold mb-2">
              {isResetMode ? 'Reset Link Sent' : 'Check your email'}
            </h3>
            <p className="text-sm text-ink-secondary">
              {isResetMode 
                ? 'Check your inbox for a password recovery email.' 
                : 'Check your email to confirm your account'}
            </p>
            <button
              onClick={() => {
                setStatus('idle');
                setIsResetMode(false);
                setIsSignUpMode(false);
                setConfirmPassword('');
                setPassword('');
              }}
              className="mt-4 text-xs font-semibold uppercase tracking-wider text-accent-teal hover:underline"
            >
              Back to Login
            </button>
          </motion.div>
        ) : (
          <form 
            onSubmit={
              isResetMode 
                ? handleResetPassword 
                : isSignUpMode 
                  ? handleSignUpSubmit 
                  : handleLogin
            } 
            className="space-y-4"
          >
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
                  className="w-full bg-surface border border-muted rounded-xl p-4 text-sm text-ink-primary placeholder:text-ink-secondary placeholder-ink-secondary focus:outline-none focus:ring-1 focus:ring-accent-teal focus:border-accent-teal transition-colors shadow-sm"
                  disabled={status === 'loading'}
                />
              </div>

              <AnimatePresence initial={false}>
                {!isResetMode && (
                  <motion.div
                    key="password-field"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="overflow-hidden space-y-3"
                  >
                    <div>
                      <label htmlFor="password" className="sr-only">Password</label>
                      <input
                        id="password"
                        type="password"
                        required={!isResetMode}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full bg-surface border border-muted rounded-xl p-4 text-sm text-ink-primary placeholder:text-ink-secondary placeholder-ink-secondary focus:outline-none focus:ring-1 focus:ring-accent-teal focus:border-accent-teal transition-colors shadow-sm"
                        disabled={status === 'loading'}
                      />
                    </div>

                    {isSignUpMode && (
                      <motion.div
                        key="confirm-password-field"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      >
                        <label htmlFor="confirmPassword" className="sr-only">Confirm Password</label>
                        <input
                          id="confirmPassword"
                          type="password"
                          required={isSignUpMode}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm your password"
                          className="w-full bg-surface border border-muted rounded-xl p-4 text-sm text-ink-primary placeholder:text-ink-secondary placeholder-ink-secondary focus:outline-none focus:ring-1 focus:ring-accent-teal focus:border-accent-teal transition-colors shadow-sm"
                          disabled={status === 'loading'}
                        />
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {showSignUpPrompt ? (
              <p className="text-xs text-error mt-2">
                We couldn't find an account with those details. New here?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUpMode(true);
                    setShowSignUpPrompt(false);
                    setErrorMessage('');
                  }}
                  className="text-accent-teal hover:underline font-semibold"
                >
                  Create an account →
                </button>
              </p>
            ) : status === 'error' && (
              <p className="text-xs text-error mt-2">{errorMessage}</p>
            )}

            <div className="flex flex-col gap-3 pt-2">
              <button
                type="submit"
                disabled={
                  status === 'loading' || 
                  !email.trim() || 
                  (!isResetMode && !password) || 
                  (isSignUpMode && !confirmPassword)
                }
                className={`w-full py-4 rounded-xl font-semibold transition-all ${
                  email.trim() && 
                  (isResetMode || password) && 
                  (!isSignUpMode || confirmPassword) && 
                  status !== 'loading' 
                    ? 'bg-ink-primary text-surface hover:bg-ink-primary/95' 
                    : 'bg-muted text-ink-tertiary cursor-not-allowed'
                }`}
              >
                {status === 'loading' 
                  ? 'Loading...' 
                  : isResetMode 
                    ? 'Send Reset Link' 
                    : isSignUpMode 
                      ? 'Create Account' 
                      : 'Log In'}
              </button>

              <AnimatePresence initial={false}>
                {!isResetMode ? (
                  <motion.div
                    key="login-secondary-actions"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="flex flex-col gap-3 overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setIsSignUpMode(!isSignUpMode);
                        setErrorMessage('');
                        setShowSignUpPrompt(false);
                        setPassword('');
                        setConfirmPassword('');
                      }}
                      disabled={status === 'loading'}
                      className="w-full py-4 rounded-xl font-semibold border border-muted transition-all bg-surface text-ink-primary hover:bg-canvas"
                    >
                      {isSignUpMode ? 'Already have an account? Log In' : 'Create Account'}
                    </button>

                    {!isSignUpMode && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsResetMode(true);
                          setErrorMessage('');
                          setShowSignUpPrompt(false);
                        }}
                        className="text-xs text-ink-secondary/80 hover:text-accent-teal hover:underline transition-colors mt-1 self-center"
                      >
                        Forgot your password?
                      </button>
                    )}
                  </motion.div>
                ) : (
                  <motion.button
                    key="back-to-login"
                    type="button"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    onClick={() => {
                      setIsResetMode(false);
                      setErrorMessage('');
                    }}
                    className="text-xs text-ink-secondary/80 hover:text-accent-teal hover:underline transition-colors mt-2 self-center overflow-hidden"
                  >
                    Back to login
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </form>
        )}
        {/* Google Play Medical Compliance */}
        <p className="mt-12 text-[10px] text-ink-secondary/70 text-center px-4 leading-relaxed">
          Trelis is not a medical device and does not diagnose, treat, cure, or prevent any medical condition.
        </p>
      </motion.div>
    </main>
  );
}
