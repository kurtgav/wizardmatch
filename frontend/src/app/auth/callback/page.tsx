'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Heart, Ghost, Sparkles, AlertCircle } from 'lucide-react';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const error = searchParams.get('error');
    const token = searchParams.get('token');
    const newUser = searchParams.get('newUser');
    const testMode = searchParams.get('test');

    if (error) {
      setStatus('error');
      setMessage(searchParams.get('message') || 'Authentication failed. Please try again.');
      setTimeout(() => {
        router.replace('/auth/login');
      }, 2000);
      return;
    }

    // Handle token
    if (token) {
      // Store token
      localStorage.setItem('token', token);
      setStatus('success');

      // Redirect immediately or with short delay for feedback
      const timer = setTimeout(() => {
        if (newUser === 'true') {
          router.replace('/survey');
        } else {
          router.replace('/matches');
        }
      }, 500);
      return () => clearTimeout(timer);
    }

    // If no token and not loading, we might be in a weird state
    // But since it's in useEffect, we wait for params
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-retro-cream">
      <div className="bg-white border-8 border-navy shadow-[12px_12px_0_0_#1E3A8A] p-8 text-center max-w-md w-full mx-4">
        {status === 'error' ? (
          <>
            <div className="w-16 h-16 bg-cardinal-red text-white border-4 border-navy mx-auto mb-4 flex items-center justify-center">
              <AlertCircle size={32} />
            </div>
            <h2 className="font-pixel text-xl text-navy mb-2">ERROR</h2>
            <p className="font-body text-navy/70 mb-4">{message}</p>
            <p className="text-xs text-navy/40 uppercase">Redirecting to login...</p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-retro-pink border-4 border-navy mx-auto mb-4 flex items-center justify-center animate-bounce">
              <Sparkles className="text-navy" size={32} />
            </div>
            <h2 className="font-pixel text-xl text-navy mb-2 uppercase">
              {status === 'loading' ? 'Authenticating...' : 'Welcome Wizard!'}
            </h2>
            <p className="font-body text-navy/70">
              {status === 'loading' ? 'Opening the magical portal...' : 'Preparing your journey...'}
            </p>
            <div className="flex justify-center gap-1 mt-4">
              <div className="w-2 h-2 bg-retro-yellow border border-navy animate-ping"></div>
              <div className="w-2 h-2 bg-retro-pink border border-navy animate-ping delay-100"></div>
              <div className="w-2 h-2 bg-retro-sky border border-navy animate-ping delay-200"></div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-retro-cream">
        <div className="font-pixel text-navy animate-pulse">LOADING MAGIC...</div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
