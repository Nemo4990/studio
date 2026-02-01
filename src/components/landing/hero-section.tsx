import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const heroDashboardImage = PlaceHolderImages.find(img => img.id === 'hero_dashboard');

export default function HeroSection() {
  return (
    <section className="relative py-20 text-center md:py-32">
      <div className="container relative z-10">
        <div className="mx-auto max-w-4xl">
          <h1 className="font-headline text-5xl font-bold tracking-tight text-foreground sm:text-6xl md:text-7xl">
            Unleash the power of <span className="text-glow">intuitive earning</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground md:text-xl">
            Say goodbye to complex crypto platforms. Complete simple tasks, manage your earnings like a pro. Simple, intuitive, and rewarding.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-4">
            <Button size="lg" asChild>
              <Link href="/signup">Get Started Today</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#features">Learn More &rarr;</Link>
            </Button>
          </div>
        </div>

        {heroDashboardImage && (
            <div className="mt-20">
                <Image
                    src={heroDashboardImage.imageUrl}
                    alt={heroDashboardImage.description}
                    width={1200}
                    height={700}
                    className="mx-auto rounded-xl border border-white/10 shadow-2xl shadow-primary/10"
                    data-ai-hint={heroDashboardImage.imageHint}
                    priority
                />
            </div>
        )}

      </div>
    </section>
  );
}
