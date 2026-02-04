'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthState } from '@/hooks/useAuthState';
import { api } from '@/lib/api';
import MatchCard from '@/components/matches/MatchCard';
import Header from '@/components/layout/Header';
import { Heart, Lock, Flower2, X, MessageCircle, User, GraduationCap, FileText } from 'lucide-react';
import useSWR from 'swr';

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
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  const fetcher = async () => {
    const response = await api.getMatches();
    return response.data || [];
  };

  // Always fetch matches - no authentication required
  const { data: matches = [], isLoading: matchesLoading, mutate: mutateMatches } = useSWR(
    '/api/matches',
    fetcher
  );

  // Removed authentication restrictions - matches page is now accessible to all
  // useEffect(() => {
  //   if (!authLoading && !user) {
  //     router.push('/auth/login');
  //     return;
  //   }

  //   if (user && !user.surveyCompleted) {
  //     router.push('/survey');
  //     return;
  //   }
  // }, [user, authLoading, router]);

  async function handleReveal(matchId: string) {
    // Optimistic update
    const updatedMatches = matches.map(m =>
      m.id === matchId ? { ...m, isRevealed: true } : m
    );

    // Mutate and disable revalidation initially
    mutateMatches(updatedMatches, false);

    try {
      await api.revealMatch(matchId);
      // Trigger full revalidation from server to be safe
      mutateMatches();
    } catch (error) {
      console.error('Failed to reveal match:', error);
      // Rollback on error
      mutateMatches();
    }
  }

  const loading = authLoading || matchesLoading;

  if (authLoading || matchesLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-retro-cream">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-navy border-t-cardinal-red rounded-full animate-spin"></div>
            <p className="font-pixel text-navy animate-pulse">Consulting the Crystal Ball...</p>
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
              YOUR MATCHES
            </h1>
            <div className="absolute -bottom-2 -right-2 w-full h-full bg-retro-yellow -z-0"></div>
          </div>

          <p className="font-body text-xl text-navy/80 max-w-2xl mx-auto mt-4">
            The stars have aligned! Here are the {matches.length} Wizards most compatible with your magical aura.
          </p>
        </motion.div>

        {matches.length === 0 ? (
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
                MATCHES LOCKED
              </h2>
              <div className="bg-retro-sky/10 border-2 border-retro-sky p-4 mb-6 rounded">
                <p className="font-body text-lg text-navy">
                  Our matchmakers are still brewing the potions.
                  <br />
                  <strong>Check back on Valentine's Day!</strong>
                </p>
              </div>
              <div className="inline-flex items-center gap-2 text-sm text-navy/60 font-pixel">
                <Flower2 className="w-4 h-4" />
                BLOOMING IN PROGRESS
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
            {matches.map((match, index) => (
              <motion.div
                key={match.id}
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
            className="text-center mt-8 pb-12"
          >
            <div className="inline-flex items-center gap-3 bg-white border-3 border-navy rounded-full px-8 py-3 shadow-[4px_4px_0_0_#1E3A8A] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-default">
              <Heart className="w-5 h-5 text-cardinal-red fill-current animate-pulse" />
              <span className="font-pixel text-lg text-navy">
                TRUST THE MAGIC
              </span>
            </div>
          </motion.div>
        )}
      </main>

      {/* Match Detail Modal */}
      <AnimatePresence>
        {selectedMatch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedMatch(null)}
            className="fixed inset-0 bg-navy/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white border-8 border-navy shadow-[16px_16px_0_0_#1E3A8A] max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedMatch(null)}
                className="absolute top-4 right-4 bg-retro-pink border-2 border-navy p-2 hover:bg-cardinal-red transition-colors z-10"
              >
                <X className="w-5 h-5 text-white" />
              </button>

              {/* Header with compatibility score */}
              <div className="bg-retro-cream border-b-8 border-navy p-8 text-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute inset-0" style={{
                    backgroundImage: `
                      linear-gradient(to right, #1E3A8A 2px, transparent 2px),
                      linear-gradient(to bottom, #1E3A8A 2px, transparent 2px)
                    `,
                    backgroundSize: '16px 16px',
                  }} />
                </div>

                <div className="relative z-10">
                  {/* Compatibility Badge */}
                  <div className="inline-block mb-6">
                    <div className="bg-retro-yellow border-4 border-navy px-8 py-4 shadow-[6px_6px_0_0_#1E3A8A]">
                      <p className="font-pixel text-4xl text-navy font-bold">
                        {Math.round(selectedMatch.compatibilityScore)}%
                      </p>
                      <p className="font-pixel text-xs text-navy/70 uppercase tracking-widest mt-1">
                        Compatibility
                      </p>
                    </div>
                  </div>

                  <h2 className="font-display font-black text-3xl md:text-4xl text-navy mb-2">
                    {selectedMatch.isRevealed
                      ? `${selectedMatch.matchedUser.firstName} ${selectedMatch.matchedUser.lastName}`
                      : 'MYSTERY WIZARD'}
                  </h2>

                  {selectedMatch.isMutualInterest && (
                    <div className="flex items-center justify-center gap-2 mt-4">
                      <Heart className="w-5 h-5 text-cardinal-red fill-current animate-pulse" />
                      <span className="font-pixel text-sm text-cardinal-red font-bold">MUTUAL INTEREST</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-8">
                {selectedMatch.isRevealed ? (
                  <div className="space-y-6">
                    {/* Profile Photo */}
                    <div className="flex justify-center">
                      <div className="w-32 h-32 relative">
                        {selectedMatch.matchedUser.profilePhotoUrl ? (
                          <img
                            src={selectedMatch.matchedUser.profilePhotoUrl}
                            alt={selectedMatch.matchedUser.firstName}
                            className="w-full h-full object-cover border-4 border-navy"
                          />
                        ) : (
                          <div className="w-full h-full bg-retro-mint border-4 border-navy flex items-center justify-center">
                            <span className="font-display font-black text-5xl text-navy">
                              {selectedMatch.matchedUser.firstName[0]}
                            </span>
                          </div>
                        )}
                        <div className="absolute -bottom-2 -right-2 w-full h-full border-4 border-navy -z-10 bg-retro-lavender"></div>
                      </div>
                    </div>

                    {/* Program Info */}
                    <div className="flex items-center justify-center gap-2">
                      <GraduationCap className="w-5 h-5 text-navy" />
                      <p className="font-pixel text-sm text-navy">
                        {selectedMatch.matchedUser.program} • Year {selectedMatch.matchedUser.yearLevel}
                      </p>
                    </div>

                    {/* Bio */}
                    {selectedMatch.matchedUser.bio ? (
                      <div className="bg-retro-cream border-4 border-navy p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <FileText className="w-5 h-5 text-navy" />
                          <h3 className="font-pixel text-sm text-navy font-bold uppercase">About</h3>
                        </div>
                        <p className="font-body text-navy italic text-center">
                          "{selectedMatch.matchedUser.bio}"
                        </p>
                      </div>
                    ) : (
                      <div className="bg-retro-cream border-4 border-navy p-6 text-center">
                        <p className="font-pixel text-xs text-navy/50">NO BIO PROVIDED</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-4">
                      <a
                        href={`/messages?matchId=${selectedMatch.id}`}
                        className="flex-1 bg-retro-pink text-navy py-3 border-4 border-navy font-pixel text-sm shadow-[6px_6px_0_0_#1E3A8A] hover:shadow-[3px_3px_0_0_#1E3A8A] hover:translate-x-1 hover:translate-y-1 transition-all flex items-center justify-center gap-2"
                      >
                        <MessageCircle className="w-5 h-5" />
                        MESSAGE
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Lock className="w-16 h-16 text-navy/40 mx-auto mb-6" />
                    <h3 className="font-pixel text-xl text-navy mb-4">PROFILE LOCKED</h3>
                    <p className="font-body text-navy/70 mb-8">
                      Reveal this match to see their full profile and send messages!
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        handleReveal(selectedMatch.id);
                        setSelectedMatch(null);
                      }}
                      className="bg-cardinal-red text-white py-3 px-8 border-4 border-navy font-pixel text-sm shadow-[6px_6px_0_0_#1E3A8A] hover:translate-x-1 hover:translate-y-1 hover:shadow-[3px_3px_0_0_#1E3A8A] transition-all flex items-center justify-center gap-2"
                    >
                      <User className="w-5 h-5" />
                      REVEAL MATCH
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
