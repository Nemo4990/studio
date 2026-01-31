import PageHeader from "@/components/dashboard/page-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { allWithdrawals, mockUsers } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";

export default function AdminWithdrawalsPage() {
    
    const getUserById = (id: string) => mockUsers.find(u => u.id === id);

    return (
        <>
            <PageHeader title="Withdrawals" description="Review and approve or reject user withdrawal requests." />
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
                            {allWithdrawals.map(withdrawal => {
                                const user = getUserById(withdrawal.userId!);
                                return (
                                    <TableRow key={withdrawal.id}>
                                        <TableCell>
                                            {user && (
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarImage src={user.avatarUrl} alt={user.name} />
                                                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <div>{user.name}</div>
                                                </div>
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
                                        <TableCell>{withdrawal.requestedAt.toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            {withdrawal.status === 'pending' && (
                                                <div className="flex gap-2">
                                                    <Button size="sm" variant="outline"><Check className="size-4 mr-2" />Approve</Button>
                                                    <Button size="sm" variant="destructive-outline"><X className="size-4 mr-2" />Reject</Button>
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
        </>
    )
}
