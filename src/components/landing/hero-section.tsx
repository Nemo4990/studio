import Link from 'next/link';
import { Button } from '@/components/ui/button';
import AnimatedCoins from './animated-coins';

export default function HeroSection() {
  return (
    <section className="relative py-20 md:py-32">
      <AnimatedCoins />
      <div className="container relative z-10">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            Unlock Your Crypto Potential
          </div>
          <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Complete Tasks, Earn Crypto Rewards
          </h1>
          <p className="mt-6 text-lg leading-8 text-foreground/70">
            TaskVerse is your gateway to the digital economy. Join our
            community, complete engaging tasks, and watch your crypto wallet
            grow.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button size="lg" asChild>
              <Link href="/signup">Get Started Today</Link>
            </Button>
            <Button size="lg" variant="ghost" asChild>
              <Link href="/#features">Learn More &rarr;</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
