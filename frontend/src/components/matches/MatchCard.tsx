import Image from 'next/image';
import { motion } from 'framer-motion';
import { Heart, Eye, Lock, Flower, X, Check } from 'lucide-react';
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
  onPass?: () => void;
  onInterest?: () => void;
  showActions?: boolean;
}

export default function MatchCard({ match, onReveal, onClick, onPass, onInterest, showActions = false }: MatchCardProps) {
  const tierColors = {
    perfect: 'bg-cardinal-red',
    excellent: 'bg-retro-pink',
    great: 'bg-retro-orange',
    good: 'bg-retro-yellow',
    fair: 'bg-retro-mint',
  };

  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98, transition: { duration: 0.1 } }}
      className={cn(
        'relative bg-white border-4 border-navy p-6 shadow-[8px_8px_0_0_#1E3A8A] transition-shadow duration-200',
        !match.isRevealed && 'overflow-hidden'
      )}
    >
      {/* Compatibility Badge */}
      <div className="absolute -top-6 -right-6 z-10 transform rotate-12">
        <div className="relative">
          <div className={cn(
            'w-20 h-20 border-4 border-navy flex flex-col items-center justify-center shadow-[4px_4px_0_0_rgba(0,0,0,0.2)]',
            tierColors[match.matchTier as keyof typeof tierColors] || tierColors.good
          )}>
            <span className="font-pixel font-bold text-2xl text-navy">
              {Math.round(match.compatibilityScore)}%
            </span>
          </div>
          {match.isMutualInterest && (
            <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-cardinal-red border-2 border-navy flex items-center justify-center animate-bounce">
              <Heart className="w-5 h-5 text-white fill-current" />
            </div>
          )}
        </div>
      </div>

      {/* Decorative Corner */}
      <div className="absolute -top-1 -left-1 w-4 h-4 bg-navy" />
      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-navy" />

      {/* Profile Photo or Placeholder */}
      <div className="mb-6 mt-2 relative">
        <div className="w-28 h-28 mx-auto relative">
          {match.isRevealed && match.matchedUser.profilePhotoUrl ? (
            <div className="relative w-full h-full overflow-hidden border-4 border-navy">
              <Image
                src={match.matchedUser.profilePhotoUrl}
                alt={match.matchedUser.firstName}
                fill
                className="object-cover bg-slate-200"
                sizes="(max-width: 768px) 112px, 112px"
              />
            </div>
          ) : (
            <div className={cn(
              'w-full h-full border-4 border-navy flex items-center justify-center',
              match.isRevealed ? 'bg-retro-mint' : 'bg-slate-200'
            )}>
              {match.isRevealed ? (
                <span className="font-display font-black text-4xl text-navy">
                  {match.matchedUser.firstName[0]}
                </span>
              ) : (
                <Lock className="w-10 h-10 text-navy/40" />
              )}
            </div>
          )}

          {/* Photo Decoration */}
          <div className="absolute -bottom-2 -right-2 w-full h-full border-4 border-navy -z-10 bg-retro-lavender"></div>
        </div>
      </div>

      {/* Name */}
      <h3 className="font-display font-black text-2xl text-navy text-center mb-1 uppercase tracking-tight">
        {match.isRevealed ? (
          `${match.matchedUser.firstName} ${match.matchedUser.lastName}`
        ) : (
          'MYSTERY WIZARD'
        )}
      </h3>

      {/* Program & Year */}
      <div className="text-center mb-6">
        <div className="inline-block bg-navy px-2 py-1 transform -rotate-2">
          <p className="font-pixel text-xs text-retro-yellow tracking-widest uppercase">
            {match.matchedUser.program || 'UNKNOWN'} • Y{match.matchedUser.yearLevel}
          </p>
        </div>
      </div>

      {/* Bio or Lock Message or Actions */}
      <div className="min-h-[80px] flex items-center justify-center">
        {showActions && onPass && onInterest ? (
          // Show X/✔ buttons for matching
          <div className="flex gap-3 w-full">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                onPass();
              }}
              className="flex-1 bg-red-500 text-white py-3 px-4 border-2 border-navy font-bold font-pixel shadow-[4px_4px_0_0_#1E3A8A] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#1E3A8A] transition-all flex items-center justify-center gap-2"
            >
              <X className="w-5 h-5" />
              PASS
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                onInterest();
              }}
              className="flex-1 bg-green-500 text-white py-3 px-4 border-2 border-navy font-bold font-pixel shadow-[4px_4px_0_0_#1E3A8A] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#1E3A8A] transition-all flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5" />
              INTERESTED
            </motion.button>
          </div>
        ) : match.isRevealed ? (
          match.matchedUser.bio ? (
            <p className="font-body text-sm text-center text-navy line-clamp-3 bg-retro-cream p-3 border-2 border-navy/10 italic">
              "{match.matchedUser.bio}"
            </p>
          ) : (
            <p className="font-pixel text-xs text-center text-navy/50">NO BIO AVAILABLE</p>
          )
        ) : (
          <div className="text-center w-full">
            <p className="font-pixel text-xs text-navy/60 mb-3 uppercase">
              Reveal to see profile
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                onReveal();
              }}
              className="w-full bg-cardinal-red text-white py-2 px-4 border-2 border-navy font-bold font-pixel shadow-[4px_4px_0_0_#1E3A8A] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#1E3A8A] transition-all flex items-center justify-center gap-2"
            >
              <Eye className="w-4 h-4" />
              UNLOCK
            </motion.button>
          </div>
        )}
      </div>

      {/* Match Tier Badge */}
      <div className="mt-6 pt-4 border-t-4 border-navy/10 text-center">
        <div className="flex items-center justify-center gap-2">
          <Flower className="w-4 h-4 text-navy" />
          <span className="font-pixel text-sm text-navy font-bold uppercase tracking-widest">
            {match.matchTier} Compatibility
          </span>
        </div>
      </div>
    </motion.div>
  );
}

