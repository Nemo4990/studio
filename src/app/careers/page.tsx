import PublicFooter from '@/components/landing/public-footer';
import PublicHeader from '@/components/landing/public-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

const openPositions = [
    {
        title: 'Senior Blockchain Developer',
        location: 'Remote',
        department: 'Engineering',
    },
    {
        title: 'Frontend Engineer (React/Next.js)',
        location: 'Remote',
        department: 'Engineering',
    },
    {
        title: 'Product Marketing Manager',
        location: 'New York, NY',
        department: 'Marketing',
    },
    {
        title: 'Community Manager',
        location: 'Remote',
        department: 'Community',
    },
];

export default function CareersPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicHeader />
      <main className="flex-1">
        <section className="bg-secondary py-20 text-center md:py-32">
          <div className="container">
            <div className="mx-auto max-w-3xl">
              <h1 className="font-headline text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                Join Our Team
              </h1>
              <p className="mt-6 text-lg leading-8 text-foreground/70">
                Help us build the future of the decentralized economy. We&apos;re looking for passionate, talented individuals to join our mission.
              </p>
            </div>
          </div>
        </section>

        <section className="py-20 md:py-32">
          <div className="container">
            <h2 className="mb-12 text-center font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Open Positions
            </h2>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {openPositions.map((position) => (
                <Card key={position.title}>
                  <CardHeader>
                    <CardTitle className="font-headline">{position.title}</CardTitle>
                    <CardDescription>{position.department} &middot; {position.location}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      We&apos;re looking for an experienced {position.title} to help us innovate and grow.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="link" className="p-0">
                        Apply Now <ArrowRight className="ml-2 size-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
             <div className="mt-16 text-center">
                <p className="text-muted-foreground">Don&apos;t see a role for you? We&apos;re always looking for talent.</p>
                <Button variant="outline" className="mt-4">
                    Get in touch
                </Button>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
