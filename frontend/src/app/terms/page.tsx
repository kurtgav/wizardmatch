'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Shield, FileText } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function TermsPage() {
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
                            <div className="w-16 h-16 bg-retro-yellow border-4 border-navy flex items-center justify-center shadow-[4px_4px_0_0_#1E3A8A]">
                                <FileText className="w-8 h-8 text-navy" />
                            </div>
                            <div>
                                <h1 className="font-display font-bold text-3xl text-navy">Terms of Service</h1>
                                <p className="font-body text-navy/60">Last updated: February 2026</p>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="prose prose-navy max-w-none">
                            <section className="mb-8">
                                <h2 className="font-display font-bold text-xl text-navy mb-4 flex items-center gap-2">
                                    <div className="w-6 h-6 bg-retro-pink border-2 border-navy"></div>
                                    1. Acceptance of Terms
                                </h2>
                                <p className="font-body text-navy/80 mb-4">
                                    By accessing and using Wizard Match ("the Service"), you agree to be bound by these Terms of Service.
                                    If you do not agree to these terms, please do not use the Service.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="font-display font-bold text-xl text-navy mb-4 flex items-center gap-2">
                                    <div className="w-6 h-6 bg-retro-mint border-2 border-navy"></div>
                                    2. Eligibility
                                </h2>
                                <p className="font-body text-navy/80 mb-4">
                                    The Service is exclusively for students and faculty of the university.
                                    You must have a valid university email address or student ID to participate in the matching program.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="font-display font-bold text-xl text-navy mb-4 flex items-center gap-2">
                                    <div className="w-6 h-6 bg-retro-lavender border-2 border-navy"></div>
                                    3. User Conduct
                                </h2>
                                <p className="font-body text-navy/80 mb-4">You agree to:</p>
                                <ul className="list-disc pl-6 space-y-2 font-body text-navy/80">
                                    <li>Provide accurate information in your survey responses</li>
                                    <li>Respect other users and their privacy</li>
                                    <li>Not use the Service for any unlawful purposes</li>
                                    <li>Not harass, stalk, or intimidate other users</li>
                                    <li>Not create multiple accounts</li>
                                </ul>
                            </section>

                            <section className="mb-8">
                                <h2 className="font-display font-bold text-xl text-navy mb-4 flex items-center gap-2">
                                    <div className="w-6 h-6 bg-retro-orange border-2 border-navy"></div>
                                    4. Privacy and Data
                                </h2>
                                <p className="font-body text-navy/80 mb-4">
                                    Your privacy is important to us. Please review our <Link href="/privacy" className="text-cardinal-red hover:underline">Privacy Policy</Link> to
                                    understand how we collect, use, and protect your information.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="font-display font-bold text-xl text-navy mb-4 flex items-center gap-2">
                                    <div className="w-6 h-6 bg-retro-sky border-2 border-navy"></div>
                                    5. Disclaimer
                                </h2>
                                <p className="font-body text-navy/80 mb-4">
                                    The Service is provided "as is" without warranties of any kind. We do not guarantee that you will find a match
                                    or that matches will be compatible. The matching algorithm is for entertainment purposes within the Valentine's Day campaign.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="font-display font-bold text-xl text-navy mb-4 flex items-center gap-2">
                                    <div className="w-6 h-6 bg-retro-yellow border-2 border-navy"></div>
                                    6. Contact
                                </h2>
                                <p className="font-body text-navy/80">
                                    For questions about these Terms, please contact the Wizard Match team.
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
