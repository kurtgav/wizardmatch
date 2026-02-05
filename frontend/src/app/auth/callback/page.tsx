'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const code = searchParams.get('code');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        // Check for specific errors
        if (error) {
          console.error('OAuth error:', error, errorDescription);
          router.push(`/auth/login?error=${encodeURIComponent(errorDescription || error)}`);
          return;
        }

        // 1. Handle PKCE Flow (Code Exchange)
        if (code) {
          const { error: exchangeError } = await supabase().auth.exchangeCodeForSession(code);
          if (exchangeError) {
            console.error('Code exchange error:', exchangeError);
            router.push(`/auth/login?error=${encodeURIComponent(exchangeError.message)}`);
            return;
          }
          // Success
          router.push('/survey');
          return;
        }

        // 2. Handle Implicit Flow (Hash Fragment) or Existing Session
        // Note: supabase-js automatically checks window.location.hash for tokens when getSession is called.
        // We give it a moment to process or verify if a session already exists.
        const { data: { session }, error: sessionError } = await supabase().auth.getSession();

        if (sessionError) {
          console.error('Session retrieval error:', sessionError);
          router.push(`/auth/login?error=${encodeURIComponent(sessionError.message)}`);
          return;
        }

        if (session) {
          router.push('/survey');
          return;
        }

        // 3. Fallback: Listen for auth state change (in case hash processing is slightly delayed)
        const { data: { subscription } } = supabase().auth.onAuthStateChange((event, session) => {
          if (event === 'SIGNED_IN' && session) {
            router.push('/survey');
          }
        });

        // If no immediate session, no code, and no error, likely authentication failed or state wasn't picked up.
        // We set a short timeout to allow the listener to fire or hash to process.
        setTimeout(async () => {
          const { data: { session: finalSession } } = await supabase().auth.getSession();
          if (finalSession) {
            router.push('/survey');
          } else {
            console.error('No session found after callback processing');
            router.push('/auth/login?error=Authentication%20failed');
          }
        }, 1500);

        return () => {
          subscription.unsubscribe();
        };

      } catch (err) {
        console.error('Auth callback unexpected error:', err);
        router.push('/auth/login?error=Authentication%20failed');
      }
    };

    handleAuthCallback();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy via-purple-900 to-navy flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-retro-pink mx-auto mb-4"></div>
        <p className="text-white font-pixel text-sm">Validating magic spells...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-navy via-purple-900 to-navy flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-retro-pink mx-auto mb-4"></div>
          <p className="text-white font-pixel text-sm">Loading...</p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
