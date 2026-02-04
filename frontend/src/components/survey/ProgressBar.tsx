'use client';

import { motion } from 'framer-motion';

interface ProgressBarProps {
  progress: number;
}

export default function ProgressBar({ progress }: ProgressBarProps) {
  // Ensure progress is a valid number between 0 and 100
  const safeProgress = isNaN(progress) ? 0 : Math.max(0, Math.min(100, progress));

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-3">
        <span className="font-pixel text-xs text-navy">PROGRESS</span>
        <span className="font-pixel text-xs text-cardinal-red">
          {safeProgress}%
        </span>
      </div>
      <div className="h-6 bg-white border-4 border-navy overflow-hidden relative shadow-[4px_4px_0_0_#1E3A8A]">
        {/* Pixel grid background */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `
            linear-gradient(#1E3A8A 1px, transparent 1px),
            linear-gradient(90deg, #1E3A8A 1px, transparent 1px)
          `,
          backgroundSize: '4px 4px'
        }}></div>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${safeProgress}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-retro-pink via-cardinal-red to-retro-rose relative"
          style={{
            borderRight: '4px solid #1E3A8A'
          }}
        />
      </div>
    </div>
  );
}
