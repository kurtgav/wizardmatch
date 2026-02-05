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
        // Get tokens from URL parameters
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        // Check for errors first
        if (error) {
          console.error('OAuth error:', error, errorDescription);
          router.push('/auth/login?error=' + encodeURIComponent(errorDescription || error));
          return;
        }

        // If we have tokens, set the session
        if (accessToken && refreshToken) {
          const { data: sessionData, error: sessionError } = await supabase().auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) {
            console.error('Session error:', sessionError);
            router.push('/auth/login?error=' + encodeURIComponent(sessionError.message));
            return;
          }

          if (sessionData.session) {
            // Successfully authenticated!
            const userId = sessionData.session.user.id;

            // Check if user has completed survey
            const { data: userData } = await supabase()
              .from('users')
              .select('surveyCompleted')
              .eq('id', userId)
              .maybeSingle();

            if (userData?.surveyCompleted) {
              router.push('/matches');
            } else {
              router.push('/survey');
            }
            return;
          }
        }

        // If no tokens in URL, check current session
        const { data: existingSession } = await supabase().auth.getSession();
        if (existingSession.session) {
          router.push('/matches');
          return;
        }

        // If we get here, something went wrong
        console.error('No session found after callback');
        router.push('/auth/login?error=' + encodeURIComponent('Failed to authenticate'));

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
