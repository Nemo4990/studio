'use client';

import PageHeader from "@/components/dashboard/page-header";
import StatCard from "@/components/dashboard/stat-card";
import { ArrowDownToDot, ArrowUpFromDot, SendToBack, Users } from "lucide-react";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboardPage() {
    const { user, loading: userLoading } = useUser();
    const firestore = useFirestore();

    const usersQuery = useMemoFirebase(
        () => (firestore && user?.role === 'admin') ? collection(firestore, 'users') : null,
        [firestore, user]
    );
    const { data: users, isLoading: usersLoading } = useCollection(usersQuery);

    const pendingSubmissionsQuery = useMemoFirebase(
        () => (firestore && user?.role === 'admin') ? query(collection(firestore, 'submissions'), where('status', '==', 'pending')) : null,
        [firestore, user]
    );
    const { data: pendingSubmissions, isLoading: submissionsLoading } = useCollection(pendingSubmissionsQuery);
    
    const pendingDepositsQuery = useMemoFirebase(
        () => (firestore && user?.role === 'admin') ? query(collection(firestore, 'deposits'), where('status', '==', 'pending')) : null,
        [firestore, user]
    );
    const { data: pendingDeposits, isLoading: depositsLoading } = useCollection(pendingDepositsQuery);
    
    const pendingWithdrawalsQuery = useMemoFirebase(
        () => (firestore && user?.role === 'admin') ? query(collection(firestore, 'withdrawals'), where('status', '==', 'pending')) : null,
        [firestore, user]
    );
    const { data: pendingWithdrawals, isLoading: withdrawalsLoading } = useCollection(pendingWithdrawalsQuery);

    const isLoading = userLoading || usersLoading || submissionsLoading || depositsLoading || withdrawalsLoading;

    if (isLoading) {
        return (
            <>
                <PageHeader title="Admin Dashboard" description="Overview of platform activity and pending actions." />
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Skeleton className="h-28" />
                    <Skeleton className="h-28" />
                    <Skeleton className="h-28" />
                    <Skeleton className="h-28" />
                </div>
            </>
        )
    }
    
    return (
        <>
            <PageHeader title="Admin Dashboard" description="Overview of platform activity and pending actions." />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Total Users" value={users?.length || 0} icon={Users} />
                <StatCard title="Pending Submissions" value={pendingSubmissions?.length || 0} icon={SendToBack} description="Require review" />
                <StatCard title="Pending Deposits" value={pendingDeposits?.length || 0} icon={ArrowDownToDot} description="Require confirmation" />
                <StatCard title="Pending Withdrawals" value={pendingWithdrawals?.length || 0} icon={ArrowUpFromDot} description="Require approval" />
            </div>
            <div className="mt-8">
                {/* Could add charts or recent activity logs here */}
            </div>
        </>
    )
}
