'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Flower2, Flower, ArrowRight, Ghost, Gamepad2 } from 'lucide-react';
import { formatTimeRemaining } from '@/lib/utils';
import Image from 'next/image';

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
        const timer = setInterval(() => {
            const now = new Date().getTime();
            // Target Valentine's Day 2026
            const valentineDate = new Date('2026-02-14T00:00:00').getTime();
            const difference = valentineDate - now;

            if (difference <= 0) {
                // If 2026 passed, target 2027
                const nextValentine = new Date('2027-02-14T00:00:00').getTime();
                const nextDiff = nextValentine - now;

                const days = Math.floor(nextDiff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((nextDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((nextDiff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((nextDiff % (1000 * 60)) / 1000);
                setTimeRemaining({ days, hours, minutes, seconds });
                return;
            }

            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);

            setTimeRemaining({ days, hours, minutes, seconds });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Reduced retro pixel sparkles for performance
    const pixelSparkles = Array.from({ length: 8 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: i * 0.2,
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
                        <Flower className="w-4 h-4 text-retro-yellow fill-retro-yellow" />
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
                        viewport={{ once: true }}
                    >
                        <Heart
                            className={`${i % 2 === 0 ? 'text-retro-pink' : 'text-cardinal-red'
                                } fill-current`}
                            style={{ width: 16 + i * 2, height: 16 + i * 2 }}
                        />
                    </motion.div>
                ))}
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col lg:grid lg:grid-cols-2 gap-12 items-center">
                    {/* 1. Content Section - Top on Mobile, Left on Desktop */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="order-1 lg:order-1"
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
                                        FLOWER POWER MATCHMAKING
                                    </p>
                                    <Flower2 className="w-5 h-5 text-retro-yellow" />
                                </div>
                            </div>
                        </motion.div>

                        {/* Main Title */}
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
                                    <span className="text-cardinal-red">Wizard Match</span>
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
                            Your wizard match is just a spell away!
                        </motion.p>

                        {/* CTA Button */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="space-y-4 mb-8"
                        >
                            <motion.div whileTap={{ scale: 0.97 }}>
                                <Link
                                    href="/auth/login"
                                    className="group inline-flex items-center gap-4 bg-retro-yellow text-navy px-10 py-5 border-4 border-navy font-pixel text-sm shadow-[8px_8px_0_0_#1E3A8A] hover:shadow-[4px_4px_0_0_#1E3A8A] hover:translate-x-1 hover:translate-y-1 transition-all"
                                >
                                    <span>START GAME</span>
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                                </Link>
                            </motion.div>

                            <p className="font-body text-sm text-navy/70 flex items-center gap-2">
                                <Heart className="w-4 h-4 text-cardinal-red fill-current" />
                                Sign in with any Google Account
                                <Heart className="w-4 h-4 text-cardinal-red fill-current" />
                            </p>
                        </motion.div>

                        {/* Stats Section */}
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

                        {/* Timer UI Section (Mobile Only) */}
                        <div className="lg:hidden mt-8">
                            <motion.div
                                className="border-4 border-retro-yellow bg-navy p-1 shadow-[8px_8px_0_0_#1E3A8A]"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.7 }}
                            >
                                <div className="p-4 border-2 border-retro-yellow/20">
                                    <p className="font-pixel text-[10px] text-retro-yellow mb-4 text-center tracking-widest uppercase">
                                        VALENTINE COUNTDOWN:
                                    </p>
                                    <div className="grid grid-cols-4 gap-2">
                                        <div className="bg-retro-pink border-2 border-navy p-2 flex flex-col items-center justify-center">
                                            <p className="font-pixel text-lg text-navy leading-none mb-1">
                                                {String(timeRemaining.days).padStart(2, '0')}
                                            </p>
                                            <p className="font-body text-[6px] font-bold text-navy/60 uppercase">DAYS</p>
                                        </div>
                                        <div className="bg-retro-sky border-2 border-navy p-2 flex flex-col items-center justify-center">
                                            <p className="font-pixel text-lg text-navy leading-none mb-1">
                                                {String(timeRemaining.hours).padStart(2, '0')}
                                            </p>
                                            <p className="font-body text-[6px] font-bold text-navy/60 uppercase">HRS</p>
                                        </div>
                                        <div className="bg-retro-lavender border-2 border-navy p-2 flex flex-col items-center justify-center">
                                            <p className="font-pixel text-lg text-navy leading-none mb-1">
                                                {String(timeRemaining.minutes).padStart(2, '0')}
                                            </p>
                                            <p className="font-body text-[6px] font-bold text-navy/60 uppercase">MINS</p>
                                        </div>
                                        <div className="bg-retro-yellow border-2 border-navy p-2 flex flex-col items-center justify-center">
                                            <p className="font-pixel text-lg text-navy leading-none mb-1 text-cardinal-red">
                                                {String(timeRemaining.seconds).padStart(2, '0')}
                                            </p>
                                            <p className="font-body text-[6px] font-bold text-navy/60 uppercase">SECS</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Retro Pixel Border Decoration */}
                        <motion.div
                            className="mt-12 flex items-center gap-3"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.7 }}
                        >
                            <div className="h-1 flex-1 bg-retro-lavender" />
                            <div className="flex gap-2">
                                <div className="w-3 h-3 bg-retro-pink border-2 border-navy" />
                                <div className="w-3 h-3 bg-retro-sky border-2 border-navy" />
                                <div className="w-3 h-3 bg-retro-yellow border-2 border-navy" />
                            </div>
                            <div className="h-1 flex-1 bg-retro-lavender" />
                        </motion.div>
                    </motion.div>

                    {/* 2. Logo Box - Bottom on Mobile, Right on Desktop */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                        className="order-2 lg:order-2 w-full max-w-md lg:max-w-[450px] mx-auto"
                    >
                        <div className="relative">
                            <div className="bg-white border-8 border-navy p-4 shadow-[16px_16px_0_0_#1E3A8A] relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-6 h-6 bg-[#FF9F1C] border-b-4 border-r-4 border-navy z-20" />
                                <div className="absolute top-0 right-0 w-6 h-6 bg-[#B5FFD9] border-b-4 border-l-4 border-navy z-20" />
                                <div className="absolute bottom-0 left-0 w-6 h-6 bg-[#87CEEB] border-t-4 border-r-4 border-navy z-20" />
                                <div className="absolute bottom-0 right-0 w-6 h-6 bg-[#9D4EDD] border-t-4 border-l-4 border-navy z-20" />

                                <div className="relative aspect-square bg-gradient-to-br from-white via-retro-pink/20 to-retro-pink/40 flex items-center justify-center p-8 overflow-hidden">
                                    <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
                                        backgroundImage: `linear-gradient(45deg, #1E3A8A 1px, transparent 1px), linear-gradient(-45deg, #1E3A8A 1px, transparent 1px)`,
                                        backgroundSize: '20px 20px'
                                    }} />

                                    <motion.div
                                        className="relative w-8/9 aspect-square flex items-center justify-center p-4"
                                        animate={{
                                            y: [0, -10, 0],
                                        }}
                                        transition={{
                                            duration: 6,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                    >
                                        <Image
                                            src="/images/wizardmatch-logo.png"
                                            alt="Wizard Match Logo"
                                            width={400}
                                            height={400}
                                            className="object-contain"
                                            priority
                                        />
                                    </motion.div>

                                    <motion.div
                                        className="absolute top-10 right-10 w-16 h-16 bg-retro-yellow border-4 border-navy shadow-[4px_4px_0_0_#1E3A8A] flex items-center justify-center"
                                        animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                                        transition={{ duration: 3, repeat: Infinity }}
                                    >
                                        <Flower2 className="w-8 h-8 text-navy fill-navy" />
                                    </motion.div>

                                    <motion.div
                                        className="absolute bottom-10 left-10 w-14 h-14 bg-cardinal-red border-4 border-navy shadow-[4px_4px_0_0_#1E3A8A] flex items-center justify-center"
                                        animate={{ scale: [1, 0.95, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    >
                                        <Heart className="w-6 h-6 text-white fill-white" />
                                    </motion.div>
                                </div>
                            </div>

                            {/* Countdown Section - Desktop Only */}
                            <div className="hidden lg:block">
                                <motion.div
                                    className="mt-8 border-4 border-retro-yellow bg-navy p-1 shadow-[8px_8px_0_0_#1E3A8A]"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 }}
                                >
                                    <div className="p-4 border-2 border-retro-yellow/20">
                                        <p className="font-pixel text-[10px] text-retro-yellow mb-4 text-center tracking-widest uppercase">
                                            VALENTINE COUNTDOWN:
                                        </p>
                                        <div className="grid grid-cols-4 gap-3">
                                            <div className="bg-retro-pink border-4 border-navy p-4 flex flex-col items-center justify-center shadow-[4px_4px_0_0_rgba(0,0,0,0.2)]">
                                                <p className="font-pixel text-2xl text-navy leading-none mb-1">
                                                    {String(timeRemaining.days).padStart(2, '0')}
                                                </p>
                                                <p className="font-body text-[8px] font-bold text-navy/60 uppercase tracking-tighter">DAYS</p>
                                            </div>
                                            <div className="bg-retro-sky border-4 border-navy p-4 flex flex-col items-center justify-center shadow-[4px_4px_0_0_rgba(0,0,0,0.2)]">
                                                <p className="font-pixel text-2xl text-navy leading-none mb-1">
                                                    {String(timeRemaining.hours).padStart(2, '0')}
                                                </p>
                                                <p className="font-body text-[8px] font-bold text-navy/60 uppercase tracking-tighter">HOURS</p>
                                            </div>
                                            <div className="bg-retro-lavender border-4 border-navy p-4 flex flex-col items-center justify-center shadow-[4px_4px_0_0_rgba(0,0,0,0.2)]">
                                                <p className="font-pixel text-2xl text-navy leading-none mb-1">
                                                    {String(timeRemaining.minutes).padStart(2, '0')}
                                                </p>
                                                <p className="font-body text-[8px] font-bold text-navy/60 uppercase tracking-tighter">MINS</p>
                                            </div>
                                            <div className="bg-retro-yellow border-4 border-navy p-4 flex flex-col items-center justify-center shadow-[4px_4px_0_0_rgba(0,0,0,0.2)]">
                                                <p className="font-pixel text-2xl text-navy leading-none mb-1 text-cardinal-red">
                                                    {String(timeRemaining.seconds).padStart(2, '0')}
                                                </p>
                                                <p className="font-body text-[8px] font-bold text-navy/60 uppercase tracking-tighter">SECS</p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Retro Bottom Wave */}
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
