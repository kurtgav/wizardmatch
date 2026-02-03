'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface CampaignBannerProps {
  phase: string;
  timeRemaining?: number;
  nextPhaseLabel?: string;
  className?: string;
}

const phaseConfig: Record<string, { title: string; description: string; emoji: string; action?: { text: string; href: string } }> = {
  pre_launch: {
    title: 'Get Ready for Wizard Match! 🪄',
    description: 'The magic begins soon. Sign up and find your destiny!',
    emoji: '✨',
  },
  survey_open: {
    title: 'Survey is Open! 📝',
    description: 'Complete your survey to find your perfect matches immediately!',
    emoji: '💕',
    action: { text: 'Take Survey', href: '/survey' },
  },
  survey_closed: {
    title: 'Matching in Progress 🔮',
    description: 'We are finding your perfect matches. Magic is happening!',
    emoji: '⚡',
  },
  profile_update: {
    title: 'Start Chatting! ✨',
    description: 'Your matches are ready! Polish your profile and start chatting!',
    emoji: '💬',
    action: { text: 'View Matches', href: '/matches' },
  },
  results_released: {
    title: 'Your Matches Are Here! 💕',
    description: 'Valentine\'s is in the air! Check out your compatible matches!',
    emoji: '🎉',
    action: { text: 'View Matches', href: '/matches' },
  },
};

export function CampaignBanner({ phase, nextPhaseLabel, className = '' }: CampaignBannerProps) {
  const config = phaseConfig[phase] || phaseConfig.pre_launch;

  return (
    <Card className={`bg-gradient-to-r from-cardinal-red to-mapua-pink text-white border-0 ${className}`}>
      <div className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="text-4xl">{config.emoji}</span>
            <div>
              <h2 className="text-xl md:text-2xl font-bold">{config.title}</h2>
              <p className="text-sm md:text-base opacity-90 mt-1">{config.description}</p>
              {nextPhaseLabel && (
                <p className="text-xs mt-2 opacity-75">{nextPhaseLabel}</p>
              )}
            </div>
          </div>

          {config.action && (
            <Link href={config.action.href}>
              <Button
                size="lg"
                className="bg-white text-cardinal-red hover:bg-gray-100 font-semibold px-8"
              >
                {config.action.text}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </Card>
  );
}

// Colors for Tailwind - add to tailwind.config.ts:
// cardinal-red: '#E52037'
// mapua-pink: '#FFB3C1'
