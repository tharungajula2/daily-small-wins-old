'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function UpdatePasswordPage() {
  const supabase = createClient();
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim()) return;

    if (newPassword !== confirmPassword) {
      setStatus('error');
      setErrorMessage('Passwords do not match.');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setStatus('success');
      // Wait for a brief moment to show success message, then navigate to dashboard
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (error: any) {
      setStatus('error');
      setErrorMessage(error.message || 'Failed to update password.');
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
        <div className="text-center mb-10">
          <h1 className="text-2xl text-ink-primary font-semibold tracking-wide mb-2">TRELIS</h1>
          <p className="text-sm text-ink-secondary">Set a new password for your account.</p>
        </div>

        <AnimatePresence mode="wait">
          {status === 'success' ? (
            <motion.div
              key="success-container"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="p-6 bg-canvas border border-success/30 rounded-2xl text-center"
            >
              <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-success text-xl">✓</span>
              </div>
              <h3 className="text-ink-primary font-semibold mb-2">Password Updated</h3>
              <p className="text-sm text-ink-secondary">
                Your password has been changed successfully. Redirecting you to the dashboard...
              </p>
            </motion.div>
          ) : (
            <motion.form
              key="form-container"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onSubmit={handleUpdatePassword}
              className="space-y-4"
            >
              <div className="space-y-3">
                <div>
                  <label htmlFor="new-password" className="sr-only">New Password</label>
                  <input
                    id="new-password"
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New Password"
                    className="w-full bg-canvas border border-muted rounded-xl p-4 text-sm text-ink-primary placeholder:text-ink-tertiary focus:outline-none focus:ring-1 focus:ring-accent-teal focus:border-accent-teal transition-colors"
                    disabled={status === 'loading'}
                  />
                </div>

                <div>
                  <label htmlFor="confirm-password" className="sr-only">Confirm Password</label>
                  <input
                    id="confirm-password"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm Password"
                    className="w-full bg-canvas border border-muted rounded-xl p-4 text-sm text-ink-primary placeholder:text-ink-tertiary focus:outline-none focus:ring-1 focus:ring-accent-teal focus:border-accent-teal transition-colors"
                    disabled={status === 'loading'}
                  />
                </div>
              </div>

              {status === 'error' && (
                <p className="text-xs text-error mt-2">{errorMessage}</p>
              )}

              <button
                type="submit"
                disabled={status === 'loading' || !newPassword || !confirmPassword}
                className={`w-full py-4 rounded-xl font-semibold transition-all ${
                  newPassword && confirmPassword && status !== 'loading'
                    ? 'bg-ink-primary text-surface hover:bg-ink-primary/95'
                    : 'bg-muted text-ink-tertiary cursor-not-allowed'
                }`}
              >
                {status === 'loading' ? 'Updating...' : 'Update Password'}
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Google Play Medical Compliance */}
        <p className="mt-12 text-[10px] text-ink-secondary/70 text-center px-4 leading-relaxed">
          Trelis is not a medical device and does not diagnose, treat, cure, or prevent any medical condition.
        </p>
      </motion.div>
    </main>
  );
}
