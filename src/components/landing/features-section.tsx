import Link from 'next/link';
import { ArrowRight, BarChart, Smartphone, AppWindow, Keyboard } from 'lucide-react';

const features = [
  {
    icon: BarChart,
    title: 'Insights at your fingertips',
    description: 'We track your earnings, tasks, and level progress so you can make smarter decisions.',
    href: '/features'
  },
  {
    icon: Smartphone,
    title: 'Manage in real time',
    description: 'All your earnings are synced to your in-app wallet. Deposit, withdraw, and manage on the go.',
    href: '/features'
  },
  {
    icon: AppWindow,
    title: 'Connect your apps',
    description: 'Automate tasks by connecting your favorite social media and content platforms.',
    href: '/features'
  },
  {
    icon: Keyboard,
    title: 'Work smarter',
    description: 'Use keyboard shortcuts to navigate and complete tasks faster than ever before.',
    href: '/features'
  },
];

export default function FeaturesSection() {
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

        <div className="space-y-16">
            <div className="text-center max-w-2xl mx-auto">
                <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                    Everything you need. Nothing you don&apos;t.
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                    From deep analytics to seamless mobile access, TaskVerse makes every task feel like a breeze.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
              {features.map((feature) => (
                <div key={feature.title} className="flex flex-col items-start gap-4">
                    <div className="bg-primary/10 text-primary p-3 rounded-lg">
                        <feature.icon className="size-6" />
                    </div>
                    <h3 className="font-headline text-xl font-semibold">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                    <Link href={feature.href} className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
                        <span>Learn more</span>
                        <ArrowRight className="size-4" />
                    </Link>
                </div>
              ))}
            </div>
        </div>
      </div>
    </section>
  );
}
