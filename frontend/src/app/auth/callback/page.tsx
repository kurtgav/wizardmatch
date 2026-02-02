'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Heart, Ghost, Sparkles, AlertCircle } from 'lucide-react';
import { signIn } from 'next-auth/react';

export const dynamic = 'force-dynamic';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const error = searchParams.get('error');
    const code = searchParams.get('code');

    if (error) {
      setStatus('error');
      setMessage('Authentication failed. Please try again.');
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
      return;
    }

    // Check if we have a session already (NextAuth handles this via cookies)
    const checkSession = async () => {
      try {
        const res = await fetch('/api/auth/session');
        if (res.ok) {
          const session = await res.json();
          if (session?.user) {
            setStatus('success');

            // Redirect based on whether user has completed survey
            setTimeout(() => {
              if (session.user.surveyCompleted) {
                router.push('/matches');
              } else {
                router.push('/survey');
              }
            }, 1500);
            return;
          }
        }
      } catch (err) {
        // No session yet, redirect to login
      }

      setStatus('error');
      setMessage('Authentication failed. Please try again.');
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
    };

    checkSession();
  }, [searchParams, router]);

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-retro-cream">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full mx-auto px-4"
        >
          <div className="bg-white border-8 border-navy shadow-[12px_12px_0_0_#1E3A8A] p-8 text-center relative overflow-hidden">
            {/* Error Icon */}
            <motion.div
              className="w-20 h-20 bg-retro-pink border-4 border-navy mx-auto mb-6 flex items-center justify-center shadow-[4px_4px_0_0_#1E3A8A]"
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, -5, 5, 0],
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
              }}
            >
              <AlertCircle className="w-10 h-10 text-cardinal-red" />
            </motion.div>

            <h2 className="font-pixel text-xl text-navy mb-4">
              AUTHENTICATION ERROR
            </h2>

            <p className="font-body text-navy/80 mb-6">
              {message}
            </p>

            <p className="font-body text-sm text-navy/60">
              Redirecting to login page...
            </p>

            {/* Loading dots */}
            <div className="flex justify-center gap-2 mt-6">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-3 h-3 bg-cardinal-red border-2 border-navy"
                  animate={{
                    scale: [1, 1.3, 1],
                  }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>

            {/* Corner decorations */}
            <motion.div
              className="absolute -top-2 -right-2 w-6 h-6 bg-retro-orange border-4 border-navy"
              animate={{
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            />
            <motion.div
              className="absolute -bottom-2 -left-2 w-6 h-6 bg-retro-mint border-4 border-navy"
              animate={{
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: 1,
              }}
            />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-retro-cream">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full mx-auto px-4"
      >
        <div className="bg-white border-8 border-navy shadow-[12px_12px_0_0_#1E3A8A] p-8 text-center relative overflow-hidden">
          {/* Background pixel pattern */}
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            <div className="absolute inset-0" style={{
              backgroundImage: `
                linear-gradient(to right, #1E3A8A 2px, transparent 2px),
                linear-gradient(to bottom, #1E3A8A 2px, transparent 2px)
              `,
              backgroundSize: '16px 16px',
            }} />
          </div>

          {/* Animated Logo */}
          <motion.div
            className="w-24 h-24 bg-retro-pink border-4 border-navy mx-auto mb-6 flex items-center justify-center shadow-[4px_4px_0_0_#1E3A8A] relative z-10"
            animate={{
              y: [0, -12, 0],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            {status === 'loading' ? (
              <div className="w-10 h-10 border-4 border-navy border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Sparkles className="w-12 h-12 text-retro-yellow" />
            )}
          </motion.div>

          <h2 className="font-pixel text-xl text-navy mb-4 relative z-10">
            {status === 'loading' ? 'SIGNING YOU IN...' : 'SUCCESS!'}
          </h2>

          <p className="font-body text-navy/80 mb-6 relative z-10">
            {status === 'loading'
              ? 'Connecting to the magic portal...'
              : 'Welcome, Wizard! Preparing your journey...'}
          </p>

          {/* Loading/Success Animation */}
          <div className="flex justify-center gap-3 relative z-10">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="w-4 h-4 bg-retro-yellow border-2 border-navy"
                animate={{
                  scale: status === 'loading' ? [1, 1.3, 1] : [1, 1, 1],
                  y: status === 'loading' ? [0, -10, 0] : [0, 0, 0],
                }}
                transition={{
                  duration: 0.8,
                  repeat: status === 'loading' ? Infinity : 0,
                  delay: i * 0.15,
                }}
              />
            ))}
          </div>

          {/* Floating decorative elements */}
          <motion.div
            className="absolute top-4 right-4"
            animate={{
              y: [0, -8, 0],
              rotate: [0, 15, -15, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          >
            <Heart className="w-6 h-6 text-cardinal-red fill-current" />
          </motion.div>

          <motion.div
            className="absolute bottom-4 left-4"
            animate={{
              y: [0, -8, 0],
              rotate: [0, -15, 15, 0],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
            }}
          >
            <Ghost className="w-6 h-6 text-retro-plum" />
          </motion.div>

          {/* Corner decorations */}
          <motion.div
            className="absolute -top-2 -right-2 w-6 h-6 bg-retro-orange border-4 border-navy"
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          />
          <motion.div
            className="absolute -bottom-2 -left-2 w-6 h-6 bg-retro-mint border-4 border-navy"
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: 1,
            }}
          />
        </div>
      </motion.div>
    </div>
  );
}
