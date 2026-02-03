import Link from 'next/link';
import { Button } from '@/components/ui/button';
import AnimatedCoins from './animated-coins';

export default function HeroSection() {
  return (
    <section className="relative py-20 text-center md:py-32 overflow-hidden">
      <AnimatedCoins />
      <div className="container relative z-10">
        <div className="mx-auto max-w-4xl">
          <h1
            className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-6xl md:text-7xl opacity-0 animate-fade-in-up"
            style={{ animationDelay: '0.2s' }}
          >
            Enter the NovaChain. Earn the <span className="text-glow">Future</span>.
          </h1>
          <p
            className="mt-6 text-lg leading-8 text-muted-foreground md:text-xl opacity-0 animate-fade-in-up"
            style={{ animationDelay: '0.4s' }}
          >
            Say goodbye to complex crypto platforms. Complete simple tasks, manage your earnings like a pro. Simple, intuitive, and rewarding.
          </p>
          <div
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 opacity-0 animate-fade-in-up"
            style={{ animationDelay: '0.6s' }}
          >
            <Button size="lg" asChild className="w-full sm:w-auto">
              <Link href="/signup">Get Started Today</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="w-full sm:w-auto">
              <Link href="#features">Learn More &rarr;</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
