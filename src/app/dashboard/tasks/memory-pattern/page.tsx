'use client';

import PageHeader from '@/components/dashboard/page-header';
import AnimatedCoins from '@/components/landing/animated-coins';
import MemoryPatternGame from '@/components/dashboard/memory-pattern-game';

export default function MemoryPatternChallengePage() {
  return (
    <div className="relative min-h-[calc(100vh-10rem)] overflow-hidden rounded-lg border bg-card p-4 md:p-8 flex flex-col">
      <AnimatedCoins />
      <div className="relative z-10 flex flex-col flex-grow">
          <PageHeader
            title="Memory Pattern Recall"
            description="Memorize and replicate the sequence of patterns. Reach Level 4 to win!"
            className="mb-4 text-white"
          />
          <div className="flex-grow flex items-center justify-center">
            <MemoryPatternGame />
          </div>
      </div>
       <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 -z-10" />
    </div>
  );
}
