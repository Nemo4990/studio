import {
  Card,
  CardContent,
} from '@/components/ui/card';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

const features = [
  {
    id: 'feature_insights',
    title: 'Insights at your fingertips',
    description: 'We track your earnings, tasks, and level progress so you can make smarter decisions.',
  },
  {
    id: 'feature_mobile',
    title: 'Manage in real time',
    description: 'All your earnings are synced to your in-app wallet. Deposit, withdraw, and manage on the go.',
  },
  {
    id: 'feature_integrations',
    title: 'Connect your apps',
    description: 'Automate tasks by connecting your favorite social media and content platforms.',
  },
  {
    id: 'feature_keyboard',
    title: 'Work smarter',
    description: 'Use keyboard shortcuts to navigate and complete tasks faster than ever before.',
  },
];

export default function FeaturesSection() {
    const images = new Map(PlaceHolderImages.map(img => [img.id, img]));
  return (
    <section id="features" className="py-20 md:py-32">
      <div className="container space-y-24">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
            <div className="max-w-md">
                <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                    Who said earning crypto has to be boring?
                </h2>
            </div>
            <div className="space-y-4">
                <p className="text-lg text-muted-foreground">
                    TaskVerse transforms the daily grind into a captivating game. Dive into a world of interactive challenges, from speedmath duels to creative contests, and watch your crypto portfolio expand as you conquer each level.
                </p>
                <p className="text-lg text-muted-foreground">
                    We believe that entering the world of digital assets should be accessible, transparent, and genuinely enjoyable. Forget complex charts and baffling jargon. Here, you just play, earn, and build your future in the digital economy.
                </p>
            </div>
        </div>

        <div className="space-y-8">
            <div className="text-center max-w-2xl mx-auto">
                <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                    Everything you need. Nothing you don&apos;t.
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                    From deep analytics to seamless mobile access, TaskVerse makes every task feel like a breeze.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {features.map((feature) => {
                    const image = images.get(feature.id);
                    return (
                        <Card key={feature.id} className="bg-secondary/50 group overflow-hidden flex flex-col">
                            <CardContent className="p-6 flex flex-col flex-grow">
                                {image && (
                                     <Image
                                        src={image.imageUrl}
                                        alt={image.description}
                                        width={500}
                                        height={400}
                                        className="w-full rounded-lg mb-6 border border-white/10"
                                        data-ai-hint={image.imageHint}
                                    />
                                )}
                                <div className="flex-grow">
                                    <h3 className="font-headline text-lg font-semibold">{feature.title}</h3>
                                    <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
                                </div>
                                <Link href="/features" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                                    <span>Learn more</span>
                                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                                </Link>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
      </div>
    </section>
  );
}
