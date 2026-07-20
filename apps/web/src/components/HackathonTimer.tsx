import React, { useState, useEffect } from 'react';

export default function HackathonTimer({ deadline }: { deadline: string }) {
  const [timeLeft, setTimeLeft] = useState<{ hours: number, minutes: number, seconds: number, total: number }>({ hours: 0, minutes: 0, seconds: 0, total: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(deadline).getTime() - new Date().getTime();
      if (difference > 0) {
        setTimeLeft({
          total: difference,
          hours: Math.floor((difference / (1000 * 60 * 60))),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      } else {
        setTimeLeft({ total: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [deadline]);

  if (timeLeft.total <= 0) {
    return (
      <div className="flex items-center space-x-2 text-red-600 bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-md text-sm font-semibold border border-red-200 dark:border-red-900/50">
        <span>⏰ Time's up!</span>
      </div>
    );
  }

  const isCrunchMode = timeLeft.total <= 6 * 60 * 60 * 1000;

  return (
    <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-bold border transition-colors ${
      isCrunchMode 
        ? 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-900/50'
        : 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-900/50'
    }`}>
      <span className={isCrunchMode ? 'animate-pulse' : ''}>
        {isCrunchMode ? '⚡ CRUNCH MODE:' : '⏱ HACKATHON:'}
      </span>
      <span className="tabular-nums">
        {String(timeLeft.hours).padStart(2, '0')}:
        {String(timeLeft.minutes).padStart(2, '0')}:
        {String(timeLeft.seconds).padStart(2, '0')}
      </span>
    </div>
  );
}
