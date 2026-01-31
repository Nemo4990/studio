'use client';

import PageHeader from '@/components/dashboard/page-header';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import type { TaskSubmission, User } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
  collectionGroup,
  doc,
  getDoc,
  runTransaction,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';
import { Check, X } from 'lucide-react';
import React from 'react';
import { useUser } from '@/firebase/auth/use-user';

type SubmissionTableProps = {
  submissions: TaskSubmission[];
  onApprove: (submission: TaskSubmission) => void;
  onReject: (submission: TaskSubmission) => void;
  loading: boolean;
};

function SubmissionTable({
  submissions,
  onApprove,
  onReject,
  loading,
}: SubmissionTableProps) {
  if (loading) {
    return (
      <p className="py-8 text-center text-muted-foreground">
        Loading submissions...
      </p>
    );
  }
  if (submissions.length === 0) {
    return (
      <p className="py-8 text-center text-muted-foreground">
        No submissions in this category.
      </p>
    );
  }

  const toDate = (date: any): Date => {
    if (date instanceof Timestamp) {
      return date.toDate();
    }
    return new Date(date);
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Task</TableHead>
          <TableHead>Reward</TableHead>
          <TableHead>Submitted At</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {submissions.map((sub) => (
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
            <TableCell>${sub.reward}</TableCell>
            <TableCell>{toDate(sub.submittedAt).toLocaleString()}</TableCell>
            <TableCell>
              {sub.status === 'pending' ? (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onApprove(sub)}
                  >
                    <Check className="mr-2 size-4" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive-outline"
                    onClick={() => onReject(sub)}
                  >
                    <X className="mr-2 size-4" />
                    Reject
                  </Button>
                </div>
              ) : (
                <Badge
                  variant={sub.status === 'approved' ? 'default' : 'destructive'}
                  className={cn(
                    sub.status === 'approved' && 'bg-green-500/80'
                  )}
                >
                  {sub.status}
                </Badge>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default function AdminSubmissionsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const { user: adminUser } = useUser();

  const submissionsQuery = useMemoFirebase(
    () =>
      firestore && adminUser?.role === 'admin'
        ? collectionGroup(firestore, 'submissions')
        : null,
    [firestore, adminUser]
  );
  const { data: submissions, isLoading } =
    useCollection<TaskSubmission>(submissionsQuery);

  const handleApprove = async (submission: TaskSubmission) => {
    if (!firestore) return;
    toast({ title: 'Approving submission...' });

    const submissionRef = doc(
      firestore,
      'users',
      submission.userId,
      'submissions',
      submission.id
    );
    const userRef = doc(firestore, 'users', submission.userId);

    try {
      await runTransaction(firestore, async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists()) {
          throw 'User not found!';
        }

        const newBalance = (userDoc.data().walletBalance || 0) + submission.reward;
        transaction.update(userRef, { walletBalance: newBalance });
        transaction.update(submissionRef, { status: 'approved' });
      });

      toast({
        title: 'Submission Approved!',
        description: `User's balance has been updated.`,
      });
    } catch (e: any) {
      console.error('Transaction failed: ', e);
      toast({
        variant: 'destructive',
        title: 'Approval Failed',
        description: e.toString(),
      });
    }
  };

  const handleReject = async (submission: TaskSubmission) => {
    if (!firestore) return;
    const submissionRef = doc(
      firestore,
      'users',
      submission.userId,
      'submissions',
      submission.id
    );
    try {
      await updateDoc(submissionRef, { status: 'rejected' });
      toast({
        title: 'Submission Rejected',
        variant: 'destructive',
      });
    } catch (e: any) {
      toast({
        title: 'Error',
        description: 'Could not reject submission.',
        variant: 'destructive',
      });
    }
  };

  const pending = submissions?.filter((s) => s.status === 'pending') || [];
  const approved = submissions?.filter((s) => s.status === 'approved') || [];
  const rejected = submissions?.filter((s) => s.status === 'rejected') || [];

  return (
    <>
      <PageHeader
        title="Task Submissions"
        description="Review and manage user task submissions."
      />
      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">
            Pending <Badge className="ml-2">{pending.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>
        <Card className="mt-4">
          <TabsContent value="pending">
            <SubmissionTable
              submissions={pending}
              onApprove={handleApprove}
              onReject={handleReject}
              loading={isLoading}
            />
          </TabsContent>
          <TabsContent value="approved">
            <SubmissionTable
              submissions={approved}
              onApprove={handleApprove}
              onReject={handleReject}
              loading={isLoading}
            />
          </TabsContent>
          <TabsContent value="rejected">
            <SubmissionTable
              submissions={rejected}
              onApprove={handleApprove}
              onReject={handleReject}
              loading={isLoading}
            />
          </TabsContent>
        </Card>
      </Tabs>
    </>
  );
}
