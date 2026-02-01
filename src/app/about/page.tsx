import PublicFooter from '@/components/landing/public-footer';
import PublicHeader from '@/components/landing/public-header';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';

const aboutHeroImage = PlaceHolderImages.find(img => img.id === 'about_hero');

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicHeader />
      <main className="flex-1">
        <section className="relative flex items-center justify-center py-20 text-center text-white md:py-32 overflow-hidden">
          {aboutHeroImage && (
            <Image
              src={aboutHeroImage.imageUrl}
              alt="About TaskVerse"
              fill
              className="object-cover"
              data-ai-hint={aboutHeroImage.imageHint}
              priority
            />
          )}
          <div className="absolute inset-0 bg-black/60" />
          <div className="container relative z-10">
            <div className="mx-auto max-w-3xl">
              <h1
                className="font-headline text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl opacity-0 animate-fade-in-up"
                style={{ animationDelay: '0.2s' }}
              >
                About TaskVerse
              </h1>
              <p
                className="mt-6 text-lg leading-8 text-white/80 opacity-0 animate-fade-in-up"
                style={{ animationDelay: '0.4s' }}
              >
                We are on a mission to democratize access to the crypto economy for everyone, everywhere.
              </p>
            </div>
          </div>
        </section>

        <section className="py-20 md:py-32 overflow-hidden">
          <div className="container">
            <div className="mx-auto max-w-3xl space-y-8 text-lg text-foreground/80">
              <h2
                className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl opacity-0 animate-fade-in-up"
                style={{ animationDelay: '0.6s' }}
              >
                Our Story
              </h2>
              <p
                className="opacity-0 animate-fade-in-up"
                style={{ animationDelay: '0.8s' }}
              >
                Founded in 2023, TaskVerse was born from a simple yet powerful idea: to create a platform where anyone can earn cryptocurrency by completing simple, meaningful tasks. We saw a gap in the market for a user-friendly gateway into the world of digital assets, one that didn't require deep technical knowledge or significant financial investment.
              </p>
              <p
                className="opacity-0 animate-fade-in-up"
                style={{ animationDelay: '1.0s' }}
              >
                Our team, a diverse group of blockchain enthusiasts, developers, and designers, came together to build a secure, transparent, and rewarding ecosystem. We believe in the power of decentralization and aim to empower individuals globally by providing them with opportunities to participate in the digital economy.
              </p>
              <h2
                className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl opacity-0 animate-fade-in-up"
                style={{ animationDelay: '1.2s' }}
              >
                Our Vision
              </h2>
              <p
                className="opacity-0 animate-fade-in-up"
                style={{ animationDelay: '1.4s' }}
              >
                We envision a world where earning and using cryptocurrency is as common as using the internet. TaskVerse is our first step towards that future. We are committed to continuous innovation, building new features, and forging strong partnerships to provide our users with the best possible experience and the most rewarding opportunities.
              </p>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
