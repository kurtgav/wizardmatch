'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Heart, Flower2, Wand2, Ghost, Shield, AlertCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

function SignupContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, loading: authLoading } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Redirect if already logged in
        if (!authLoading && user) {
            router.push('/survey');
            return;
        }

        const errorParam = searchParams.get('error');
        const messageParam = searchParams.get('message');

        if (messageParam) {
            setError(decodeURIComponent(messageParam));
            return;
        }

        if (errorParam) {
            setError('An error occurred during sign up. Please try again.');
        }

        // Handle Supabase OAuth callback
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');

        if (accessToken && refreshToken) {
            // Supabase will handle the session automatically
            router.push('/survey');
        }
    }, [searchParams, user, authLoading, router]);

    const handleGoogleSignup = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const { data, error } = await supabase().auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/signup`,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    },
                },
            });

            if (error) throw error;
            if (data.url) {
                window.location.href = data.url;
            }
        } catch (err) {
            console.error('Signup error:', err);
            setError('Failed to initiate sign up. Please try again.');
            setIsLoading(false);
        }
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
                        <div className="w-20 h-20 bg-retro-yellow border-4 border-navy mx-auto mb-4 flex items-center justify-center shadow-[4px_4px_0_0_#1E3A8A] relative p-3">
                            <Flower2 className="absolute -top-2 -right-2 w-8 h-8 text-cardinal-red animate-pulse" />
                            <img src="/images/wizardmatch-logo.png" alt="Wizard Match" className="w-full h-full object-contain" />
                        </div>
                        <h1 className="font-display font-black text-4xl text-navy mb-2">
                            Join the Magic
                        </h1>
                        <div className="flex items-center justify-center gap-2 text-cardinal-red">
                            <Wand2 className="w-4 h-4" />
                            <span className="font-pixel text-xs">Begin Your Query</span>
                        </div>
                    </motion.div>

                    {/* Error Message */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6 p-4 bg-cardinal-red/10 border-4 border-cardinal-red shadow-[4px_4px_0_0_#B91C1C]"
                        >
                            <div className="flex items-center gap-3">
                                <AlertCircle className="w-5 h-5 text-cardinal-red flex-shrink-0" />
                                <p className="font-body text-sm text-cardinal-red">{error}</p>
                            </div>
                        </motion.div>
                    )}

                    {/* Welcome Message */}
                    <div className="text-center mb-8">
                        <p className="font-body text-navy/80">
                            Create your profile to find your perfect match this Valentine's
                        </p>
                    </div>

                    {/* What to expect */}
                    <div className="bg-retro-mint border-4 border-navy p-6 mb-8 shadow-[4px_4px_0_0_#1E3A8A]">
                        <h3 className="font-pixel text-sm text-navy mb-4 flex items-center gap-2">
                            <Flower2 className="w-4 h-4 text-cardinal-red" />
                            THE BLOOM INCLUDES:
                        </h3>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3">
                                <div className="w-5 h-5 bg-white border-2 border-navy flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <Heart className="w-3 h-3 text-cardinal-red fill-current" />
                                </div>
                                <p className="font-body text-sm text-navy">
                                    <strong>Compatibility Matching</strong> based on your interests
                                </p>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-5 h-5 bg-white border-2 border-navy flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <Ghost className="w-3 h-3 text-retro-plum fill-current" />
                                </div>
                                <p className="font-body text-sm text-navy">
                                    <strong>Anonymous Messages</strong> to your matches
                                </p>
                            </li>
                        </ul>
                    </div>

                    {/* Google Signup Button */}
                    <motion.button
                        onClick={handleGoogleSignup}
                        disabled={isLoading}
                        className="w-full bg-cardinal-red text-white px-8 py-5 border-4 border-navy font-pixel text-sm shadow-[8px_8px_0_0_#1E3A8A] hover:shadow-[4px_4px_0_0_#1E3A8A] hover:translate-x-1 hover:translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                        whileHover={{ scale: isLoading ? 1 : 1.02 }}
                        whileTap={{ scale: isLoading ? 1 : 0.98 }}
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center gap-3">
                                <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>CONJURING...</span>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center gap-3">
                                <svg className="w-6 h-6 bg-white rounded-full p-1" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                <span>SIGN UP WITH GOOGLE</span>
                            </div>
                        )}
                    </motion.button>

                    {/* Link to Login */}
                    <div className="mt-6 text-center">
                        <p className="font-body text-sm text-navy/70">
                            Already have an account?{' '}
                            <Link href="/auth/login" className="text-cardinal-red font-bold hover:underline font-pixel text-xs ml-1">
                                SIGN IN HERE <ArrowRight className="w-3 h-3 inline pb-0.5" />
                            </Link>
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
            </motion.div>
        </div>
    );
}

function LoadingFallback() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-retro-cream">
            <div className="w-16 h-16 border-4 border-navy border-t-transparent rounded-full animate-spin"></div>
        </div>
    );
}

export default function SignupPage() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <SignupContent />
        </Suspense>
    );
}
