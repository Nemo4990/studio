'use client';

import PageHeader from '@/components/dashboard/page-header';
import StatCard from '@/components/dashboard/stat-card';
import { BarChart, CheckCircle2, Star, Coins, Wallet, CheckSquare } from 'lucide-react';
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

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link href="/dashboard/tasks">
                <Card className="group card-glow hover:border-primary/50 transition-colors">
                    <CardHeader className="flex flex-row items-center gap-4">
                        <div className="p-3 bg-secondary rounded-lg">
                           <CheckSquare className="size-6 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="font-headline text-xl">View Tasks</CardTitle>
                            <CardDescription>Complete tasks to earn rewards.</CardDescription>
                        </div>
                    </CardHeader>
                </Card>
            </Link>
             <Link href="/dashboard/wallet">
                <Card className="group card-glow hover:border-primary/50 transition-colors">
                    <CardHeader className="flex flex-row items-center gap-4">
                         <div className="p-3 bg-secondary rounded-lg">
                           <Wallet className="size-6 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="font-headline text-xl">Go to Wallet</CardTitle>
                            <CardDescription>Manage deposits and withdrawals.</CardDescription>
                        </div>
                    </CardHeader>
                </Card>
            </Link>
        </div>
    </>
  );
}
