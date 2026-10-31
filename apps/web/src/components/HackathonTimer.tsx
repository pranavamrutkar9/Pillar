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
      <div className="inline-flex items-center gap-1.5 text-xs font-mono font-black text-black bg-[#FF6B6B] px-3 py-1 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_#000]">
        <span>DEADLINE REACHED</span>
      </div>
    );
  }

  const isCrunchMode = timeLeft.total <= 6 * 60 * 60 * 1000;

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-mono font-bold border-2 transition-all shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] ${
      isCrunchMode 
        ? 'text-black bg-[#FF6B6B] border-black animate-pulse'
        : 'text-black dark:text-white bg-[#FFE600] border-black dark:border-white'
    }`}>
      {isCrunchMode ? (
        <Flame className="w-4 h-4 text-black stroke-[2.5]" />
      ) : (
        <Clock className="w-4 h-4 text-black dark:text-white stroke-[2.5]" />
      )}
      <span className="font-mono font-black text-[11px] uppercase">
        {isCrunchMode ? 'CRUNCH:' : 'COUNTDOWN:'}
      </span>
      <span className="tabular-nums font-black text-sm">
        {String(timeLeft.hours).padStart(2, '0')}:
        {String(timeLeft.minutes).padStart(2, '0')}:
        {String(timeLeft.seconds).padStart(2, '0')}
      </span>
    </div>
  );
}
