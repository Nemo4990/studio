import PublicFooter from '@/components/landing/public-footer';
import PublicHeader from '@/components/landing/public-header';

const sponsors = [
  { name: 'Ford' },
  { name: 'McCloski' },
  { name: 'Bitcoin' },
  { name: 'Binance' },
];

const blockchainPartners = [
  { name: 'Ethereum' },
  { name: 'Polygon' },
  { name: 'Solana' },
  { name: 'Cardano' },
  { name: 'Chainlink' },
  { name: 'Polkadot' },
];

export default function FeaturesPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicHeader />
      <main className="flex-1">
        <section className="py-20 md:py-32">
          <div className="container">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
                Our Partners & Sponsors
              </h1>
              <p className="mt-6 text-lg leading-8 text-foreground/70">
                We are proud to collaborate with leading companies in the
                blockchain industry and are supported by world-renowned
                sponsors.
              </p>
            </div>
          </div>
        </section>

        <section id="sponsors" className="bg-secondary py-20 md:py-32">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Sponsored By
              </h2>
              <p className="mt-6 text-lg leading-8 text-foreground/70">
                Our platform is backed by industry leaders who believe in our
                vision.
              </p>
            </div>
            <div className="mt-16 grid grid-cols-2 gap-8 md:grid-cols-4">
              {sponsors.map((sponsor) => (
                <div
                  key={sponsor.name}
                  className="flex items-center justify-center rounded-lg bg-background p-8 shadow-sm"
                >
                  <span className="text-2xl font-bold text-foreground">
                    {sponsor.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="collaborations" className="py-20 md:py-32">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Blockchain Collaborations
              </h2>
              <p className="mt-6 text-lg leading-8 text-foreground/70">
                We partner with cutting-edge blockchain projects to bring you
                the best opportunities.
              </p>
            </div>
            <div className="mt-16 grid grid-cols-2 gap-8 md:grid-cols-3">
              {blockchainPartners.map((partner) => (
                <div
                  key={partner.name}
                  className="flex items-center justify-center rounded-lg bg-secondary p-8"
                >
                  <span className="text-xl font-semibold text-foreground/80">
                    {partner.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
