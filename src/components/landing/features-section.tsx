import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import { BarChart, Smartphone, AppWindow, Keyboard, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const features = [
  {
    icon: BarChart,
    title: 'Insights at your fingertips',
    description: 'We track your earnings, tasks, and level progress so you can make smarter decisions.',
    href: '/features',
    imageId: 'feature_insights'
  },
  {
    icon: Smartphone,
    title: 'Manage in real time',
    description: 'All your earnings are synced to your in-app wallet. Deposit, withdraw, and manage on the go.',
    href: '/features',
    imageId: 'feature_mobile'
  },
  {
    icon: AppWindow,
    title: 'Connect your apps',
    description: 'Automate tasks by connecting your favorite social media and content platforms.',
    href: '/features',
    imageId: 'feature_integrations'
  },
  {
    icon: Keyboard,
    title: 'Work smarter',
    description: 'Use keyboard shortcuts to navigate and complete tasks faster than ever before.',
    href: '/features',
    imageId: 'feature_keyboard'
  },
];

export default function FeaturesSection() {
  const imagePlaceholders = PlaceHolderImages;

  return (
    <section id="features" className="py-20 md:py-32 bg-secondary/50">
      <div className="container space-y-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2
            className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl opacity-0 animate-fade-in-up"
            style={{ animationDelay: '0.2s' }}
            >
            Everything you need. Nothing you don&apos;t.
          </h2>
          <p
            className="mt-4 text-lg text-muted-foreground opacity-0 animate-fade-in-up"
            style={{ animationDelay: '0.4s' }}
            >
            From deep analytics to seamless mobile access, TaskVerse makes every task feel like a breeze.
          </p>
        </div>

        <div className="relative">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-12">
            {features.map((feature, i) => {
              const image = imagePlaceholders.find(img => img.id === feature.imageId);
              
              return (
                <div
                  key={feature.title}
                  className={cn(
                    'lg:col-span-6 flex flex-col rounded-xl border bg-card text-card-foreground shadow-sm transition-transform hover:scale-[1.02] hover:shadow-lg',
                    i > 1 && 'lg:mt-16'
                  )}
                >
                  <div className="p-6">
                    <div className="bg-primary/10 text-primary p-3 rounded-lg w-fit">
                        <feature.icon className="size-6" />
                    </div>
                    <h3 className="font-headline text-xl font-semibold mt-4">{feature.title}</h3>
                    <p className="text-muted-foreground mt-2">{feature.description}</p>
                     <Link href={feature.href} className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline mt-4">
                        <span>Learn more</span>
                        <ArrowRight className="size-4" />
                    </Link>
                  </div>
                  {image && (
                     <div className="mt-auto overflow-hidden rounded-b-xl">
                        <Image
                            src={image.imageUrl}
                            alt={feature.title}
                            width={600}
                            height={400}
                            className="w-full object-cover"
                            data-ai-hint={image.imageHint}
                        />
                     </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
