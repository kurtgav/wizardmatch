'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthState } from '@/hooks/useAuthState';
import { api } from '@/lib/api';
import MatchCard from '@/components/matches/MatchCard';
import { Heart, Lock } from 'lucide-react';

interface Match {
  id: string;
  matchedUser: {
    id: string;
    firstName: string;
    lastName: string;
    program: string;
    yearLevel: number;
    profilePhotoUrl: string | null;
    bio: string | null;
  };
  compatibilityScore: number;
  matchTier: string;
  sharedInterests: any;
  isRevealed: boolean;
  isMutualInterest: boolean;
}

export default function MatchesPage() {
  const { user, loading: authLoading } = useAuthState();
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }

    if (user && !user.surveyCompleted) {
      router.push('/survey');
      return;
    }

    loadMatches();
  }, [user, authLoading, router]);

  async function loadMatches() {
    try {
      const response = await api.getMatches();
      if (response.success) {
        setMatches(response.data);
      }
    } catch (error) {
      console.error('Failed to load matches:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleReveal(matchId: string) {
    try {
      await api.revealMatch(matchId);
      // Reload matches
      await loadMatches();
    } catch (error) {
      console.error('Failed to reveal match:', error);
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
          className="text-center mb-12"
        >
          <h1 className="font-display font-black text-4xl md:text-5xl text-cardinal-red mb-2">
            Your Matches
          </h1>
          <p className="font-body text-lg text-navy">
            Here are your top {matches.length} compatible Wizards
          </p>
        </motion.div>

        {matches.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <Lock className="w-20 h-20 text-navy/40 mx-auto mb-4" />
            <h2 className="font-display font-bold text-3xl text-navy mb-4">
              Matches Not Yet Available
            </h2>
            <p className="font-body text-lg text-navy/80 max-w-md mx-auto">
              Your matches are being calculated! Check back after the match release
              date.
            </p>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((match, index) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <MatchCard
                  match={match}
                  onReveal={() => handleReveal(match.id)}
                  onClick={() => setSelectedMatch(match)}
                />
              </motion.div>
            ))}
          </div>
        )}

        {/* Motivational Message */}
        {matches.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-12"
          >
            <div className="inline-flex items-center gap-2 bg-white border-3 border-cardinal-red rounded-full px-6 py-3">
              <Heart className="w-5 h-5 text-cardinal-red fill-current" />
              <span className="font-body font-bold text-navy">
                Good luck with your matches!
              </span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
