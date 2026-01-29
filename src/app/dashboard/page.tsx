import PageHeader from '@/components/dashboard/page-header';
import StatCard from '@/components/dashboard/stat-card';
import { mockUser, userTasks } from '@/lib/data';
import { BarChart, CheckCircle2, CircleDollarSign, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function UserDashboardPage() {
    const completedTasks = userTasks.filter(t => t.status === 'completed').length;

  return (
    <>
      <PageHeader title="Dashboard" description="Welcome back! Here's a summary of your account." />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Current Level" value={`Level ${mockUser.level}`} icon={Star} description="Complete more tasks to level up" />
        <StatCard title="Wallet Balance" value={`$${mockUser.walletBalance.toFixed(2)}`} icon={CircleDollarSign} description="Available for withdrawal" />
        <StatCard title="Tasks Completed" value={completedTasks} icon={CheckCircle2} description="Keep up the great work!" />
        <StatCard title="Total Earnings" value="$450.23" icon={BarChart} description="All-time earnings" />
      </div>
      <div className="mt-8">
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Next Task Available</CardTitle>
                <CardDescription>This is the next task you can complete to earn rewards.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-secondary rounded-lg">
                    <div>
                        <h3 className="text-lg font-semibold">{userTasks[0].title}</h3>
                        <p className="text-muted-foreground">{userTasks[0].description}</p>
                    </div>
                    <div className="flex items-center gap-4 mt-4 md:mt-0">
                        <span className="font-semibold text-lg text-primary">+${userTasks[0].reward}</span>
                        <Button asChild>
                            <Link href="/dashboard/tasks">View Task</Link>
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
      </div>
    </>
  );
}
