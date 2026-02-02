'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';

interface CountdownTimerProps {
  targetDate: Date;
  label?: string;
  onComplete?: () => void;
  className?: string;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function CountdownTimer({
  targetDate,
  label,
  onComplete,
  className = '',
}: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const difference = target - now;

      if (difference <= 0) {
        setIsComplete(true);
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        onComplete?.();
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeRemaining({ days, hours, minutes, seconds });
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [targetDate, onComplete]);

  if (isComplete) {
    return (
      <Card className={`bg-gradient-to-r from-pink-500 to-red-500 text-white ${className}`}>
        <div className="p-6 text-center">
          <p className="text-lg font-semibold">🎉 The moment has arrived!</p>
        </div>
      </Card>
    );
  }

  const TimeBlock = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 min-w-[70px]">
        <span className="text-3xl font-bold">{value.toString().padStart(2, '0')}</span>
      </div>
      <span className="text-xs mt-2 opacity-90">{label}</span>
    </div>
  );

  return (
    <Card className={`bg-gradient-to-r from-pink-500 to-red-500 text-white ${className}`}>
      <div className="p-6">
        {label && <p className="text-center text-lg font-semibold mb-4">{label}</p>}
        <div className="flex justify-center items-center gap-3 md:gap-6">
          <TimeBlock value={timeRemaining.days} label="Days" />
          <span className="text-2xl">:</span>
          <TimeBlock value={timeRemaining.hours} label="Hours" />
          <span className="text-2xl">:</span>
          <TimeBlock value={timeRemaining.minutes} label="Minutes" />
          <span className="text-2xl">:</span>
          <TimeBlock value={timeRemaining.seconds} label="Seconds" />
        </div>
      </div>
    </Card>
  );
}
