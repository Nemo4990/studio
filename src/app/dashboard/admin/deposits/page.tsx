import PageHeader from "@/components/dashboard/page-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { allDeposits, mockUsers, mockAgents } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Check, X, FileText } from "lucide-react";

export default function AdminDepositsPage() {
    
    const getUserById = (id: string) => mockUsers.find(u => u.id === id);
    const getAgentById = (id: string) => mockAgents.find(a => a.id === id);

    return (
        <>
            <PageHeader title="Deposits" description="View and manage all user deposit transactions." />
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
                            {allDeposits.map(deposit => {
                                const user = getUserById(deposit.userId!);
                                const agent = getAgentById(deposit.agentId);
                                return (
                                    <TableRow key={deposit.id}>
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
                                        <TableCell>{deposit.amount.toLocaleString()} {deposit.currency}</TableCell>
                                        <TableCell>{agent?.name}</TableCell>
                                        <TableCell>
                                            <Badge variant={deposit.status === 'confirmed' ? 'default' : deposit.status === 'failed' ? 'destructive' : 'secondary'} className={cn(deposit.status === 'confirmed' && 'bg-green-500/80')}>{deposit.status}</Badge>
                                        </TableCell>
                                        <TableCell>{deposit.createdAt.toLocaleDateString()}</TableCell>
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
                                                    <Button size="icon" variant="outline" className="h-8 w-8"><Check className="size-4" /></Button>
                                                    <Button size="icon" variant="destructive-outline" className="h-8 w-8"><X className="size-4" /></Button>
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
