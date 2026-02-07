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
import type { Withdrawal, User } from "@/lib/types";
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

const COIN_TO_USD_RATE = 0.01; // 100 coins = $1
const USD_TO_NGN_RATE = 1500;
const USD_TO_ETB_RATE = 58;

const getUsdToLocalRate = (currency: string) => {
    if (currency === 'NGN') return USD_TO_NGN_RATE;
    if (currency === 'ETB') return USD_TO_ETB_RATE;
    return 1; // for USD
};

function BankInfoViewer({ withdrawal, isOpen, onClose }: { withdrawal: Withdrawal | null, isOpen: boolean, onClose: () => void }) {
    const firestore = useFirestore();
    const docRef = useMemoFirebase(
        () => (firestore && withdrawal) ? doc(firestore, 'users', withdrawal.userId, 'withdrawals', withdrawal.id) : null,
        [firestore, withdrawal]
    );
    const { data: fullWithdrawal, isLoading } = useDoc<Withdrawal>(docRef);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>User Bank Details</DialogTitle>
                    <DialogDescription>Withdrawal request from {withdrawal?.user.name}.</DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    {isLoading && <p>Loading details...</p>}
                    {fullWithdrawal?.userBankInfo && (
                        <div className="space-y-3 rounded-md border bg-secondary p-4">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Bank Name</p>
                                <p className="font-semibold">{fullWithdrawal.userBankInfo.bankName}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Account Name</p>
                                <p className="font-semibold">{fullWithdrawal.userBankInfo.accountName}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Account Number</p>
                                <p className="font-semibold font-mono">{fullWithdrawal.userBankInfo.accountNumber}</p>
                            </div>
                        </div>
                    )}
                    {!isLoading && !fullWithdrawal?.userBankInfo && <p>Bank information not available.</p>}
                </div>
            </DialogContent>
        </Dialog>
    );
}

function AdminWithdrawalsView({ adminUser }: { adminUser: User | null }) {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [viewingBankInfo, setViewingBankInfo] = useState<Withdrawal | null>(null);

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

        const withdrawalRef = doc(firestore, 'withdrawals', withdrawal.id);
        const userWithdrawalRef = doc(firestore, 'users', withdrawal.userId, 'withdrawals', withdrawal.id);
        
        if (newStatus === 'approved') {
            const userRef = doc(firestore, 'users', withdrawal.userId);
            
            try {
                await runTransaction(firestore, async (transaction) => {
                    const userDoc = await transaction.get(userRef);
                    if (!userDoc.exists()) {
                        throw new Error("User not found!");
                    }
                    
                    const localRate = getUsdToLocalRate(withdrawal.currency);
                    const amountInUSD = withdrawal.amount / localRate;
                    const coinsToDeduct = amountInUSD / COIN_TO_USD_RATE;
                    
                    const currentBalance = userDoc.data().walletBalance || 0;

                    if (currentBalance < coinsToDeduct) {
                        throw new Error("Insufficient user balance.");
                    }

                    const newBalance = currentBalance - coinsToDeduct;

                    transaction.update(userRef, { walletBalance: newBalance });
                    transaction.update(withdrawalRef, { status: 'approved' });
                    transaction.update(userWithdrawalRef, { status: 'approved' });
                });

                 toast({
                    title: `Withdrawal Approved`,
                    description: `User's balance has been updated.`,
                });

            } catch(e: any) {
                console.error("Transaction failed: ", e);
                toast({
                    title: 'Approval failed',
                    description: e.message || 'Could not approve withdrawal.',
                    variant: 'destructive',
                });
            }

        } else { // newStatus is 'rejected'
            try {
                const batch = writeBatch(firestore);
                batch.update(withdrawalRef, { status: 'rejected' });
                batch.update(userWithdrawalRef, { status: 'rejected' });
                await batch.commit();
                
                toast({
                    title: `Withdrawal Rejected`,
                    description: `The withdrawal status has been updated.`,
                    variant: 'destructive',
                });
            } catch (e: any) {
                console.error("Update failed: ", e);
                toast({
                    title: 'Update failed',
                    description: 'Could not update withdrawal status.',
                    variant: 'destructive',
                });
            }
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
        <>
            <Card>
                <CardContent className="pt-6">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="hidden md:table-cell">Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
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
                                            <Badge variant={withdrawal.status === 'approved' ? 'default' : withdrawal.status === 'rejected' ? 'destructive' : 'secondary'} className={cn(withdrawal.status === 'approved' && 'bg-green-500/80')}>{withdrawal.status}</Badge>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">{(withdrawal.requestedAt as unknown as Timestamp)?.toDate().toLocaleDateString()}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <MoreHorizontal />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => setViewingBankInfo(withdrawal)}>
                                                        View Bank Info
                                                    </DropdownMenuItem>
                                                    {withdrawal.status === 'pending' && (
                                                    <>
                                                        <DropdownMenuItem onClick={() => handleStatusChange(withdrawal, 'approved')}>
                                                            <Check className="mr-2 h-4 w-4" />
                                                            Approve
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="text-destructive"
                                                            onClick={() => handleStatusChange(withdrawal, 'rejected')}
                                                        >
                                                            <X className="mr-2 h-4 w-4" />
                                                            Reject
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
            <BankInfoViewer withdrawal={viewingBankInfo} isOpen={!!viewingBankInfo} onClose={() => setViewingBankInfo(null)} />
        </>
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
