'use client';

import PageHeader from "@/components/dashboard/page-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Check, X, FileText } from "lucide-react";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, doc, updateDoc, Timestamp } from "firebase/firestore";
import type { Deposit, User } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import React from "react";

function AdminDepositsView({ adminUser }: { adminUser: User | null }) {
    const firestore = useFirestore();
    const { toast } = useToast();

    // Query the top-level 'deposits' collection for admin review
    const depositsQuery = useMemoFirebase(
        () => (firestore && adminUser?.role === 'admin') ? collection(firestore, 'deposits') : null,
        [firestore, adminUser]
    );
    const { data: deposits, isLoading: depositsLoading } = useCollection<Deposit>(depositsQuery);

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
    
    const handleStatusChange = async (deposit: Deposit, newStatus: 'confirmed' | 'failed') => {
        if (!firestore) return;
        toast({ title: `Updating to ${newStatus}...` });

        const depositRef = doc(firestore, 'deposits', deposit.id);

        try {
            await updateDoc(depositRef, { status: newStatus });

            toast({
                title: `Deposit ${newStatus}`,
                description: `The deposit status has been updated.`,
                variant: newStatus === 'failed' ? 'destructive' : 'default',
            });
        } catch (e) {
            console.error("Update failed: ", e);
            toast({
                title: 'Update failed',
                description: 'Could not update deposit status.',
                variant: 'destructive',
            });
        }
    }
    
    const isLoading = depositsLoading || usersLoading;

    if (isLoading) {
        return (
            <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                    Loading deposits...
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
                            <TableHead>Agent</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Proof</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {deposits && deposits.map(deposit => {
                            const user = getUserById(deposit.userId);
                            return (
                                <TableRow key={deposit.id}>
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
                                            <div>{deposit.userId}</div>
                                        )}
                                    </TableCell>
                                    <TableCell>{deposit.amount.toLocaleString()} {deposit.currency}</TableCell>
                                    <TableCell>{deposit.agentName}</TableCell>
                                    <TableCell>
                                        <Badge variant={deposit.status === 'confirmed' ? 'default' : deposit.status === 'failed' ? 'destructive' : 'secondary'} className={cn(deposit.status === 'confirmed' && 'bg-green-500/80')}>{deposit.status}</Badge>
                                    </TableCell>
                                    <TableCell>{(deposit.createdAt as unknown as Timestamp)?.toDate().toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <Button variant="outline" size="sm" asChild>
                                            <a href={deposit.proofOfPayment} target="_blank" rel="noopener noreferrer">
                                                <FileText className="size-4 mr-2" />
                                                View
                                            </a>
                                        </Button>
                                    </TableCell>
                                    <TableCell>
                                        {deposit.status === 'pending' && (
                                            <div className="flex gap-2">
                                                <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => handleStatusChange(deposit, 'confirmed')}><Check className="size-4" /></Button>
                                                <Button size="icon" variant="destructive-outline" className="h-8 w-8" onClick={() => handleStatusChange(deposit, 'failed')}><X className="size-4" /></Button>
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
    )
}

export default function AdminDepositsPage() {
    const { user: adminUser, loading: userLoading } = useUser();

    if (userLoading) {
        return (
            <>
                <PageHeader title="Deposits" description="Verifying permissions..." />
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
            <PageHeader title="Deposits" description="View and manage all user deposit transactions." />
            <AdminDepositsView adminUser={adminUser} />
        </>
    )
}
