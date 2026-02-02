'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { api } from '@/lib/api';
import {
  Users,
  Heart,
  TrendingUp,
  Award,
  Building2,
  GraduationCap,
  Ghost,
  Gamepad2,
} from 'lucide-react';

export default function StatisticsPage() {
  const [stats, setStats] = useState<any>(null);
  const [programStats, setProgramStats] = useState<any[]>([]);
  const [yearStats, setYearStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const [overviewRes, programRes, yearRes] = await Promise.all([
        api.getOverview(),
        api.getByProgram(),
        api.getByYearLevel(),
      ]);

      if (overviewRes.success) setStats(overviewRes.data);
      if (programRes.success) setProgramStats(programRes.data);
      if (yearRes.success) setYearStats(yearRes.data);
    } catch (error) {
      console.error('Failed to load statistics:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-retro-cream">
        <div className="w-16 h-16 border-4 border-navy border-t-retro-pink rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-retro-cream">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Retro Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            {/* Pixel Badge */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-block bg-retro-yellow border-4 border-navy px-8 py-3 shadow-[6px_6px_0_0_#1E3A8A] mb-8"
            >
              <div className="flex items-center gap-3">
                <Gamepad2 className="w-5 h-5 text-navy" />
                <p className="font-pixel text-xs text-navy">
                  HIGH SCORES
                </p>
                <Heart className="w-5 h-5 text-cardinal-red" />
              </div>
            </motion.div>

            <h1 className="font-display font-black text-4xl md:text-5xl lg:text-6xl text-navy mb-4">
              Perfect Match{' '}
              <span className="text-cardinal-red bg-retro-pink px-3">Statistics</span>
            </h1>
            <p className="font-body text-xl text-navy/80">
              See how Mapúa MCL Wizards are finding love
            </p>
          </motion.div>

          {/* Overview Stats - Retro Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              {
                label: 'Total Participants',
                value: stats?.totalParticipants || 0,
                icon: Users,
                color: 'bg-retro-pink',
              },
              {
                label: 'Completed Surveys',
                value: stats?.completedSurveys || 0,
                icon: Heart,
                color: 'bg-retro-sky',
              },
              {
                label: 'Matches Made',
                value: stats?.totalMatches || 0,
                icon: TrendingUp,
                color: 'bg-retro-lavender',
              },
              {
                label: 'Mutual Matches',
                value: stats?.mutualMatches || 0,
                icon: Award,
                color: 'bg-retro-yellow',
              },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4, x: -2 }}
                className={`${stat.color} border-4 border-navy p-6 shadow-[8px_8px_0_0_#1E3A8A] hover:shadow-[10px_10px_0_0_#1E3A8A] transition-all relative`}
              >
                {/* Corner decoration */}
                <div className="absolute top-2 right-2">
                  <div className="w-3 h-3 bg-white border-2 border-navy" />
                </div>

                <div className="w-14 h-14 bg-white border-4 border-navy flex items-center justify-center mb-4 shadow-[4px_4px_0_0_#1E3A8A]">
                  <stat.icon className="w-7 h-7 text-navy" />
                </div>
                <p className="font-pixel text-4xl text-navy mb-2">
                  {stat.value.toLocaleString()}
                </p>
                <p className="font-body text-sm text-navy font-semibold">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Average Compatibility - Retro Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-retro-plum border-8 border-navy p-8 shadow-[12px_12px_0_0_#1E3A8A] mb-12 relative overflow-hidden"
          >
            {/* Background pixel pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute inset-0" style={{
                backgroundImage: `
                  linear-gradient(to right, #1E3A8A 2px, transparent 2px),
                  linear-gradient(to bottom, #1E3A8A 2px, transparent 2px)
                `,
                backgroundSize: '16px 16px',
              }} />
            </div>

            {/* Corner decorations */}
            <motion.div
              className="absolute top-0 left-0 w-8 h-8 bg-retro-orange border-4 border-r-0 border-b-0 border-navy"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.div
              className="absolute bottom-0 right-0 w-8 h-8 bg-retro-mint border-4 border-l-0 border-t-0 border-navy"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
            />

            <div className="relative z-10 text-center">
              <h2 className="font-pixel text-xl text-navy mb-4">
                {'►'} AVERAGE COMPATIBILITY SCORE {'◄'}
              </h2>
              <div className="bg-white border-4 border-navy p-8 shadow-[4px_4px_0_0_#1E3A8A]">
                <p className="font-pixel text-6xl md:text-7xl text-cardinal-red mb-2">
                  {stats?.averageCompatibilityScore?.toFixed(1) || '0.0'}%
                </p>
                <p className="font-body text-sm text-navy">Love Success Rate</p>
              </div>
            </div>
          </motion.div>

          {/* By Program - Retro Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border-8 border-navy p-8 shadow-[12px_12px_0_0_#1E3A8A] mb-12 relative overflow-hidden"
          >
            {/* Floating decorative elements */}
            <motion.div
              className="absolute top-4 right-4"
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Ghost className="w-8 h-8 text-retro-plum" />
            </motion.div>

            <h2 className="font-pixel text-xl text-navy mb-6 flex items-center gap-3">
              <Building2 className="w-7 h-7 text-cardinal-red" />
              PARTICIPATION BY PROGRAM
            </h2>

            <div className="space-y-4">
              {programStats.map((program, index) => (
                <motion.div
                  key={program.program}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-retro-lavender border-4 border-navy p-4 shadow-[4px_4px_0_0_#1E3A8A]"
                >
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-pixel text-xs text-navy">
                      {program.program.toUpperCase()}
                    </span>
                    <span className="font-body text-sm text-navy/80 font-semibold">
                      {program.total} Wizards ({program.completionRate.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="h-6 bg-navy border-2 border-navy/30 overflow-hidden relative">
                    <motion.div
                      className="h-full bg-gradient-to-r from-retro-pink to-retro-sky"
                      initial={{ width: 0 }}
                      animate={{ width: `${program.completionRate}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* By Year Level - Retro Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-retro-yellow border-8 border-navy p-8 shadow-[12px_12px_0_0_#1E3A8A] relative overflow-hidden"
          >
            {/* Background pixel pattern */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
              <div className="absolute inset-0" style={{
                backgroundImage: `
                  linear-gradient(to right, #1E3A8A 2px, transparent 2px),
                  linear-gradient(to bottom, #1E3A8A 2px, transparent 2px)
                `,
                backgroundSize: '20px 20px',
              }} />
            </div>

            <div className="relative z-10">
              <h2 className="font-pixel text-xl text-navy mb-6 flex items-center gap-3">
                <GraduationCap className="w-7 h-7 text-cardinal-red" />
                PARTICIPATION BY YEAR LEVEL
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {yearStats.map((year, index) => (
                  <motion.div
                    key={year.yearLevel}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -4 }}
                    className="bg-white border-4 border-navy p-6 text-center shadow-[6px_6px_0_0_#1E3A8A]"
                  >
                    <p className="font-pixel text-4xl text-retro-pink mb-2">
                      {year.yearLevel}
                    </p>
                    <p className="font-body text-xs text-navy mb-2">YEAR {year.yearLevel}</p>
                    <p className="font-pixel text-sm text-navy font-bold">
                      {year.total}
                    </p>
                    <p className="font-body text-xs text-navy/60">Wizards</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
