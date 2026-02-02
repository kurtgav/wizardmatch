'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Heart, Sparkles, Wand2, Ghost, Shield } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = () => {
    setIsLoading(true);
    // Redirect to backend Google OAuth
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-retro-cream py-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-lg w-full mx-auto px-4"
      >
        {/* Retro Card */}
        <div className="bg-white border-8 border-navy shadow-[12px_12px_0_0_#1E3A8A] p-8 md:p-12 relative overflow-hidden">
          {/* Background Pixel Pattern */}
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            <div className="absolute inset-0" style={{
              backgroundImage: `
                linear-gradient(to right, #1E3A8A 2px, transparent 2px),
                linear-gradient(to bottom, #1E3A8A 2px, transparent 2px)
              `,
              backgroundSize: '16px 16px',
            }} />
          </div>

          {/* Logo */}
          <motion.div
            className="text-center mb-8"
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <div className="w-20 h-20 bg-retro-pink border-4 border-navy mx-auto mb-4 flex items-center justify-center shadow-[4px_4px_0_0_#1E3A8A]">
              <span className="font-pixel text-3xl text-navy font-bold">MM</span>
            </div>
            <h1 className="font-display font-black text-4xl text-navy mb-2">
              Perfect Match
            </h1>
            <div className="flex items-center justify-center gap-2 text-cardinal-red">
              <Wand2 className="w-4 h-4" />
              <span className="font-pixel text-xs">By Mapúa MCL</span>
            </div>
          </motion.div>

          {/* Welcome Message */}
          <div className="text-center mb-8">
            <h2 className="font-display font-bold text-2xl text-navy mb-3">
              Welcome, Wizard! 🔮
            </h2>
            <p className="font-body text-navy/80">
              Sign in to discover your magical match
            </p>
          </div>

          {/* Requirements */}
          <div className="bg-retro-lavender border-4 border-navy p-6 mb-8 shadow-[4px_4px_0_0_#1E3A8A]">
            <h3 className="font-pixel text-sm text-navy mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-cardinal-red" />
              GET STARTED:
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 bg-retro-yellow border-2 border-navy flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="font-pixel text-xs text-navy">1</span>
                </div>
                <p className="font-body text-sm text-navy">
                  <strong>Any personal Google Account</strong>
                </p>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 bg-retro-pink border-2 border-navy flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="font-pixel text-xs text-navy">2</span>
                </div>
                <p className="font-body text-sm text-navy">
                  <strong>Complete the survey</strong> with your Student ID
                </p>
              </li>
            </ul>
          </div>

          {/* Google Login Button */}
          <motion.button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full bg-retro-yellow text-navy px-8 py-5 border-4 border-navy font-pixel text-sm shadow-[8px_8px_0_0_#1E3A8A] hover:shadow-[4px_4px_0_0_#1E3A8A] hover:translate-x-1 hover:translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
            whileHover={{ scale: isLoading ? 1 : 1.02 }}
            whileTap={{ scale: isLoading ? 1 : 0.98 }}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-3 border-navy border-t-transparent rounded-full animate-spin"></div>
                <span>CONNECTING...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-3">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>SIGN IN WITH GOOGLE</span>
                <Sparkles className="w-5 h-5 text-cardinal-red" />
              </div>
            )}

            {/* Animated corner decoration */}
            {!isLoading && (
              <motion.div
                className="absolute top-0 right-0 w-6 h-6 bg-cardinal-red"
                animate={{
                  scale: [1, 0, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              />
            )}
          </motion.button>

          {/* Info */}
          <div className="mt-6 text-center">
            <p className="font-body text-xs text-navy/70 mb-2">
              🔒 Your information is secure and encrypted
            </p>
            <p className="font-body text-xs text-navy/60">
              By signing in, you agree to our{' '}
              <a href="/terms" className="text-cardinal-red hover:underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy" className="text-cardinal-red hover:underline">
                Privacy Policy
              </a>
            </p>
          </div>

          {/* Floating decorative elements */}
          <motion.div
            className="absolute -top-4 -right-4 w-8 h-8 bg-retro-orange border-4 border-navy"
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          />
          <motion.div
            className="absolute -bottom-4 -left-4 w-8 h-8 bg-retro-mint border-4 border-navy"
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

        {/* Bottom decoration */}
        <motion.div
          className="flex justify-center mt-8"
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-cardinal-red fill-current animate-pulse" />
            <Ghost className="w-6 h-6 text-retro-plum" />
            <Heart className="w-6 h-6 text-retro-pink fill-current animate-pulse" />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
