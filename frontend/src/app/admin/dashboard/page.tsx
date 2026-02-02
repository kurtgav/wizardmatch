'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthState } from '@/hooks/useAuthState';
import { api } from '@/lib/api';
import {
  Users,
  ClipboardCheck,
  Heart,
  Activity,
  TrendingUp,
  Settings,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { user, loading: authLoading } = useAuthState();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }

    // Check if user is admin
    if (user && !user.email.includes('@mcl.edu.ph')) {
      router.push('/');
      return;
    }

    loadStats();
  }, [user, authLoading, router]);

  async function loadStats() {
    try {
      const response = await fetch('/api/admin/stats', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateMatches() {
    if (!confirm('Are you sure you want to regenerate all matches? This will delete existing matches.')) {
      return;
    }

    try {
      const response = await fetch('/api/admin/generate-matches', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        alert(data.message);
        loadStats();
      }
    } catch (error) {
      console.error('Failed to generate matches:', error);
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pink-light">
        <div className="w-16 h-16 border-4 border-cardinal-red border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-light to-cream py-24">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="font-display font-black text-4xl md:text-5xl text-cardinal-red mb-2">
            Admin Dashboard
          </h1>
          <p className="font-body text-lg text-navy">
            Manage Perfect Match platform
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            {
              label: 'Total Users',
              value: stats?.totalUsers || 0,
              icon: Users,
              color: 'bg-cardinal-red',
            },
            {
              label: 'Completed Surveys',
              value: stats?.completedSurveys || 0,
              icon: ClipboardCheck,
              color: 'bg-royal-blue',
            },
            {
              label: 'Total Matches',
              value: stats?.totalMatches || 0,
              icon: Heart,
              color: 'bg-pink-dark',
            },
            {
              label: 'Active Users',
              value: stats?.activeUsers || 0,
              icon: Activity,
              color: 'bg-gold',
            },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white border-4 border-royal-blue rounded-3xl p-6 shadow-card"
            >
              <div className={`${stat.color} w-14 h-14 rounded-full flex items-center justify-center mb-4`}>
                <stat.icon className="w-7 h-7 text-white" />
              </div>
              <p className="font-display font-black text-4xl text-navy mb-2">
                {stat.value.toLocaleString()}
              </p>
              <p className="font-body text-sm text-navy/80">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Completion Rate */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border-4 border-royal-blue rounded-3xl p-8 shadow-card mb-12"
          >
            <h2 className="font-display font-bold text-2xl text-navy mb-4">
              Completion Rate
            </h2>
            <div className="flex items-center gap-4">
              <div className="flex-1 h-6 bg-slate-100 rounded-full overflow-hidden border-2 border-navy/20">
                <div
                  className="h-full bg-gradient-to-r from-cardinal-red to-pink-dark transition-all duration-500"
                  style={{ width: `${stats.completionRate.toFixed(0)}%` }}
                />
              </div>
              <span className="font-display font-black text-3xl text-cardinal-red">
                {stats.completionRate.toFixed(1)}%
              </span>
            </div>
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid md:grid-cols-2 gap-6"
        >
          <button
            onClick={handleGenerateMatches}
            className="bg-white border-4 border-cardinal-red rounded-3xl p-8 shadow-card hover:shadow-card-hover hover:-translate-y-2 transition-all duration-300 text-left"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-cardinal-red rounded-full flex items-center justify-center">
                <Heart className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="font-display font-bold text-xl text-navy">
                  Generate Matches
                </h3>
                <p className="font-body text-sm text-navy/60">
                  Run the matching algorithm
                </p>
              </div>
            </div>
            <p className="font-body text-navy/80">
              Calculate and generate matches for all users who have completed the
              survey. This will replace existing matches.
            </p>
          </button>

          <button className="bg-white border-4 border-royal-blue rounded-3xl p-8 shadow-card hover:shadow-card-hover hover:-translate-y-2 transition-all duration-300 text-left">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-royal-blue rounded-full flex items-center justify-center">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="font-display font-bold text-xl text-navy">
                  View Analytics
                </h3>
                <p className="font-body text-sm text-navy/60">
                  Detailed statistics
                </p>
              </div>
            </div>
            <p className="font-body text-navy/80">
              See detailed analytics about participation, matches, and success rates.
            </p>
          </button>
        </motion.div>
      </div>
    </div>
  );
}
