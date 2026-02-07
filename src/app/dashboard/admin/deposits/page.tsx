'use client';

import PageHeader from "@/components/dashboard/page-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Check, X, MoreHorizontal } from "lucide-react";
import { useCollection, useFirestore, useMemoFirebase, useUser, useDoc } from "@/firebase";
import { collection, doc, Timestamp, runTransaction, writeBatch } from "firebase/firestore";
import type { Deposit, User } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const USD_TO_NGN_RATE = 1500;
const USD_TO_ETB_RATE = 58;

const getLevelFromDeposit = (amount: number, currency: string): number => {
    let amountInETB = amount;

    if (currency === 'USD') {
        amountInETB = amount * USD_TO_ETB_RATE;
    } else if (currency === 'NGN') {
        const amountInUSD = amount / USD_TO_NGN_RATE;
        amountInETB = amountInUSD * USD_TO_ETB_RATE;
    }
    
    if (amountInETB >= 20500) return 4;
    if (amountInETB >= 10500) return 3;
    if (amountInETB >= 5500) return 2;
    if (amountInETB >= 1000) return 1;
    
    return 0; 
};

function ProofViewer({ deposit, isOpen, onClose }: { deposit: Deposit | null, isOpen: boolean, onClose: () => void }) {
    const firestore = useFirestore();
    const docRef = useMemoFirebase(
        () => (firestore && deposit) ? doc(firestore, 'users', deposit.userId, 'deposits', deposit.id) : null,
        [firestore, deposit]
    );
    const { data: fullDeposit, isLoading } = useDoc<Deposit>(docRef);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Proof of Payment</DialogTitle>
                    <DialogDescription>
                        Deposit from {deposit?.user.name} for {deposit?.amount.toLocaleString()} {deposit?.currency}.
                    </DialogDescription>
                </DialogHeader>
                {isLoading && <p className="text-center py-8">Loading proof...</p>}
                {!isLoading && fullDeposit?.proofOfPayment && (
                    <img src={fullDeposit.proofOfPayment} alt="Proof of payment" className="rounded-md max-h-[70vh] object-contain" />
                )}
                {!isLoading && !fullDeposit?.proofOfPayment && <p className="text-center py-8">No proof was uploaded.</p>}
            </DialogContent>
        </Dialog>
    );
}

function AdminDepositsView({ adminUser }: { adminUser: User | null }) {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [viewingProof, setViewingProof] = useState<Deposit | null>(null);


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
        const userDepositRef = doc(firestore, 'users', deposit.userId, 'deposits', deposit.id);

        if (newStatus === 'confirmed') {
            const userRef = doc(firestore, 'users', deposit.userId);
            
            try {
                await runTransaction(firestore, async (transaction) => {
                    const userDoc = await transaction.get(userRef);
                    if (!userDoc.exists()) {
                        throw new Error("User not found!");
                    }
                    
                    const levelFromDeposit = getLevelFromDeposit(deposit.amount, deposit.currency);
                    const currentLevel = userDoc.data().level || 0;
                    
                    const finalLevel = Math.max(levelFromDeposit, currentLevel);

                    transaction.update(userRef, { 
                        level: finalLevel,
                    });
                    transaction.update(depositRef, { status: 'confirmed' });
                    transaction.update(userDepositRef, { status: 'confirmed' });
                });
                
                toast({
                    title: `Deposit Confirmed`,
                    description: `User's level has been upgraded.`,
                });

            } catch (e: any) {
                console.error("Transaction failed: ", e);
                toast({
                    title: 'Update failed',
                    description: e.message || 'Could not confirm deposit.',
                    variant: 'destructive',
                });
            }
        } else { // newStatus is 'failed'
            try {
                const batch = writeBatch(firestore);
                batch.update(depositRef, { status: 'failed' });
                batch.update(userDepositRef, { status: 'failed' });
                await batch.commit();
                
                toast({
                    title: `Deposit Failed`,
                    description: `The deposit status has been updated.`,
                    variant: 'destructive',
                });
            } catch (e: any) {
                console.error("Update failed: ", e);
                toast({
                    title: 'Update failed',
                    description: 'Could not update deposit status.',
                    variant: 'destructive',
                });
            }
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
        <>
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
                                <TableHead className="text-right">Actions</TableHead>
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
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <MoreHorizontal />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => setViewingProof(deposit)}>
                                                        View Proof
                                                    </DropdownMenuItem>
                                                    {deposit.status === 'pending' && (
                                                    <>
                                                        <DropdownMenuItem onClick={() => handleStatusChange(deposit, 'confirmed')}>
                                                            <Check className="mr-2 h-4 w-4" />
                                                            Confirm
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="text-destructive"
                                                            onClick={() => handleStatusChange(deposit, 'failed')}
                                                        >
                                                            <X className="mr-2 h-4 w-4" />
                                                            Fail
                                                        </DropdownMenuItem>
                                                    </>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            <ProofViewer deposit={viewingProof} isOpen={!!viewingProof} onClose={() => setViewingProof(null)} />
        </>
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
