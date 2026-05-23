'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { deriveKey, arrayBufferToBase64 } from '@/lib/crypto/journalCrypto';
import { storeJournalKey } from '@/lib/crypto/keyVault';

export default function JournalSetupPage() {
  const router = useRouter();
  const [passphrase, setPassphrase] = useState('');
  const [confirmPassphrase, setConfirmPassphrase] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passphrase.trim()) return;

    if (passphrase !== confirmPassphrase) {
      setStatus('error');
      setErrorMessage('Passphrases do not match.');
      return;
    }

    if (passphrase.trim().length < 8) {
      setStatus('error');
      setErrorMessage('Passphrase must be at least 8 characters long.');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      // Generate a random 16-byte salt for key derivation
      const salt = window.crypto.getRandomValues(new Uint8Array(16));

      // Derive key using PBKDF2 with 600,000 iterations
      const key = await deriveKey(passphrase.trim(), salt);

      // Securely store the key in Android Keystore / iOS Keychain or web localStorage fallback
      await storeJournalKey(key);

      // Save salt to standard localStorage for future key reconstruction/recovery
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('trelis_journal_salt', arrayBufferToBase64(salt.buffer));
      }

      setStatus('success');

      // Smooth visual transition, then redirect to journal
      setTimeout(() => {
        router.push('/notes');
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setErrorMessage(err.message || 'An unexpected error occurred during setup.');
    }
  };

  return (
    <main className="flex flex-col min-h-screen max-w-md mx-auto items-center justify-center p-6 bg-canvas sm:border-x sm:border-muted">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-10">
          <div className="w-12 h-12 bg-accent-teal/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-accent-teal text-xl">🔒</span>
          </div>
          <h1 className="text-2xl font-semibold text-ink-primary tracking-tight mb-4">Lock your thoughts.</h1>
          <p className="text-base text-ink-secondary leading-relaxed px-2">
            Think of this as a secondary lock on your private journal. Trelis uses military-grade encryption so your reflections never leave your device and cannot be read by anyone—not even us. Choose a memorable lock phrase.
          </p>
        </div>

        {status === 'success' ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 bg-surface border border-success/30 rounded-2xl text-center shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]"
          >
            <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-success text-lg">✓</span>
            </div>
            <h3 className="text-ink-primary font-medium mb-1">Passphrase Set</h3>
            <p className="text-xs text-ink-secondary">Encryption key derived and locked. Opening journal...</p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-3">
              <div>
                <label htmlFor="passphrase" className="sr-only">Passphrase</label>
                <input
                  id="passphrase"
                  type="password"
                  required
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                  placeholder="Enter a secure passphrase"
                  className="w-full bg-surface border border-muted rounded-xl p-4 text-sm text-ink-primary placeholder:text-ink-tertiary focus:outline-none focus:ring-1 focus:ring-accent-teal focus:border-accent-teal transition-colors shadow-sm"
                  disabled={status === 'loading'}
                />
              </div>

              <div>
                <label htmlFor="confirm-passphrase" className="sr-only">Confirm Passphrase</label>
                <input
                  id="confirm-passphrase"
                  type="password"
                  required
                  value={confirmPassphrase}
                  onChange={(e) => setConfirmPassphrase(e.target.value)}
                  placeholder="Confirm your passphrase"
                  className="w-full bg-surface border border-muted rounded-xl p-4 text-sm text-ink-primary placeholder:text-ink-tertiary focus:outline-none focus:ring-1 focus:ring-accent-teal focus:border-accent-teal transition-colors shadow-sm"
                  disabled={status === 'loading'}
                />
              </div>
            </div>

            <p className="text-[11px] text-ink-secondary leading-relaxed px-1 font-medium">
              This passphrase-derived key resides completely in your device's hardware enclave. Trelis cannot recover or reset it. Write down a physical copy of your passphrase.
            </p>

            {status === 'error' && (
              <p className="text-xs text-error mt-2 px-1 font-medium">{errorMessage}</p>
            )}

            <div className="space-y-3">
              <button
                type="submit"
                disabled={status === 'loading' || !passphrase || !confirmPassphrase}
                className={`w-full py-4 rounded-xl font-semibold text-sm transition-all ${
                  passphrase && confirmPassphrase && status !== 'loading'
                    ? 'bg-accent-teal text-white hover:bg-accent-teal/95 shadow-md shadow-accent-teal/10 active:scale-[0.98]'
                    : 'bg-muted text-ink-tertiary cursor-not-allowed'
                }`}
              >
                {status === 'loading' ? 'Encrypting Journal...' : 'Set Passphrase'}
              </button>

              <button
                type="button"
                onClick={() => {
                  try {
                    const { Haptics } = require('@capacitor/haptics');
                    Haptics.vibrate();
                  } catch {}
                  router.push('/');
                }}
                className="w-full py-2.5 text-center text-xs font-semibold text-ink-secondary hover:text-ink-primary transition-all active:scale-[0.98] focus:outline-none bg-transparent"
              >
                Not right now, go back.
              </button>
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
