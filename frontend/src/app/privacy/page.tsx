'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Shield, Lock } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-retro-cream">
            <Header />

            <main className="pt-24 pb-16">
                <div className="container mx-auto px-4 max-w-4xl">
                    {/* Back button */}
                    <Link
                        href="/auth/login"
                        className="inline-flex items-center gap-2 text-navy hover:text-cardinal-red mb-8 font-body transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Login
                    </Link>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white border-8 border-navy shadow-[12px_12px_0_0_#1E3A8A] p-8 md:p-12"
                    >
                        {/* Header */}
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-16 h-16 bg-retro-pink border-4 border-navy flex items-center justify-center shadow-[4px_4px_0_0_#1E3A8A]">
                                <Lock className="w-8 h-8 text-navy" />
                            </div>
                            <div>
                                <h1 className="font-display font-bold text-3xl text-navy">Privacy Policy</h1>
                                <p className="font-body text-navy/60">Last updated: February 2026</p>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="prose prose-navy max-w-none">
                            <section className="mb-8">
                                <h2 className="font-display font-bold text-xl text-navy mb-4 flex items-center gap-2">
                                    <div className="w-6 h-6 bg-retro-pink border-2 border-navy"></div>
                                    1. Information We Collect
                                </h2>
                                <p className="font-body text-navy/80 mb-4">
                                    When you use Wizard Match, we collect:
                                </p>
                                <ul className="list-disc pl-6 space-y-2 font-body text-navy/80">
                                    <li><strong>Account Information:</strong> Your Google account email and name</li>
                                    <li><strong>Student Information:</strong> Your student ID, program, and year level</li>
                                    <li><strong>Survey Responses:</strong> Your answers to the compatibility survey</li>
                                    <li><strong>Crush List:</strong> The emails of people you're interested in (optional)</li>
                                    <li><strong>Profile Information:</strong> Bio, profile photo, and contact preferences you choose to share</li>
                                </ul>
                            </section>

                            <section className="mb-8">
                                <h2 className="font-display font-bold text-xl text-navy mb-4 flex items-center gap-2">
                                    <div className="w-6 h-6 bg-retro-mint border-2 border-navy"></div>
                                    2. How We Use Your Information
                                </h2>
                                <p className="font-body text-navy/80 mb-4">
                                    We use your information to:
                                </p>
                                <ul className="list-disc pl-6 space-y-2 font-body text-navy/80">
                                    <li>Calculate compatibility scores with other participants</li>
                                    <li>Identify mutual crushes (only when both parties have listed each other)</li>
                                    <li>Display your profile to your matches on Valentine's Day</li>
                                    <li>Enable messaging between matched users</li>
                                    <li>Improve the matching algorithm for future campaigns</li>
                                </ul>
                            </section>

                            <section className="mb-8">
                                <h2 className="font-display font-bold text-xl text-navy mb-4 flex items-center gap-2">
                                    <div className="w-6 h-6 bg-retro-lavender border-2 border-navy"></div>
                                    3. Information Sharing
                                </h2>
                                <p className="font-body text-navy/80 mb-4">
                                    <strong>We do NOT:</strong>
                                </p>
                                <ul className="list-disc pl-6 space-y-2 font-body text-navy/80 mb-4">
                                    <li>Sell your personal information to third parties</li>
                                    <li>Share your crush list with anyone (it's completely private)</li>
                                    <li>Reveal who added you to their crush list (unless it's mutual)</li>
                                </ul>
                                <p className="font-body text-navy/80 mb-4">
                                    <strong>We DO share:</strong>
                                </p>
                                <ul className="list-disc pl-6 space-y-2 font-body text-navy/80">
                                    <li>Your profile information with your matches (based on your visibility settings)</li>
                                    <li>Mutual crush notifications when both parties have listed each other</li>
                                </ul>
                            </section>

                            <section className="mb-8">
                                <h2 className="font-display font-bold text-xl text-navy mb-4 flex items-center gap-2">
                                    <div className="w-6 h-6 bg-retro-orange border-2 border-navy"></div>
                                    4. Data Security
                                </h2>
                                <p className="font-body text-navy/80 mb-4">
                                    We implement appropriate security measures to protect your personal information:
                                </p>
                                <ul className="list-disc pl-6 space-y-2 font-body text-navy/80">
                                    <li>All data is encrypted in transit using HTTPS</li>
                                    <li>Passwords and sensitive data are hashed and encrypted</li>
                                    <li>Access to user data is restricted to authorized team members only</li>
                                </ul>
                            </section>

                            <section className="mb-8">
                                <h2 className="font-display font-bold text-xl text-navy mb-4 flex items-center gap-2">
                                    <div className="w-6 h-6 bg-retro-sky border-2 border-navy"></div>
                                    5. Data Retention
                                </h2>
                                <p className="font-body text-navy/80 mb-4">
                                    Your data is retained for the duration of the Valentine's Day campaign (February 2026).
                                    After the campaign ends, personal data may be anonymized for statistical purposes or deleted upon request.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="font-display font-bold text-xl text-navy mb-4 flex items-center gap-2">
                                    <div className="w-6 h-6 bg-retro-yellow border-2 border-navy"></div>
                                    6. Your Rights
                                </h2>
                                <p className="font-body text-navy/80 mb-4">
                                    You have the right to:
                                </p>
                                <ul className="list-disc pl-6 space-y-2 font-body text-navy/80">
                                    <li>Access your personal data</li>
                                    <li>Correct inaccurate information</li>
                                    <li>Request deletion of your account and data</li>
                                    <li>Withdraw from the matching program at any time</li>
                                </ul>
                            </section>

                            <section className="mb-8">
                                <h2 className="font-display font-bold text-xl text-navy mb-4 flex items-center gap-2">
                                    <div className="w-6 h-6 bg-retro-plum border-2 border-navy"></div>
                                    7. Contact Us
                                </h2>
                                <p className="font-body text-navy/80">
                                    If you have any questions about this Privacy Policy, please contact the Wizard Match team.
                                </p>
                            </section>
                        </div>
                    </motion.div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
