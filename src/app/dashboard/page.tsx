'use client';

import PageHeader from '@/components/dashboard/page-header';
import StatCard from '@/components/dashboard/stat-card';
import { BarChart, CheckCircle2, Star, Coins } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useUser } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';

export default function UserDashboardPage() {
    const { user, loading } = useUser();

    if (loading || !user) {
        return (
            <div>
                <PageHeader title="Dashboard" description="Welcome back! Here's a summary of your account." />
                 <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Skeleton className="h-32"/>
                    <Skeleton className="h-32"/>
                    <Skeleton className="h-32"/>
                    <Skeleton className="h-32"/>
                </div>
            </div>
        )
    }
  
  const completedTasks = user.level === 0 ? 0 : '...';
  const totalEarnings = user.level === 0 ? 0 : user.walletBalance > 0 ? '...' : 0;


  return (
    <>
      <PageHeader title="Dashboard" description={`Welcome back, ${user.name}! Here's a summary of your account.`} />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Current Level" value={`Level ${user.level}`} icon={Star} description="Complete tasks to level up" className="card-glow" />
        <StatCard title="Wallet Balance" value={`${user.walletBalance.toLocaleString()} Coins`} icon={Coins} description="Available for withdrawal" className="card-glow" />
        <StatCard title="Tasks Completed" value={0} icon={CheckCircle2} description="Keep up the great work!" className="card-glow" />
        <StatCard title="Total Earnings" value="0 Coins" icon={BarChart} description="All-time earnings" className="card-glow" />
      </div>

      {user.level === 0 && (
        <div className="mt-8">
            <Card className="card-glow bg-primary/10 border-primary/20">
                <CardHeader>
                    <CardTitle className="font-headline text-primary">Welcome to TaskVerse!</CardTitle>
                    <CardDescription>Your journey starts here. Make your first deposit to level up and unlock more rewarding tasks.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground mb-4">Depositing not only increases your level but also shows your commitment, giving you access to exclusive, higher-paying tasks sooner.</p>
                    <Button asChild>
                        <Link href="/dashboard/wallet">Make a Deposit</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
      )}
    </>
  );
}
