'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthState } from '@/hooks/useAuthState';
import { api } from '@/lib/api';
import MatchCard from '@/components/matches/MatchCard';
import Header from '@/components/layout/Header';
import { Heart, Lock, Flower2 } from 'lucide-react';
import useSWR from 'swr';
import { toast } from 'sonner';

interface PotentialMatch {
  id: string;
  firstName: string;
  lastName: string;
  program: string;
  yearLevel: number;
  profilePhotoUrl: string | null;
  bio: string | null;
  gender: string;
}

export default function MatchesPage() {
  const { user, loading: authLoading } = useAuthState();
  const router = useRouter();

  const fetcher = async () => {
    const response = await api.getPotentialMatches();
    return response.data || [];
  };

  // Fetch potential matches (Tinder-style)
  const { data: potentialMatches = [], isLoading: matchesLoading, mutate: mutateMatches } = useSWR(
    '/api/matches/potential',
    fetcher
  );

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }

    if (user && !user.surveyCompleted) {
      router.push('/survey');
      return;
    }
  }, [user, authLoading, router]);

  async function handlePass(userId: string) {
    try {
      await api.passUser(userId);
      toast.success('Pass recorded');
      mutateMatches();
    } catch (error: any) {
      toast.error(error.message || 'Failed to record pass');
    }
  }

  async function handleInterest(userId: string) {
    try {
      const result = await api.interestUser(userId);
      if (result.matched) {
        toast.success('🎉 It\'s a match! You both like each other!', {
          duration: 5000,
          action: {
            label: 'View Matches',
            onClick: () => mutateMatches(),
          },
        });
      } else {
        toast.success('Interest recorded! Waiting for them to respond.');
      }
      mutateMatches();
    } catch (error: any) {
      toast.error(error.message || 'Failed to record interest');
    }
  }

  const loading = authLoading || matchesLoading;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-retro-cream">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-navy border-t-cardinal-red rounded-full animate-spin"></div>
            <p className="font-pixel text-navy animate-pulse">Loading Wizards...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-retro-cream">
      <Header />

      <main className="container mx-auto px-4 max-w-7xl pt-32 pb-12 relative">
        {/* Background Decorations */}
        <div className="absolute top-20 left-10 opacity-10 pointer-events-none">
          <Flower2 className="w-24 h-24 text-navy" />
        </div>
        <div className="absolute top-40 right-10 opacity-10 pointer-events-none">
          <Heart className="w-16 h-16 text-cardinal-red animate-pulse" />
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16 relative z-10"
        >
          <div className="inline-block mb-4 relative">
            <h1 className="font-display font-black text-5xl md:text-6xl text-navy relative z-10">
              DISCOVER WIZARDS
            </h1>
            <div className="absolute -bottom-2 -right-2 w-full h-full bg-retro-yellow -z-0"></div>
          </div>

          <p className="font-body text-xl text-navy/80 max-w-2xl mx-auto mt-4">
            Browse through {potentialMatches.length} potential matches. Click ✔ if interested, X to pass.
          </p>
        </motion.div>

        {potentialMatches.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto"
          >
            <div className="bg-white border-4 border-navy shadow-[8px_8px_0_0_#1E3A8A] p-12 text-center">
              <div className="w-24 h-24 bg-retro-gray border-4 border-navy rounded-full mx-auto mb-6 flex items-center justify-center">
                <Lock className="w-10 h-10 text-navy" />
              </div>
              <h2 className="font-pixel text-2xl text-navy mb-4">
                NO MORE WIZARDS
              </h2>
              <div className="bg-retro-sky/10 border-2 border-retro-sky p-4 mb-6 rounded">
                <p className="font-body text-lg text-navy">
                  You've seen all available Wizards for now!
                  <br />
                  <strong>Check back soon for new magic!</strong>
                </p>
              </div>
              <div className="inline-flex items-center gap-2 text-sm text-navy/60 font-pixel">
                <Flower2 className="w-4 h-4" />
                MORE COMING SOON
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
            {potentialMatches.map((potentialMatch, index) => {
              // Convert potential match to match format
              const match = {
                id: potentialMatch.id,
                matchedUser: potentialMatch,
                compatibilityScore: 0,
                matchTier: 'pending',
                isRevealed: false,
                isMutualInterest: false,
              };

              return (
                <motion.div
                  key={potentialMatch.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.05,
                    ease: "easeOut"
                  }}
                >
                  <MatchCard
                    match={match}
                    onReveal={() => {}}
                    onClick={() => {}}
                    onPass={() => handlePass(potentialMatch.id)}
                    onInterest={() => handleInterest(potentialMatch.id)}
                    showActions={true}
                  />
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Motivational Message */}
        {potentialMatches.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-8 pb-12"
          >
            <div className="inline-flex items-center gap-3 bg-white border-3 border-navy rounded-full px-8 py-3 shadow-[4px_4px_0_0_#1E3A8A] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-default">
              <Heart className="w-5 h-5 text-cardinal-red fill-current animate-pulse" />
              <span className="font-pixel text-lg text-navy">
                FIND YOUR MAGIC
              </span>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
