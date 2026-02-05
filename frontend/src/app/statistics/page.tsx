'use client';

import { motion } from 'framer-motion';
import useSWR from 'swr';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { api } from '@/lib/api';
import { StatCardSkeleton } from '@/components/ui/Skeleton';
import {
  Users,
  Heart,
  TrendingUp,
  Award,
  Building2,
  GraduationCap,
  Ghost,
  Gamepad2,
  RefreshCw,
} from 'lucide-react';

// Fetcher functions for SWR
const overviewFetcher = async () => {
  const res = await api.getOverview();
  return res.success ? res.data : null;
};

const programFetcher = async () => {
  const res = await api.getByProgram();
  return res.success ? res.data : [];
};

const yearFetcher = async () => {
  const res = await api.getByYearLevel();
  return res.success ? res.data : [];
};

export default function StatisticsPage() {
  // SWR with 10-second revalidation for real-time updates
  const { data: stats, isValidating: statsLoading, mutate: mutateStats } = useSWR(
    '/api/analytics/overview',
    overviewFetcher,
    {
      refreshInterval: 10000, // Refresh every 10 seconds
      revalidateOnFocus: true,
      dedupingInterval: 5000,
    }
  );

  const { data: programStats = [], isValidating: programLoading } = useSWR(
    '/api/analytics/programs',
    programFetcher,
    {
      refreshInterval: 10000,
      revalidateOnFocus: true,
      dedupingInterval: 5000,
    }
  );

  const { data: yearStats = [], isValidating: yearLoading } = useSWR(
    '/api/analytics/year-levels',
    yearFetcher,
    {
      refreshInterval: 10000,
      revalidateOnFocus: true,
      dedupingInterval: 5000,
    }
  );

  const isLoading = !stats && statsLoading;
  const isRefreshing = statsLoading || programLoading || yearLoading;

  // Show skeleton while loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-retro-cream">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="text-center mb-16">
              <div className="inline-block bg-retro-yellow/50 border-4 border-navy/30 px-8 py-3 shadow-[6px_6px_0_0_rgba(30,58,138,0.3)] mb-8 animate-pulse">
                <div className="h-5 w-24 bg-navy/20 rounded"></div>
              </div>
              <div className="h-12 bg-navy/10 mx-auto w-80 mb-4 animate-pulse rounded"></div>
              <div className="h-6 bg-navy/5 mx-auto w-48 animate-pulse rounded"></div>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {[1, 2, 3, 4].map((i) => (
                <StatCardSkeleton key={i} />
              ))}
            </div>
            <div className="bg-white/50 border-4 border-navy/30 h-48 animate-pulse rounded mb-12"></div>
            <div className="bg-white/50 border-4 border-navy/30 h-64 animate-pulse rounded"></div>
          </div>
        </main>
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
            {/* Pixel Badge with Live Indicator */}
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
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${isRefreshing ? 'bg-retro-orange animate-pulse' : 'bg-green-500'}`}></span>
                  <span className="font-pixel text-[10px] text-navy/60">LIVE</span>
                </div>
                <Heart className="w-5 h-5 text-cardinal-red" />
              </div>
            </motion.div>

            <h1 className="font-display font-black text-4xl md:text-5xl lg:text-6xl text-navy mb-4">
              Wizard Match{' '}
              <span className="text-cardinal-red bg-retro-pink px-3">Statistics</span>
            </h1>
            <p className="font-body text-xl text-navy/80 mb-4">
              See how Wizards are finding love
            </p>

            {/* Refresh Button */}
            <button
              onClick={() => mutateStats()}
              disabled={isRefreshing}
              className={`inline-flex items-center gap-2 font-pixel text-xs px-4 py-2 border-2 border-navy bg-white hover:bg-retro-gray/20 transition-colors ${isRefreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'UPDATING...' : 'REFRESH NOW'}
            </button>
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
