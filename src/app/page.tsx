import PublicHeader from '@/components/landing/public-header';
import HeroSection from '@/components/landing/hero-section';
import FeaturesSection from '@/components/landing/features-section';
import PublicFooter from '@/components/landing/public-footer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function CtaSection() {
  return (
    <section className="py-20 md:py-32">
      <div className="container text-center">
        <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          See where financial automation can <br /> take your business.
        </h2>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          The first financial tool for your business. And the last one you'll ever need.
        </p>
        <div className="mt-10">
          <Button size="lg" asChild>
            <Link href="/signup">Get Started</Link>
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
        <CtaSection />
      </main>
      <PublicFooter />
    </div>
  );
}
