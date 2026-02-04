'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuthState } from '@/hooks/useAuthState';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import {
  Users,
  ClipboardCheck,
  Heart,
  Activity,
  TrendingUp,
  Settings,
  Shield,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { user, loading: authLoading } = useAuthState();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Admin email check - should match backend
  const ADMIN_EMAILS = ['kurtgavin.design@gmail.com', 'admin@wizardmatch.ai'];

  useEffect(() => {
    // Check if user is authenticated
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }

    // Check if user is admin
    if (user && !ADMIN_EMAILS.includes(user.email)) {
      setError('Access denied. Admin privileges required.');
      setLoading(false);
      return;
    }

    // Load stats if user is admin
    if (user && ADMIN_EMAILS.includes(user.email)) {
      loadStats();
    }
  }, [user, authLoading, router]);

  async function loadStats() {
    try {
      // Use local storage token which should be available
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStats(data.data);
        }
      } else if (response.status === 403 || response.status === 401) {
        setError('Access denied. Admin privileges required.');
      } else {
        setError('Failed to load admin dashboard. Please try again.');
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
      setError('Failed to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  }



  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col bg-retro-cream">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-navy border-t-cardinal-red rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  // Show error state if not admin or API failed
  if (error) {
    return (
      <div className="min-h-screen bg-retro-cream">
        <Header />
        <div className="flex items-center justify-center pt-32">
          <div className="bg-retro-pink border-8 border-navy p-12 shadow-[12px_12px_0_0_#1E3A8A] max-w-md text-center">
            <Shield className="w-16 h-16 text-navy mx-auto mb-6" />
            <h1 className="font-pixel text-2xl text-navy mb-4">ACCESS DENIED</h1>
            <p className="font-body text-navy mb-8">{error}</p>
            <Link href="/" className="inline-block bg-retro-yellow text-navy px-8 py-3 border-4 border-navy font-pixel text-sm shadow-[6px_6px_0_0_#1E3A8A] hover:shadow-[3px_3px_0_0_#1E3A8A] hover:translate-x-1 hover:translate-y-1 transition-all">
              GO HOME
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-retro-cream">
      <Header />
      <div className="container mx-auto px-4 max-w-7xl pt-32 pb-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 border-b-4 border-navy pb-8"
        >
          <div className="flex items-center gap-4 mb-2">
            <Shield className="w-10 h-10 text-cardinal-red" />
            <h1 className="font-display font-black text-4xl md:text-5xl text-navy">
              ADMIN CONSOLE
            </h1>
          </div>
          <p className="font-pixel text-sm text-navy/70">
            SYSTEM STATUS: ONLINE
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            {
              label: 'Total Users',
              value: stats?.totalUsers || 0,
              icon: Heart, // Replaced with heart as per theme
              color: 'bg-retro-pink',
            },
            {
              label: 'Completed Surveys',
              value: stats?.completedSurveys || 0,
              icon: ClipboardCheck,
              color: 'bg-retro-sky',
            },
            {
              label: 'Total Matches',
              value: stats?.totalMatches || 0,
              icon: Heart,
              color: 'bg-cardinal-red',
            },
            {
              label: 'Active Users',
              value: stats?.activeUsers || 0,
              icon: Activity,
              color: 'bg-retro-yellow',
            },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white border-4 border-navy p-6 shadow-[8px_8px_0_0_#1E3A8A]"
            >
              <div className={`${stat.color} w-14 h-14 border-2 border-navy flex items-center justify-center mb-4 shadow-[4px_4px_0_0_rgba(0,0,0,0.2)]`}>
                <stat.icon className="w-7 h-7 text-navy" />
              </div>
              <p className="font-display font-black text-4xl text-navy mb-2">
                {stat.value.toLocaleString()}
              </p>
              <p className="font-pixel text-xs text-navy/60 uppercase">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Completion Rate */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border-4 border-navy p-8 shadow-[8px_8px_0_0_#1E3A8A] mb-12"
          >
            <h2 className="font-display font-bold text-2xl text-navy mb-6 uppercase">
              Survey Completion Rate
            </h2>
            <div className="flex items-center gap-4">
              <div className="flex-1 h-8 bg-retro-gray border-2 border-navy relative">
                <div
                  className="h-full bg-retro-mint transition-all duration-500 border-r-2 border-navy"
                  style={{ width: `${stats.completionRate.toFixed(0)}%` }}
                />
                {/* Progress striping */}
                <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(45deg,rgba(0,0,0,0.05) 25%,transparent 25%,transparent 50%,rgba(0,0,0,0.05) 50%,rgba(0,0,0,0.05) 75%,transparent 75%,transparent)', backgroundSize: '20px 20px' }}></div>
              </div>
              <span className="font-pixel font-bold text-xl text-navy">
                {stats.completionRate.toFixed(1)}%
              </span>
            </div>
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid md:grid-cols-2 gap-8"
        >
          <Link href="/admin/matches" className="bg-white border-4 border-navy p-8 shadow-[8px_8px_0_0_#1E3A8A] hover:bg-retro-cream hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0_0_#1E3A8A] transition-all text-left group">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-cardinal-red border-2 border-navy flex items-center justify-center group-hover:animate-pulse">
                <Heart className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="font-pixel text-lg text-navy font-bold">
                  MATCHING CENTER
                </h3>
                <p className="font-body text-xs text-navy/60">
                  Auto & Manual Matching
                </p>
              </div>
            </div>
            <p className="font-body text-sm text-navy/80 border-t-2 border-navy/10 pt-4 mt-2">
              Access the matching dashboard to generate algorithmic matches or manually pair users.
            </p>
          </Link>

          <Link href="/admin/users" className="bg-white border-4 border-navy p-8 shadow-[8px_8px_0_0_#1E3A8A] hover:bg-retro-cream hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0_0_#1E3A8A] transition-all text-left group">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-retro-mint border-2 border-navy flex items-center justify-center">
                <Users className="w-7 h-7 text-navy" />
              </div>
              <div>
                <h3 className="font-pixel text-lg text-navy font-bold">
                  MANAGE USERS
                </h3>
                <p className="font-body text-xs text-navy/60">
                  View and match users
                </p>
              </div>
            </div>
            <p className="font-body text-sm text-navy/80 border-t-2 border-navy/10 pt-4 mt-2">
              View all users, see their profiles, and manually create matches between selected users.
            </p>
          </Link>

          <Link href="/statistics" className="bg-white border-4 border-navy p-8 shadow-[8px_8px_0_0_#1E3A8A] hover:bg-retro-cream hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0_0_#1E3A8A] transition-all text-left block">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-retro-yellow border-2 border-navy flex items-center justify-center">
                <TrendingUp className="w-7 h-7 text-navy" />
              </div>
              <div>
                <h3 className="font-pixel text-lg text-navy font-bold">
                  VIEW ANALYTICS
                </h3>
                <p className="font-body text-xs text-navy/60">
                  Detailed statistics
                </p>
              </div>
            </div>
            <p className="font-body text-sm text-navy/80 border-t-2 border-navy/10 pt-4 mt-2">
              See detailed analytics regarding user demographics, survey responses, and match distribution.
            </p>
          </Link>

          <Link href="/admin/testimonials" className="bg-white border-4 border-navy p-8 shadow-[8px_8px_0_0_#1E3A8A] hover:bg-retro-cream hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0_0_#1E3A8A] transition-all text-left block">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-retro-plum border-2 border-navy flex items-center justify-center">
                <Heart className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="font-pixel text-lg text-navy font-bold">
                  MANAGE STORIES
                </h3>
                <p className="font-body text-xs text-navy/60">
                  Review testimonials
                </p>
              </div>
            </div>
            <p className="font-body text-sm text-navy/80 border-t-2 border-navy/10 pt-4 mt-2">
              Review, approve, and publish user submitted success stories and testimonials.
            </p>
          </Link>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
