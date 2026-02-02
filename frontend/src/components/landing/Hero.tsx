'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, Star, ArrowRight, Ghost, Gamepad2 } from 'lucide-react';
import { formatTimeRemaining } from '@/lib/utils';
import Image from 'next/image';
import { api } from '@/lib/api';

interface PublicStats {
  totalUsers: number;
  completedSurveys: number;
  totalMatches: number;
  matchReleaseDate: string;
}

export default function Hero() {
  const [stats, setStats] = useState<PublicStats | null>(null);
  const [timeRemaining, setTimeRemaining] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isReleased, setIsReleased] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/public/stats`);
        const data = await response.json();
        if (data.success) {
          setStats(data.data);

          // Check if matches have been released
          const now = new Date().getTime();
          const releaseDate = new Date(data.data.matchReleaseDate).getTime();
          setIsReleased(now >= releaseDate);

          // Calculate initial time remaining
          const timeLeft = formatTimeRemaining(data.data.matchReleaseDate);
          setTimeRemaining(timeLeft);
        }
      } catch (error) {
        console.error('Failed to load stats:', error);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  useEffect(() => {
    if (!stats) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const releaseDate = new Date(stats.matchReleaseDate).getTime();
      const difference = releaseDate - now;

      if (difference <= 0) {
        setIsReleased(true);
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeRemaining({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(timer);
  }, [stats]);

  // Retro pixel sparkles
  const pixelSparkles = Array.from({ length: 16 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: i * 0.15,
  }));

  return (
    <section className="relative min-h-screen pt-24 pb-16 overflow-hidden bg-retro-cream">
      {/* Pixel Grid Background */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(to right, #1E3A8A 1px, transparent 1px),
            linear-gradient(to bottom, #1E3A8A 1px, transparent 1px)
          `,
          backgroundSize: '32px 32px',
        }} />
      </div>

      {/* Floating Pixel Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {pixelSparkles.map((sparkle) => (
          <motion.div
            key={sparkle.id}
            className="absolute"
            style={{
              left: `${sparkle.x}%`,
              top: `${sparkle.y}%`,
            }}
            animate={{
              y: [0, -24, 0],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: sparkle.delay,
            }}
          >
            <Star className="w-4 h-4 text-retro-yellow fill-retro-yellow" />
          </motion.div>
        ))}

        {/* Retro Hearts */}
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={`heart-${i}`}
            className="absolute"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -40, 0],
              x: [0, 8, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 5 + Math.random() * 3,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          >
            <Heart
              className={`${
                i % 2 === 0 ? 'text-retro-pink' : 'text-cardinal-red'
              } fill-current`}
              style={{ width: 16 + i * 2, height: 16 + i * 2 }}
            />
          </motion.div>
        ))}
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="order-2 lg:order-1"
          >
            {/* Retro Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-6"
            >
              <div className="inline-block bg-retro-lavender border-4 border-retro-plum px-6 py-3 shadow-[4px_4px_0_0_#1E3A8A]">
                <div className="flex items-center gap-3">
                  <Gamepad2 className="w-5 h-5 text-cardinal-red" />
                  <p className="font-pixel text-xs text-navy">
                    8-BIT MATCHMAKING
                  </p>
                  <Sparkles className="w-5 h-5 text-retro-yellow" />
                </div>
              </div>
            </motion.div>

            {/* Main Title - Pixel Font Style */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mb-6"
            >
              <h1 className="font-display font-black text-5xl md:text-6xl lg:text-7xl leading-none mb-4">
                <div className="flex items-center gap-3 mb-2">
                  <Ghost className="w-12 h-12 text-cardinal-red fill-cardinal-red animate-bounce" />
                  <span className="text-navy">Find Your</span>
                </div>
                <div className="relative">
                  <span className="text-cardinal-red">Perfect Match</span>
                  <motion.div
                    className="absolute -right-4 -top-4 w-8 h-8 bg-retro-yellow border-4 border-navy"
                    animate={{
                      rotate: [0, 90, 180, 270, 360],
                    }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  />
                </div>
              </h1>
              <motion.p
                className="font-body text-xl md:text-2xl text-navy/80 mb-4"
                animate={{
                  opacity: [0.8, 1, 0.8],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              >
                {'►'} Press Start to Find Love! {'◄'}
              </motion.p>
            </motion.div>

            <motion.p
              className="font-body text-lg text-navy/90 mb-8 leading-relaxed max-w-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Our Love Witch has brewed a magical potion to match Wizards based on
              <span className="font-bold text-cardinal-red"> values, personality & destiny</span>.
              Your perfect match is just a spell away!
            </motion.p>

            {/* Retro Stats Cards */}
            <motion.div
              className="grid grid-cols-2 gap-4 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="bg-retro-sky border-4 border-navy p-5 shadow-[6px_6px_0_0_#1E3A8A]">
                <p className="font-pixel text-3xl text-navy mb-2">{loading ? '...' : stats?.totalUsers || 0}</p>
                <p className="font-body text-sm text-navy/80">Wizards Joined</p>
              </div>

              <div className="bg-retro-pink border-4 border-navy p-5 shadow-[6px_6px_0_0_#1E3A8A]">
                <p className="font-pixel text-3xl text-navy mb-2">{loading ? '...' : stats?.completedSurveys || 0}</p>
                <p className="font-body text-sm text-navy/80">Ready to Match</p>
              </div>
            </motion.div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-4"
            >
              <Link
                href="/auth/login"
                className="group inline-flex items-center gap-4 bg-retro-yellow text-navy px-10 py-5 border-4 border-navy font-pixel text-sm shadow-[8px_8px_0_0_#1E3A8A] hover:shadow-[4px_4px_0_0_#1E3A8A] hover:translate-x-1 hover:translate-y-1 transition-all"
              >
                <span>START GAME</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </Link>

              <p className="font-body text-sm text-navy/70 flex items-center gap-2 text-center">
                <Heart className="w-4 h-4 text-cardinal-red fill-current" />
                Sign in with Google Account + Student ID
                <Heart className="w-4 h-4 text-cardinal-red fill-current" />
              </p>
            </motion.div>

            {/* Retro Pixel Border Decoration */}
            <motion.div
              className="mt-8 flex items-center gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <div className="h-1 flex-1 bg-retro-lavender" />
              <div className="flex gap-2">
                <div className="w-3 h-3 bg-retro-pink border-2 border-navy" />
                <div className="w-3 h-3 bg-retro-sky border-2 border-navy" />
                <div className="w-3 h-3 bg-retro-yellow border-2 border-navy" />
                <div className="w-3 h-3 bg-retro-lavender border-2 border-navy" />
                <div className="w-3 h-3 bg-retro-plum border-2 border-navy" />
              </div>
              <div className="h-1 flex-1 bg-retro-lavender" />
            </motion.div>
          </motion.div>

          {/* Right Column - Love Witch Pixel Art */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="order-1 lg:order-2"
          >
            {/* Retro Frame */}
            <div className="relative">
              {/* Animated Pixel Border */}
              <motion.div
                className="absolute -inset-4 border-8 border-navy"
                animate={{
                  borderColor: ['#1E3A8A', '#E52037', '#FFC0CB', '#87CEEB', '#1E3A8A'],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />

              {/* Inner Frame */}
              <div className="relative bg-white border-4 border-navy p-4 shadow-[12px_12px_0_0_#1E3A8A]">
                {/* Mascot Image - Smaller size */}
                <motion.div
                  className="relative aspect-[4/3] bg-gradient-to-br from-retro-lavender to-retro-pink rounded-none"
                  animate={{
                    y: [0, -8, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <Image
                    src="/images/wizardmatch-logo.png"
                    alt="Love Witch Mascot - Magical Matchmaker"
                    fill
                    className="object-contain p-6"
                    priority
                  />

                  {/* Floating Pixel Elements */}
                  <motion.div
                    className="absolute top-4 right-4"
                    animate={{
                      y: [0, -12, 0],
                      rotate: [0, 15, -15, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                  >
                    <div className="w-12 h-12 bg-retro-yellow border-4 border-navy flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-navy fill-navy" />
                    </div>
                  </motion.div>

                  <motion.div
                    className="absolute bottom-8 left-8"
                    animate={{
                      y: [0, -10, 0],
                      rotate: [0, -15, 15, 0],
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      delay: 0.5,
                    }}
                  >
                    <div className="w-10 h-10 bg-cardinal-red border-4 border-navy flex items-center justify-center">
                      <Heart className="w-5 h-5 text-white fill-white" />
                    </div>
                  </motion.div>
                </motion.div>

                {/* Retro Countdown Timer or Matches Released */}
                <motion.div
                  className="mt-6 bg-navy border-4 border-retro-yellow p-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  {isReleased ? (
                    // Matches Released Message
                    <div className="text-center">
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                      >
                        <p className="font-pixel text-sm text-retro-pink mb-3">
                          ✨ PERFECT MATCHES RELEASED! ✨
                        </p>
                        <p className="font-pixel text-lg text-retro-yellow mb-2">
                          {stats?.totalMatches || 0} Wizards Matched
                        </p>
                        <p className="font-body text-xs text-white/80">
                          Check your matches now!
                        </p>
                      </motion.div>
                    </div>
                  ) : (
                    // Countdown Timer
                    <>
                      <p className="font-pixel text-xs text-retro-yellow mb-3 text-center">
                        MAGIC REVEALS IN:
                      </p>
                      <div className="grid grid-cols-4 gap-2 text-center">
                        <div className="bg-retro-pink border-4 border-navy p-3">
                          <p className="font-pixel text-xl text-navy">
                            {String(timeRemaining.days).padStart(2, '0')}
                          </p>
                          <p className="font-body text-xs text-navy/80 mt-1">DAYS</p>
                        </div>

                        <div className="bg-retro-sky border-4 border-navy p-3">
                          <p className="font-pixel text-xl text-navy">
                            {String(timeRemaining.hours).padStart(2, '0')}
                          </p>
                          <p className="font-body text-xs text-navy/80 mt-1">HOURS</p>
                        </div>

                        <div className="bg-retro-lavender border-4 border-navy p-3">
                          <p className="font-pixel text-xl text-navy">
                            {String(timeRemaining.minutes).padStart(2, '0')}
                          </p>
                          <p className="font-body text-xs text-navy/80 mt-1">MINS</p>
                        </div>

                        <div className="bg-retro-yellow border-4 border-navy p-3">
                          <p className="font-pixel text-xl text-navy">
                            {String(timeRemaining.seconds).padStart(2, '0')}
                          </p>
                          <p className="font-body text-xs text-navy/80 mt-1">SECS</p>
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              </div>

              {/* Decorative Corner Pixels */}
              <motion.div
                className="absolute -top-2 -left-2 w-6 h-6 bg-retro-orange border-4 border-navy"
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              />
              <motion.div
                className="absolute -top-2 -right-2 w-6 h-6 bg-retro-mint border-4 border-navy"
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: 0.5,
                }}
              />
              <motion.div
                className="absolute -bottom-2 -left-2 w-6 h-6 bg-retro-aqua border-4 border-navy"
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: 1,
                }}
              />
              <motion.div
                className="absolute -bottom-2 -right-2 w-6 h-6 bg-retro-plum border-4 border-navy"
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: 1.5,
                }}
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Retro Bottom Wave with Pixel Effect */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          className="w-full h-16 text-retro-lavender fill-current"
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
        >
          <motion.path
            d="M0,40 L40,20 L80,40 L120,20 L160,40 L200,20 L240,40 L280,20 L320,40 L360,20 L400,40 L440,20 L480,40 L520,20 L560,40 L600,20 L640,40 L680,20 L720,40 L760,20 L800,40 L840,20 L880,40 L920,20 L960,40 L1000,20 L1040,40 L1080,20 L1120,40 L1160,20 L1200,40 L1240,20 L1280,40 L1320,20 L1360,40 L1400,20 L1440,40 L1440,80 L0,80 Z"
            animate={{
              d: [
                'M0,40 L40,20 L80,40 L120,20 L160,40 L200,20 L240,40 L280,20 L320,40 L360,20 L400,40 L440,20 L480,40 L520,20 L560,40 L600,20 L640,40 L680,20 L720,40 L760,20 L800,40 L840,20 L880,40 L920,20 L960,40 L1000,20 L1040,40 L1080,20 L1120,40 L1160,20 L1200,40 L1240,20 L1280,40 L1320,20 L1360,40 L1400,20 L1440,40 L1440,80 L0,80 Z',
                'M0,20 L40,40 L80,20 L120,40 L160,20 L200,40 L240,20 L280,40 L320,20 L360,40 L400,20 L440,40 L480,20 L520,40 L560,20 L600,40 L640,20 L680,40 L720,20 L760,40 L800,20 L840,40 L880,20 L920,40 L960,20 L1000,40 L1040,20 L1080,40 L1120,20 L1160,40 L1200,20 L1240,40 L1280,20 L1320,40 L1360,20 L1400,40 L1440,20 L1440,80 L0,80 Z',
                'M0,40 L40,20 L80,40 L120,20 L160,40 L200,20 L240,40 L280,20 L320,40 L360,20 L400,40 L440,20 L480,40 L520,20 L560,40 L600,20 L640,40 L680,20 L720,40 L760,20 L800,40 L840,20 L880,40 L920,20 L960,40 L1000,20 L1040,40 L1080,20 L1120,40 L1160,20 L1200,40 L1240,20 L1280,40 L1320,20 L1360,40 L1400,20 L1440,40 L1440,80 L0,80 Z',
              ],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </svg>
      </div>
    </section>
  );
}
