import PageHeader from "@/components/dashboard/page-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { taskSubmissions } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";

type SubmissionTableProps = {
    submissions: typeof taskSubmissions;
}

function SubmissionTable({ submissions }: SubmissionTableProps) {
    if (submissions.length === 0) {
        return <p className="text-muted-foreground text-center py-8">No submissions in this category.</p>
    }
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Task</TableHead>
                    <TableHead>Submitted At</TableHead>
                    <TableHead>Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {submissions.map(sub => (
                    <TableRow key={sub.id}>
                        <TableCell>
                            <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarImage src={sub.user.avatarUrl} alt={sub.user.name} />
                                    <AvatarFallback>{sub.user.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>{sub.user.name}</div>
                            </div>
                        </TableCell>
                        <TableCell>{sub.taskTitle}</TableCell>
                        <TableCell>{sub.submittedAt.toLocaleString()}</TableCell>
                        <TableCell>
                           {sub.status === 'pending' ? (
                             <div className="flex gap-2">
                                <Button size="sm" variant="outline"><Check className="size-4 mr-2" />Approve</Button>
                                <Button size="sm" variant="destructive-outline"><X className="size-4 mr-2" />Reject</Button>
                             </div>
                           ) : (
                            <Badge variant={sub.status === 'approved' ? 'default' : 'destructive'} className={cn(sub.status === 'approved' && 'bg-green-500/80')}>
                                {sub.status}
                            </Badge>
                           )}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}

export default function AdminSubmissionsPage() {
    const pending = taskSubmissions.filter(s => s.status === 'pending');
    const approved = taskSubmissions.filter(s => s.status === 'approved');
    const rejected = taskSubmissions.filter(s => s.status === 'rejected');

    return (
        <>
            <PageHeader title="Task Submissions" description="Review and manage user task submissions." />
            <Tabs defaultValue="pending">
                <TabsList>
                    <TabsTrigger value="pending">Pending <Badge className="ml-2">{pending.length}</Badge></TabsTrigger>
                    <TabsTrigger value="approved">Approved</TabsTrigger>
                    <TabsTrigger value="rejected">Rejected</TabsTrigger>
                </TabsList>
                <Card className="mt-4">
                    <TabsContent value="pending">
                        <SubmissionTable submissions={pending} />
                    </TabsContent>
                    <TabsContent value="approved">
                        <SubmissionTable submissions={approved} />
                    </TabsContent>
                    <TabsContent value="rejected">
                        <SubmissionTable submissions={rejected} />
                    </TabsContent>
                </Card>
            </Tabs>
        </>
    )
}
