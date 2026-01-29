import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  CheckSquare,
  Wallet,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';

const features = [
  {
    icon: <CheckSquare className="size-8 text-primary" />,
    title: 'Task-Based Earnings',
    description:
      'Access a variety of tasks based on your level. From social media engagement to content creation, there’s always a way to earn.',
  },
  {
    icon: <ArrowUpRight className="size-8 text-primary" />,
    title: 'Level Up System',
    description:
      'Start as a novice and climb the ranks. Higher levels unlock more complex tasks with greater crypto rewards.',
  },
  {
    icon: <Wallet className="size-8 text-primary" />,
    title: 'Instant Wallet & Rewards',
    description:
      'Your earnings are instantly credited to your secure in-app wallet. Track your balance and rewards history with ease.',
  },
  {
    icon: <ShieldCheck className="size-8 text-primary" />,
    title: 'Secure & Transparent',
    description:
      'We use blockchain technology to ensure all transactions are verified and transparent. Your deposits and withdrawals are safe.',
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-20 md:py-32 bg-secondary">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            How It Works
          </h2>
          <p className="mt-6 text-lg leading-8 text-foreground/70">
            A simple, rewarding process designed for everyone.
          </p>
        </div>
        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <Card key={feature.title} className="bg-background">
              <CardHeader>
                {feature.icon}
                <CardTitle className="font-headline pt-4">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
