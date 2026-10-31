import React, { useState, useEffect } from 'react';
import { Flame, Clock } from 'lucide-react';

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
      <div className="inline-flex items-center gap-1.5 text-xs font-mono text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-2.5 py-1 rounded-lg border border-red-200/60 dark:border-red-900/40">
        <span>Deadline Reached</span>
      </div>
    );
  }

  const isCrunchMode = timeLeft.total <= 6 * 60 * 60 * 1000;

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono border transition-colors ${
      isCrunchMode 
        ? 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/40'
        : 'text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-900 border-zinc-200/80 dark:border-zinc-800/80'
    }`}>
      {isCrunchMode ? (
        <Flame className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
      ) : (
        <Clock className="w-3.5 h-3.5 text-zinc-400" />
      )}
      <span className="font-sans font-medium text-[11px] text-zinc-500">
        {isCrunchMode ? 'Crunch:' : 'Remaining:'}
      </span>
      <span className="tabular-nums font-semibold">
        {String(timeLeft.hours).padStart(2, '0')}:
        {String(timeLeft.minutes).padStart(2, '0')}:
        {String(timeLeft.seconds).padStart(2, '0')}
      </span>
    </div>
  );
}
