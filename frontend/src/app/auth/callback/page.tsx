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
        // Wait for Supabase to process the OAuth callback from URL
        // The URL contains access_token and refresh_token parameters
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Now get the session - Supabase should have processed the tokens
        const { data: sessionData, error: sessionError } = await supabase().auth.getSession();

        if (sessionError) {
          console.error('Auth callback error:', sessionError);
          router.push('/auth/login?error=' + encodeURIComponent(sessionError.message));
          return;
        }

        if (sessionData.session) {
          // Successfully authenticated!
          const userId = sessionData.session.user.id;

          // Check if user has completed survey
          const { data: userData, error: userError } = await supabase()
            .from('users')
            .select('surveyCompleted')
            .eq('id', userId)
            .maybeSingle(); // Use maybeSingle() instead of single() to avoid errors if user doesn't exist

          if (userData?.surveyCompleted) {
            router.push('/matches');
          } else {
            router.push('/survey');
          }
        } else {
          // No session found - check if there's an error in the URL
          const error = searchParams.get('error');
          const errorDescription = searchParams.get('error_description');

          console.error('No session after callback', { error, errorDescription });
          router.push('/auth/login?error=' + encodeURIComponent(errorDescription || 'Authentication failed'));
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        router.push('/auth/login?error=' + encodeURIComponent('Authentication failed'));
      }
    };

    handleAuthCallback();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy via-purple-900 to-navy flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-retro-pink mx-auto mb-4"></div>
        <p className="text-white font-pixel text-sm">Signing you in...</p>
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
