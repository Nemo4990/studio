'use client';

import PageHeader from '@/components/dashboard/page-header';
import AnimatedCoins from '@/components/landing/animated-coins';
import SpeedmathGame from '@/components/dashboard/speedmath-game';

export default function SpeedmathChallengePage() {
  return (
    <div className="relative min-h-[calc(100vh-10rem)] overflow-hidden rounded-lg border bg-card p-4 md:p-8 flex flex-col">
      <AnimatedCoins />
      <div className="relative z-10 flex flex-col flex-grow">
          <PageHeader
            title="Speedmath Challenge"
            description="Answer as many questions as you can. Get over 80% to win the reward!"
            className="mb-4 text-white"
          />
          <div className="flex-grow flex items-center justify-center">
            <SpeedmathGame />
          </div>
      </div>
       <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 -z-10" />
    </div>
  );
}
