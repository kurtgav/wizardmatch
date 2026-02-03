'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Heart, Flower2, Flower, PartyPopper, ArrowRight } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

function CompleteContent() {
    const searchParams = useSearchParams();
    const message = searchParams.get('message') || 'Your submission has been saved!';

    return (
        <div className="min-h-screen bg-retro-cream flex flex-col relative overflow-hidden">
            <Header />

            {/* Background Decorative Particles */}
            <div className="absolute inset-0 pointer-events-none">
                {[...Array(15)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute"
                        initial={{
                            x: Math.random() * 100 + '%',
                            y: Math.random() * 100 + '%',
                            opacity: 0,
                            scale: 0.5
                        }}
                        animate={{
                            y: ['0%', '-10%', '0%'],
                            opacity: [0, 0.3, 0],
                            scale: [0.5, 1, 0.5]
                        }}
                        transition={{
                            duration: Math.random() * 4 + 3,
                            repeat: Infinity,
                            ease: 'easeInOut',
                            delay: Math.random() * i
                        }}
                    >
                        <Flower className={`w-${Math.floor(Math.random() * 4) + 4} h-${Math.floor(Math.random() * 4) + 4} text-retro-sky`} />
                    </motion.div>
                ))}
            </div>

            <main className="flex-1 flex items-center justify-center py-20 px-4 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="max-w-2xl w-full"
                >
                    <div className="bg-white border-8 border-navy shadow-[16px_16px_0_0_#1E3A8A] p-8 md:p-16 text-center relative overflow-hidden">
                        {/* Background Grid Pattern */}
                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                            <div className="absolute inset-0" style={{
                                backgroundImage: `
                                    linear-gradient(to right, #1E3A8A 2px, transparent 2px),
                                    linear-gradient(to bottom, #1E3A8A 2px, transparent 2px)
                                `,
                                backgroundSize: '24px 24px',
                            }} />
                        </div>

                        {/* Animated Side Flags */}
                        <div className="absolute top-0 left-0 w-12 h-12 bg-retro-pink border-b-4 border-r-4 border-navy -translate-x-6 -translate-y-6 rotate-45" />
                        <div className="absolute top-0 right-0 w-12 h-12 bg-retro-orange border-b-4 border-l-4 border-navy translate-x-6 -translate-y-6 -rotate-45" />

                        {/* Success Icon Group */}
                        <div className="relative mb-10">
                            <motion.div
                                className="w-28 h-28 bg-retro-mint border-4 border-navy mx-auto flex items-center justify-center shadow-[8px_8px_0_0_#1E3A8A] relative z-10"
                                animate={{
                                    y: [0, -10, 0],
                                    rotateY: [0, 180, 360],
                                }}
                                transition={{
                                    duration: 4,
                                    repeat: Infinity,
                                    ease: 'linear',
                                }}
                            >
                                <PartyPopper className="w-14 h-14 text-navy" />
                            </motion.div>

                            {/* Floating elements around icon */}
                            <motion.div
                                className="absolute top-0 left-1/2 -translate-x-20 text-retro-pink"
                                animate={{ scale: [1, 1.5, 1], opacity: [0, 1, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                <Flower2 className="w-8 h-8" />
                            </motion.div>
                            <motion.div
                                className="absolute bottom-0 left-1/2 translate-x-12 text-retro-yellow"
                                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
                            >
                                <Flower2 className="w-10 h-10" />
                            </motion.div>
                        </div>

                        {/* Text Content */}
                        <div className="relative z-10 space-y-4 mb-12">
                            <motion.h1
                                className="font-display font-bold text-4xl md:text-5xl text-navy"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                MISSION COMPLETE!
                            </motion.h1>
                            <motion.p
                                className="font-body text-xl text-navy/70 max-w-md mx-auto"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                            >
                                {message}
                            </motion.p>
                        </div>

                        {/* Heart Row */}
                        <div className="flex justify-center gap-6 mb-12 relative z-10">
                            {[...Array(5)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    animate={{
                                        y: [0, -10, 0],
                                        scale: [1, 1.2, 1],
                                    }}
                                    transition={{
                                        duration: 1.5,
                                        repeat: Infinity,
                                        delay: i * 0.2,
                                    }}
                                >
                                    <Heart
                                        className={`w-8 h-8 fill-current ${i % 2 === 0 ? 'text-cardinal-red' : 'text-retro-pink'
                                            }`}
                                    />
                                </motion.div>
                            ))}
                        </div>

                        {/* Action buttons */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Link
                                    href="/matches"
                                    className="flex items-center justify-center gap-3 w-full bg-retro-yellow text-navy px-8 py-5 border-4 border-navy font-pixel text-sm shadow-[8px_8px_0_0_#1E3A8A] hover:shadow-[4px_4px_0_0_#1E3A8A] hover:translate-x-1 hover:translate-y-1 transition-all duration-300"
                                >
                                    FIND MATCHES
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                            </motion.div>

                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Link
                                    href="/"
                                    className="flex items-center justify-center w-full bg-white text-navy px-8 py-5 border-4 border-navy font-pixel text-sm shadow-[8px_8px_0_0_#1E3A8A] hover:shadow-[4px_4px_0_0_#1E3A8A] hover:translate-x-1 hover:translate-y-1 transition-all duration-300"
                                >
                                    GO HOME
                                </Link>
                            </motion.div>
                        </div>
                    </div>

                    {/* Footer decoration */}
                    <div className="mt-12 flex items-center justify-center gap-4">
                        <div className="h-1 flex-1 bg-navy/10" />
                        <div className="flex items-center gap-3">
                            <Flower2 className="w-6 h-6 text-retro-plum" />
                            <span className="font-pixel text-[10px] text-navy/40 uppercase tracking-widest">Wizard Match v1.0</span>
                            <Flower2 className="w-6 h-6 text-retro-plum" />
                        </div>
                        <div className="h-1 flex-1 bg-navy/10" />
                    </div>
                </motion.div>
            </main>

            <Footer />
        </div>
    );
}

function LoadingFallback() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-retro-cream relative overflow-hidden">
            {/* Ambient Background Particles */}
            <div className="absolute inset-0 pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-2 h-2 bg-retro-sky rounded-full opacity-20"
                        initial={{
                            x: Math.random() * 100 + '%',
                            y: Math.random() * 100 + '%',
                        }}
                        animate={{
                            y: ['-10%', '110%'],
                            opacity: [0, 0.5, 0],
                        }}
                        transition={{
                            duration: Math.random() * 3 + 2,
                            repeat: Infinity,
                            ease: 'linear',
                            delay: Math.random() * 2,
                        }}
                    />
                ))}
            </div>

            <div className="relative z-10 flex flex-col items-center gap-8">
                <motion.div
                    className="w-24 h-24 bg-white border-8 border-navy relative flex items-center justify-center shadow-[12px_12px_0_0_#1E3A8A]"
                    animate={{
                        y: [0, -20, 0],
                        rotate: [0, 10, -10, 0],
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                >
                    <Flower2 className="w-12 h-12 text-retro-yellow animate-pulse" />

                    {/* Corner bits for pixel feel */}
                    <div className="absolute -top-2 -left-2 w-4 h-4 bg-retro-pink border-4 border-navy" />
                    <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-retro-mint border-4 border-navy" />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
                    className="font-pixel text-navy text-sm tracking-widest"
                >
                    PREPARING YOUR MATCHES...
                </motion.div>
            </div>
        </div>
    );
}

export default function SurveyCompletePage() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <CompleteContent />
        </Suspense>
    );
}
