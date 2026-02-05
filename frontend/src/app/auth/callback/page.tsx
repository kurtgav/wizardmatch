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
        // Get the access token and refresh token from the URL hash
        const hash = window.location.hash;
        const search = window.location.search;

        // Let Supabase handle the session from the URL
        const { data, error } = await supabase().auth.getSession();

        if (error) {
          console.error('Auth callback error:', error);
          router.push('/auth/login?error=' + encodeURIComponent(error.message));
          return;
        }

        if (data.session) {
          // Successfully authenticated, check if user has completed survey
          const { data: userData } = await supabase()
            .from('users')
            .select('surveyCompleted')
            .eq('id', data.session.user.id)
            .single();

          if (userData?.surveyCompleted) {
            router.push('/matches');
          } else {
            router.push('/survey');
          }
        } else {
          // No session, redirect to login
          router.push('/auth/login');
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        router.push('/auth/login?error=' + encodeURIComponent('Authentication failed'));
      }
    };

    handleAuthCallback();
  }, [router]);

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
