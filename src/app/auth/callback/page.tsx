'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const next = searchParams.get('next') ?? '/';

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
          router.push(next);
          return;
        }
        console.error('Auth error:', error.message);
      }
      
      // If no code or error, redirect to login
      router.push('/login?error=Could+not+authenticate+user');
    };

    handleCallback();
  }, [searchParams, router, supabase]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-canvas">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-teal mx-auto mb-4"></div>
        <p className="text-ink-secondary text-sm">Finishing sign in...</p>
      </div>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense fallback={null}>
      <AuthCallbackContent />
    </Suspense>
  );
}
