'use client';
import PageHeader from "@/components/dashboard/page-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, doc, runTransaction, Timestamp } from "firebase/firestore";
import type { Withdrawal, User } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import React from "react";

function AdminWithdrawalsView({ adminUser }: { adminUser: User | null }) {
    const firestore = useFirestore();
    const { toast } = useToast();

    // Query the top-level 'withdrawals' collection for admin review
    const withdrawalsQuery = useMemoFirebase(
        () => (firestore && adminUser?.role === 'admin') ? collection(firestore, 'withdrawals') : null,
        [firestore, adminUser]
    );
    const { data: withdrawals, isLoading: withdrawalsLoading } = useCollection<Withdrawal>(withdrawalsQuery);

    const usersQuery = useMemoFirebase(
        () => (firestore && adminUser?.role === 'admin') ? collection(firestore, 'users') : null,
        [firestore, adminUser]
    );
    const { data: users, isLoading: usersLoading } = useCollection<User>(usersQuery);

    const usersMap = React.useMemo(() => {
        if (!users) return new Map();
        return new Map(users.map(user => [user.id, user]));
    }, [users]);
    
    const getUserById = (id: string) => usersMap.get(id);

    const handleStatusChange = async (withdrawal: Withdrawal, newStatus: 'approved' | 'rejected') => {
        if (!firestore) return;
        toast({ title: `Updating to ${newStatus}...` });

        // Refs for the two documents that need to be updated
        const adminWithdrawalRef = doc(firestore, 'withdrawals', withdrawal.id);
        const userWithdrawalRef = doc(firestore, 'users', withdrawal.userId, 'withdrawals', withdrawal.id);
        
        try {
            await runTransaction(firestore, async (transaction) => {
              // Note: You might want to add a transaction to the user's wallet balance here if 'approved'
              transaction.update(adminWithdrawalRef, { status: newStatus });
              transaction.update(userWithdrawalRef, { status: newStatus });
            });
            
            toast({
                title: `Withdrawal ${newStatus}`,
                description: `The withdrawal status has been updated.`,
                variant: newStatus === 'rejected' ? 'destructive' : 'default',
            });
        } catch (e) {
            console.error("Transaction failed: ", e);
            toast({
                title: 'Update failed',
                description: 'Could not update withdrawal status.',
                variant: 'destructive',
            });
        }
    };
    
    const isLoading = withdrawalsLoading || usersLoading;

    if (isLoading) {
        return (
            <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                    Loading withdrawals...
                </CardContent>
            </Card>
        )
    }
    
    return (
        <Card>
            <CardContent className="pt-6">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Bank Info</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {withdrawals && withdrawals.map(withdrawal => {
                            const user = getUserById(withdrawal.userId);
                            return (
                                <TableRow key={withdrawal.id}>
                                    <TableCell>
                                        {user ? (
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                                                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div>{user.name}</div>
                                            </div>
                                        ) : (
                                            <div>{withdrawal.userId}</div>
                                        )}
                                    </TableCell>
                                    <TableCell>{withdrawal.amount.toLocaleString()} {withdrawal.currency}</TableCell>
                                    <TableCell>
                                        <div className="text-sm font-medium">{withdrawal.userBankInfo.accountName}</div>
                                        <div className="text-xs text-muted-foreground">{withdrawal.userBankInfo.bankName} - {withdrawal.userBankInfo.accountNumber}</div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={withdrawal.status === 'approved' ? 'default' : withdrawal.status === 'rejected' ? 'destructive' : 'secondary'} className={cn(withdrawal.status === 'approved' && 'bg-green-500/80')}>{withdrawal.status}</Badge>
                                    </TableCell>
                                    <TableCell>{(withdrawal.requestedAt as unknown as Timestamp)?.toDate().toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        {withdrawal.status === 'pending' && (
                                            <div className="flex gap-2">
                                                <Button size="sm" variant="outline" onClick={() => handleStatusChange(withdrawal, 'approved')}><Check className="size-4 mr-2" />Approve</Button>
                                                <Button size="sm" variant="destructive-outline" onClick={() => handleStatusChange(withdrawal, 'rejected')}><X className="size-4 mr-2" />Reject</Button>
                                            </div>
                                        )}
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

export default function AdminWithdrawalsPage() {
    const { user: adminUser, loading: userLoading } = useUser();
    
    if (userLoading) {
        return (
            <>
                <PageHeader title="Withdrawals" description="Verifying permissions..." />
                <Card>
                    <CardContent className="pt-6 text-center text-muted-foreground">
                        Loading...
                    </CardContent>
                </Card>
            </>
        )
    }
    
    if (adminUser?.role !== 'admin') {
         return <PageHeader title="Unauthorized" description="You do not have permission to view this page." />
    }

    return (
        <>
            <PageHeader title="Withdrawals" description="Review and approve or reject user withdrawal requests." />
            <AdminWithdrawalsView adminUser={adminUser} />
        </>
    )
}
