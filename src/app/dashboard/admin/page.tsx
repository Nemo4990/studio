import PageHeader from "@/components/dashboard/page-header";
import StatCard from "@/components/dashboard/stat-card";
import { allDeposits, allWithdrawals, mockUsers, taskSubmissions } from "@/lib/data";
import { ArrowDownToDot, ArrowUpFromDot, ListTodo, SendToBack, Users } from "lucide-react";

export default function AdminDashboardPage() {
    const pendingSubmissions = taskSubmissions.filter(s => s.status === 'pending').length;
    const pendingDeposits = allDeposits.filter(d => d.status === 'pending').length;
    const pendingWithdrawals = allWithdrawals.filter(w => w.status === 'pending').length;

    return (
        <>
            <PageHeader title="Admin Dashboard" description="Overview of platform activity and pending actions." />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Total Users" value={mockUsers.length} icon={Users} />
                <StatCard title="Pending Submissions" value={pendingSubmissions} icon={SendToBack} description="Require review" />
                <StatCard title="Pending Deposits" value={pendingDeposits} icon={ArrowDownToDot} description="Require confirmation" />
                <StatCard title="Pending Withdrawals" value={pendingWithdrawals} icon={ArrowUpFromDot} description="Require approval" />
            </div>
            <div className="mt-8">
                {/* Could add charts or recent activity logs here */}
            </div>
        </>
    )
}
