import PublicHeader from '@/components/landing/public-header';
import HeroSection from '@/components/landing/hero-section';
import FeaturesSection from '@/components/landing/features-section';
import PublicFooter from '@/components/landing/public-footer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import TestimonialsSection from '@/components/landing/testimonials-section';

function CtaSection() {
  return (
    <section className="py-20 md:py-32">
      <div className="container text-center">
        <h2
          className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl opacity-0 animate-fade-in-up"
          style={{ animationDelay: '0.2s' }}
        >
          Ready to start your earning journey?
        </h2>
        <p
          className="mt-6 text-lg leading-8 text-muted-foreground opacity-0 animate-fade-in-up"
          style={{ animationDelay: '0.4s' }}
        >
          Join thousands of users who are turning their free time into crypto rewards.
        </p>
        <div
          className="mt-10 opacity-0 animate-fade-in-up"
          style={{ animationDelay: '0.6s' }}
        >
          <Button size="lg" asChild>
            <Link href="/signup">Get Started for Free</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicHeader />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <TestimonialsSection />
        <CtaSection />
      </main>
      <PublicFooter />
    </div>
  );
}
