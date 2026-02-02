'use client';

import { motion } from 'framer-motion';
import { Heart, Eye, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MatchCardProps {
  match: {
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
    isRevealed: boolean;
    isMutualInterest: boolean;
  };
  onReveal: () => void;
  onClick: () => void;
}

export default function MatchCard({ match, onReveal, onClick }: MatchCardProps) {
  const tierColors = {
    perfect: 'from-cardinal-red to-pink-dark',
    excellent: 'from-royal-blue to-cardinal-red',
    great: 'from-royal-blue to-pink-dark',
    good: 'from-navy to-royal-blue',
    fair: 'from-slate-600 to-navy',
  };

  return (
    <motion.div
      whileHover={{ y: -8 }}
      className={cn(
        'relative bg-white border-4 border-royal-blue rounded-3xl p-8 shadow-card transition-all duration-300 cursor-pointer',
        !match.isRevealed && 'overflow-hidden'
      )}
      onClick={onClick}
    >
      {/* Compatibility Badge */}
      <div className="absolute -top-4 -right-4">
        <div className="relative">
          <div className={cn(
            'w-24 h-24 rounded-full border-4 border-white flex flex-col items-center justify-center shadow-lg',
            `bg-gradient-to-br ${tierColors[match.matchTier as keyof typeof tierColors] || tierColors.good}`
          )}>
            <span className="font-display font-black text-2xl text-white">
              {Math.round(match.compatibilityScore)}
            </span>
            <span className="font-body text-xs text-white">%</span>
          </div>
          {match.isMutualInterest && (
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gold rounded-full flex items-center justify-center border-2 border-white">
              <Heart className="w-4 h-4 text-white fill-current" />
            </div>
          )}
        </div>
      </div>

      {/* Profile Photo or Placeholder */}
      <div className="mb-6">
        {match.isRevealed && match.matchedUser.profilePhotoUrl ? (
          <img
            src={match.matchedUser.profilePhotoUrl}
            alt={match.matchedUser.firstName}
            className="w-24 h-24 rounded-full border-4 border-navy mx-auto object-cover"
          />
        ) : (
          <div className={cn(
            'w-24 h-24 rounded-full border-4 border-navy mx-auto flex items-center justify-center',
            match.isRevealed ? 'bg-pink' : 'bg-slate-200'
          )}>
            {match.isRevealed ? (
              <span className="font-display font-bold text-3xl text-cardinal-red">
                {match.matchedUser.firstName[0]}
                {match.matchedUser.lastName[0]}
              </span>
            ) : (
              <Lock className="w-10 h-10 text-navy/40" />
            )}
          </div>
        )}
      </div>

      {/* Name */}
      <h3 className="font-display font-bold text-2xl text-navy text-center mb-2">
        {match.isRevealed ? (
          `${match.matchedUser.firstName} ${match.matchedUser.lastName}`
        ) : (
          '???'
        )}
      </h3>

      {/* Program & Year */}
      <div className="text-center mb-4">
        <p className="font-body text-sm text-navy/80">
          {match.matchedUser.program} • Year {match.matchedUser.yearLevel}
        </p>
      </div>

      {/* Bio or Lock Message */}
      {match.isRevealed ? (
        match.matchedUser.bio && (
          <p className="font-body text-sm text-navy/80 text-center line-clamp-3">
            {match.matchedUser.bio}
          </p>
        )
      ) : (
        <div className="text-center mb-4">
          <p className="font-body text-sm text-navy/60 mb-4">
            Complete the survey to reveal your match!
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              onReveal();
            }}
            className="btn-primary text-sm"
          >
            <Eye className="w-4 h-4" />
            Reveal Match
          </motion.button>
        </div>
      )}

      {/* Match Tier Badge */}
      {match.isRevealed && (
        <div className="mt-4 text-center">
          <span className={cn(
            'inline-block px-3 py-1 rounded-full text-xs font-bold uppercase',
            match.matchTier === 'perfect' && 'bg-cardinal-red text-white',
            match.matchTier === 'excellent' && 'bg-royal-blue text-white',
            match.matchTier === 'great' && 'bg-pink-dark text-white',
            match.matchTier === 'good' && 'bg-navy text-white',
          )}>
            {match.matchTier} Match
          </span>
        </div>
      )}

      {/* Heart Watermark */}
      <div className="absolute bottom-4 right-4 opacity-10">
        <Heart className="w-32 h-32 text-cardinal-red fill-current" />
      </div>
    </motion.div>
  );
}
