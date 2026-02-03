'use client';

import PageHeader from '@/components/dashboard/page-header';
import AnimatedCoins from '@/components/landing/animated-coins';
import LogicPuzzleGame from '@/components/dashboard/logic-puzzle-game';

export default function LogicPuzzleChallengePage() {
  return (
    <div className="relative min-h-[calc(100vh-10rem)] overflow-hidden rounded-lg border bg-card p-4 md:p-8 flex flex-col">
      <AnimatedCoins />
      <div className="relative z-10 flex flex-col flex-grow">
          <PageHeader
            title="Logic Puzzle Challenge"
            description="Solve the riddle to prove your wits and earn the reward!"
            className="mb-4 text-white"
          />
          <div className="flex-grow flex items-center justify-center">
            <LogicPuzzleGame />
          </div>
      </div>
       <div className="absolute inset-0 bg-gradient-to-br from-background via-secondary to-background -z-10" />
    </div>
  );
}
