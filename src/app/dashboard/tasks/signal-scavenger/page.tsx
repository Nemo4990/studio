'use client';

import PageHeader from '@/components/dashboard/page-header';
import AnimatedCoins from '@/components/landing/animated-coins';
import SignalScavengerGame from '@/components/dashboard/signal-scavenger-game';

export default function SignalScavengerPage() {
  return (
    <div className="relative min-h-[calc(100vh-10rem)] overflow-hidden rounded-lg border bg-card p-4 md:p-8 flex flex-col">
      <AnimatedCoins />
      <div className="relative z-10 flex flex-col flex-grow">
          <PageHeader
            title="Signal Scavenger"
            description="Visit our partners to find the signal. Click all 12 tiles to claim your reward."
            className="mb-4 text-white"
          />
          <div className="flex-grow flex items-center justify-center">
            <SignalScavengerGame />
          </div>
      </div>
       <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/20 to-background -z-10" />
    </div>
  );
}
