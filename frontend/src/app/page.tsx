'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, Sparkles, Wand2, ArrowRight } from 'lucide-react';
import Header from '@/components/layout/Header';
import Hero from '@/components/landing/Hero';
import Features from '@/components/landing/Features';
import Testimonials from '@/components/landing/Testimonials';
import Footer from '@/components/layout/Footer';
import { CampaignBanner } from '@/components/campaign/CampaignBanner';
import { CountdownTimer } from '@/components/campaign/CountdownTimer';

interface PublicStats {
  totalUsers: number;
  completedSurveys: number;
  totalMatches: number;
  matchReleaseDate: string;
}

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState<PublicStats | null>(null);
  const [campaign, setCampaign] = useState<any>(null);

  useEffect(() => {
    setMounted(true);

    // Load public stats and campaign info
    async function loadData() {
      try {
        const [statsResponse, campaignResponse] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/public/stats`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/campaigns/active`),
        ]);

        const statsData = await statsResponse.json();
        if (statsData.success) {
          setStats(statsData.data);
        }

        const campaignData = await campaignResponse.json();
        if (campaignData.success && campaignData.data) {
          setCampaign(campaignData.data);
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    }

    loadData();
  }, []);

  // Get target date for countdown based on campaign phase
  const getCountdownTarget = () => {
    if (!campaign) return null;

    const phase = campaign.phase;
    switch (phase) {
      case 'pre_launch':
        return campaign.surveyOpenDate;
      case 'survey_open':
        return campaign.surveyCloseDate;
      case 'survey_closed':
        return campaign.profileUpdateStartDate;
      case 'profile_update':
        return campaign.resultsReleaseDate;
      case 'results_released':
        return campaign.resultsReleaseDate;
      default:
        return campaign.surveyCloseDate;
    }
  };

  const countdownTarget = getCountdownTarget();

  return (
    <div className="min-h-screen">
      <Header />

      {/* Campaign Banner */}
      {campaign && (
        <div className="container mx-auto px-4 py-4">
          <CampaignBanner
            phase={campaign.phase}
            nextPhaseLabel={campaign.nextPhaseLabel}
          />
        </div>
      )}

      {/* Countdown Timer */}
      {countdownTarget && campaign?.phase !== 'results_released' && (
        <div className="container mx-auto px-4 pb-4">
          <CountdownTimer
            targetDate={new Date(countdownTarget)}
            label={campaign.nextPhaseLabel}
          />
        </div>
      )}

      <main>
        {/* Hero Section */}
        <Hero />

        {/* Features Section */}
        <Features />

        {/* Testimonials Section */}
        <Testimonials />

        {/* CTA Section - Retro Pixel-Art Style */}
        <section className="relative bg-retro-cream py-24 overflow-hidden">
          {/* Pixel Grid Background */}
          <div className="absolute inset-0 opacity-10">
            <div className="w-full h-full" style={{
              backgroundImage: `
                linear-gradient(#1E3A8A 1px, transparent 1px),
                linear-gradient(90deg, #1E3A8A 1px, transparent 1px)
              `,
              backgroundSize: '8px 8px'
            }}></div>
          </div>

          {/* Floating Pixel Hearts */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={`cta-heart-${i}`}
                className="absolute"
                style={{
                  left: `${10 + i * 12}%`,
                  top: `${20 + (i % 3) * 20}%`,
                }}
                animate={{
                  y: [0, -30, 0],
                  opacity: [0.3, 0.7, 0.3],
                }}
                transition={{
                  duration: 3 + i * 0.5,
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
              >
                <Heart className="w-8 h-8 text-retro-pink fill-current" />
              </motion.div>
            ))}
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              {/* Retro Badge */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="inline-block mb-8"
              >
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-retro-pink transform translate-x-2 translate-y-2"></div>
                  <div className="relative bg-retro-yellow border-4 border-navy px-6 py-2 transform -translate-x-1 -translate-y-1">
                    <span className="font-pixel text-xs text-navy flex items-center gap-2">
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Wand2 className="w-4 h-4 text-navy" />
                      </motion.div>
                      The Magic Awaits
                      <motion.div
                        animate={{ rotate: [0, -10, 10, 0] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                      >
                        <Sparkles className="w-4 h-4 text-navy" />
                      </motion.div>
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Main Headline */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="font-pixel text-2xl md:text-3xl lg:text-4xl text-navy mb-6 leading-relaxed"
              >
                READY TO FIND YOUR
                <br />
                <motion.span
                  className="text-cardinal-red inline-block"
                  animate={{
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                >
                  PERFECT MATCH?
                </motion.span>
              </motion.h2>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="font-body text-lg md:text-xl text-navy/80 mb-6 max-w-3xl mx-auto"
              >
                Captivating hearts since 2024
              </motion.p>

              {/* Student Count Display */}
              {stats && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 }}
                  className="mb-8"
                >
                  <div className="inline-block bg-retro-yellow border-4 border-navy px-8 py-4 shadow-[6px_6px_0_0_#1E3A8A]">
                    <p className="font-pixel text-xl md:text-2xl text-navy text-center">
                      {stats.totalUsers} {stats.totalUsers === 1 ? 'Wizard' : 'Wizards'} Ready to Find Love!
                    </p>
                  </div>
                </motion.div>
              )}

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
                className="font-body text-lg md:text-xl text-navy/80 mb-10 max-w-3xl mx-auto"
              >
                Join Mapúa MCL Wizards in the ultimate Valentine
                matchmaking experience. Let our Love Witch work her magic on your destiny!
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.7 }}
                className="flex flex-col items-center gap-6"
              >
                <Link
                  href="/auth/login"
                  className="group relative btn-retro text-base md:text-lg"
                >
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="mr-2"
                  >
                    ✨
                  </motion.span>
                  START YOUR MAGICAL JOURNEY
                  <ArrowRight className="w-5 h-5 ml-2 inline-block group-hover:translate-x-1 transition-transform" />
                </Link>

                {/* Small Note */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.8 }}
                  className="bg-white border-3 border-retro-sky px-4 py-2 shadow-[4px_4px_0_0_#1E3A8A]"
                >
                  <p className="font-body text-sm text-navy/70 flex items-center gap-2">
                    <motion.span
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      💖
                    </motion.span>
                    Sign in with Google Account + Student ID required
                    <motion.span
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 0.75 }}
                    >
                      💖
                    </motion.span>
                  </p>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
