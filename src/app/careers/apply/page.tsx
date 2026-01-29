import PublicFooter from '@/components/landing/public-footer';
import PublicHeader from '@/components/landing/public-header';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ApplyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicHeader />
      <main className="flex-1">
        <section className="bg-secondary py-20 text-center md:py-32">
          <div className="container">
            <div className="mx-auto max-w-3xl">
              <h1 className="font-headline text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                Thank You for Your Interest
              </h1>
              <p className="mt-6 text-lg leading-8 text-foreground/70">
                We are not currently accepting new applications.
              </p>
            </div>
          </div>
        </section>

        <section className="py-20 md:py-32">
          <div className="container text-center">
            <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Our Hiring is Paused
            </h2>
            <p className="mt-6 mx-auto max-w-2xl text-lg leading-8 text-muted-foreground">
              While we are not actively hiring for new roles at this moment, we are always on the lookout for exceptional talent. We encourage you to check back on our careers page for future openings. Thank you for considering a career at TaskVerse.
            </p>
            <div className="mt-10">
              <Button asChild>
                <Link href="/careers">Back to Careers</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
