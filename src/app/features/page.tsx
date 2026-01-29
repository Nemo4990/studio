import PublicFooter from '@/components/landing/public-footer';
import PublicHeader from '@/components/landing/public-header';
import { Bitcoin } from 'lucide-react';
import React from 'react';
import { LogoScroller } from '@/components/landing/logo-scroller';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

// Using React components for logos for better reusability and clarity
const FordLogo = () => <span className="font-headline text-4xl font-bold" style={{color: '#003478'}}>Ford</span>;
const McCloskiLogo = () => <span className="font-headline text-3xl font-bold">McCloski</span>;

const BinanceLogo = () => (
  <svg role="img" aria-label="Binance" className="h-12 w-auto" viewBox="0 0 1024 1024" fill="#F0B90B" xmlns="http://www.w3.org/2000/svg">
    <path d="M512 896L211.2 512 512 128l300.8 384L512 896zM307.2 512l204.8-256 204.8 256-204.8 256-204.8-256zM102.4 512L256 307.2 409.6 512 256 716.8 102.4 512zM921.6 512L768 307.2 614.4 512 768 716.8 921.6 512zM512 0L384 211.2 512 384 640 211.2 512 0zM512 1024l128-211.2-128-179.2-128 179.2L512 1024z"/>
  </svg>
);

const EthereumLogo = () => (
  <svg role="img" aria-label="Ethereum" className="h-12 w-auto text-foreground/90" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 1.75l-6.25 10.5 6.25 4.25 6.25-4.25L12 1.75zM12 17.5l-6.25-3.5L12 22.25l6.25-8.25-6.25 3.5z"/>
  </svg>
);

const PolygonLogo = () => (
  <svg role="img" aria-label="Polygon" className="h-10 w-auto" viewBox="0 0 24 24" fill="#8247E5" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.23 3.322L6.81 6.447v6.25l5.42-3.125V3.322zm-.015 7.2l-5.42 3.13 5.42 3.124v-6.254zM12 2.19l5.405 3.125-2.703 1.56-2.702-1.56v.001zm5.435 7.332L12 12.647v6.25l5.435-3.125v-6.25z"/>
  </svg>
);

const SolanaLogo = () => (
    <svg role="img" aria-label="Solana" className="h-8 w-auto" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="sol-gradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#9945FF" />
                <stop offset="100%" stopColor="#14F195" />
            </linearGradient>
        </defs>
        <path d="M3 4.5h18" stroke="url(#sol-gradient)" strokeWidth="3"/>
        <path d="M3 10.5h18" stroke="url(#sol-gradient)" strokeWidth="3"/>
        <path d="M3 16.5h18" stroke="url(#sol-gradient)" strokeWidth="3"/>
    </svg>
);

const CardanoLogo = () => (
  <svg role="img" aria-label="Cardano" className="h-12 w-auto" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" fill="#0D1E40"/>
    <circle cx="12" cy="12" r="6" stroke="#0033AD" strokeWidth="2" fill="white"/>
    <path d="M12 4v2m0 12v2m-6-8H4m14 0h-2m-7.07-4.93l-1.42-1.42M18.36 18.36l-1.42-1.42m-9.9 0l1.42-1.42m8.48-8.48l1.42-1.42" stroke="#0033AD" strokeWidth="2"/>
  </svg>
);

const ChainlinkLogo = () => (
  <svg role="img" aria-label="Chainlink" className="h-10 w-auto" fill="#375BD2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M9.48 11.23a2.49 2.49 0 100-4.98 2.49 2.49 0 000 4.98zm5.04-5.04a2.49 2.49 0 100-4.98 2.49 2.49 0 000 4.98zM9.48 17.77a2.49 2.49 0 100-4.98 2.49 2.49 0 000 4.98zm5.04-5.04a2.49 2.49 0 100-4.98 2.49 2.49 0 000 4.98z"/>
      <path d="M13.46 9.75l-2.92-2.92.94-.94 2.92 2.92-.94.94zm-2.92 6.5l-2.92-2.92.94-.94 2.92 2.92-.94.94z"/>
  </svg>
);

const PolkadotLogo = () => (
  <svg role="img" aria-label="Polkadot" className="h-12 w-auto" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 12a8 8 0 1116 0 8 8 0 01-16 0" stroke="#E6007A" strokeWidth="2"/>
    <circle cx="12" cy="6" r="2" fill="#E6007A"/>
    <circle cx="16.92" cy="9" r="2" fill="#E6007A"/>
    <circle cx="16.92" cy="15" r="2" fill="#E6007A"/>
    <circle cx="12" cy="18" r="2" fill="#E6007A"/>
    <circle cx="7.08" cy="15" r="2" fill="#E6007A"/>
    <circle cx="7.08" cy="9" r="2" fill="#E6007A"/>
  </svg>
);

const sponsors = [
  { name: 'Ford', logo: <FordLogo /> },
  { name: 'McCloski', logo: <McCloskiLogo /> },
  { name: 'Bitcoin', logo: <Bitcoin className="h-12 w-auto text-yellow-500" /> },
  { name: 'Binance', logo: <BinanceLogo /> },
];

const blockchainPartners = [
  { name: 'Ethereum', logo: <EthereumLogo /> },
  { name: 'Polygon', logo: <PolygonLogo /> },
  { name: 'Solana', logo: <SolanaLogo /> },
  { name: 'Cardano', logo: <CardanoLogo /> },
  { name: 'Chainlink', logo: <ChainlinkLogo /> },
  { name: 'Polkadot', logo: <PolkadotLogo /> },
];

const partnersHeroImage = PlaceHolderImages.find(img => img.id === 'partners_hero');

export default function FeaturesPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicHeader />
      <main className="flex-1">
        <section className="relative flex items-center justify-center text-center text-white py-20 md:py-32">
          {partnersHeroImage && (
            <Image
              src={partnersHeroImage.imageUrl}
              alt={partnersHeroImage.description}
              fill
              className="object-cover"
              data-ai-hint={partnersHeroImage.imageHint}
              priority
            />
          )}
          <div className="absolute inset-0 bg-black/60" />
          <div className="container relative z-10">
            <div className="mx-auto max-w-3xl">
              <h1 className="font-headline text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                Our Partners & Sponsors
              </h1>
              <p className="mt-6 text-lg leading-8 text-white/80">
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
            <div className="mt-16">
                <LogoScroller items={sponsors} speed="normal" />
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
            <div className="mt-16">
                <LogoScroller items={blockchainPartners} speed="slow" />
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
