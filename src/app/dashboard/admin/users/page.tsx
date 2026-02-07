'use client';
import React, { useState, useMemo } from 'react';
import PageHeader from '@/components/dashboard/page-header';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import type { User, TaskSubmission, Deposit, Withdrawal } from '@/lib/types';
import { collection, Timestamp, query, orderBy } from 'firebase/firestore';
import {
  MoreHorizontal,
  Coins,
  CheckSquare,
  ArrowDownToDot,
  ArrowUpFromDot,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import StatCard from '@/components/dashboard/stat-card';

const toDate = (date: any): Date => {
  if (date instanceof Timestamp) {
    return date.toDate();
  }
  // Handles ISO strings that might come from JSON.stringify
  if (typeof date === 'string') {
    return new Date(date);
  }
  return new Date();
};


function UserDetailsDialog({
  user,
  isOpen,
  onOpenChange,
}: {
  user: User | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const firestore = useFirestore();

  // Queries for user's subcollections
  const submissionsQuery = useMemoFirebase(
    () =>
      user
        ? query(
            collection(firestore, 'users', user.id, 'submissions'),
            orderBy('submittedAt', 'desc')
          )
        : null,
    [firestore, user]
  );
  const { data: submissions, isLoading: submissionsLoading } =
    useCollection<TaskSubmission>(submissionsQuery);

  const depositsQuery = useMemoFirebase(
    () =>
      user
        ? query(
            collection(firestore, 'users', user.id, 'deposits'),
            orderBy('createdAt', 'desc')
          )
        : null,
    [firestore, user]
  );
  const { data: deposits, isLoading: depositsLoading } =
    useCollection<Deposit>(depositsQuery);

  const withdrawalsQuery = useMemoFirebase(
    () =>
      user
        ? query(
            collection(firestore, 'users', user.id, 'withdrawals'),
            orderBy('requestedAt', 'desc')
          )
        : null,
    [firestore, user]
  );
  const { data: withdrawals, isLoading: withdrawalsLoading } =
    useCollection<Withdrawal>(withdrawalsQuery);
  
  const approvedSubmissions = useMemo(() => submissions?.filter(s => s.status === 'approved') || [], [submissions]);
  const confirmedDeposits = useMemo(() => deposits?.filter(d => d.status === 'confirmed') || [], [deposits]);
  const approvedWithdrawals = useMemo(() => withdrawals?.filter(w => w.status === 'approved') || [], [withdrawals]);
  
  const totalEarnings = useMemo(() => approvedSubmissions.reduce((acc, sub) => acc + sub.reward, 0), [approvedSubmissions]);


  const isLoading = submissionsLoading || depositsLoading || withdrawalsLoading;

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh]">
        <DialogHeader className="flex-row items-center gap-4">
          <Avatar className="h-14 w-14">
            <AvatarImage src={user.avatarUrl} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <DialogTitle className="font-headline text-2xl">{user.name}</DialogTitle>
            <DialogDescription>{user.email}</DialogDescription>
          </div>
        </DialogHeader>
        <div className="py-4">
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="submissions">Submissions</TabsTrigger>
              <TabsTrigger value="deposits">Deposits</TabsTrigger>
              <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="mt-4">
               <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StatCard title="Level" value={user.level} icon={Coins} />
                    <StatCard title="Balance" value={`${user.walletBalance.toLocaleString()} Coins`} icon={Coins} />
                    <StatCard title="Tasks Completed" value={approvedSubmissions.length} icon={CheckSquare} />
                    <StatCard title="Total Earned" value={`${totalEarnings.toLocaleString()} Coins`} icon={Coins} />
                    <StatCard title="Total Deposits" value={confirmedDeposits.length} icon={ArrowDownToDot} />
                    <StatCard title="Total Withdrawals" value={approvedWithdrawals.length} icon={ArrowUpFromDot} />
               </div>
            </TabsContent>
            <TabsContent value="submissions">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reward</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                   {isLoading ? (
                      <TableRow><TableCell colSpan={4} className="text-center">Loading...</TableCell></TableRow>
                   ) : submissions?.map(sub => (
                    <TableRow key={sub.id}>
                      <TableCell>{sub.taskTitle}</TableCell>
                      <TableCell><Badge variant={sub.status === 'approved' ? 'default' : sub.status === 'rejected' ? 'destructive' : 'secondary'} className={cn(sub.status === 'approved' && 'bg-green-500/80')}>{sub.status}</Badge></TableCell>
                      <TableCell>{sub.reward}</TableCell>
                      <TableCell>{toDate(sub.submittedAt).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
            <TabsContent value="deposits">
               <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Agent</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                   {isLoading ? (
                      <TableRow><TableCell colSpan={4} className="text-center">Loading...</TableCell></TableRow>
                   ) : deposits?.map(dep => (
                    <TableRow key={dep.id}>
                      <TableCell>{dep.amount.toLocaleString()} {dep.currency}</TableCell>
                      <TableCell><Badge variant={dep.status === 'confirmed' ? 'default' : dep.status === 'failed' ? 'destructive' : 'secondary'} className={cn(dep.status === 'confirmed' && 'bg-green-500/80')}>{dep.status}</Badge></TableCell>
                      <TableCell>{toDate(dep.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>{dep.agentName}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
            <TabsContent value="withdrawals">
               <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Bank</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                   {isLoading ? (
                      <TableRow><TableCell colSpan={4} className="text-center">Loading...</TableCell></TableRow>
                   ) : withdrawals?.map(wd => (
                    <TableRow key={wd.id}>
                      <TableCell>{wd.amount.toLocaleString()} {wd.currency}</TableCell>
                      <TableCell><Badge variant={wd.status === 'approved' ? 'default' : wd.status === 'rejected' ? 'destructive' : 'secondary'} className={cn(wd.status === 'approved' && 'bg-green-500/80')}>{wd.status}</Badge></TableCell>
                      <TableCell>{toDate(wd.requestedAt).toLocaleDateString()}</TableCell>
                      <TableCell>{wd.userBankInfo.bankName}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}


export default function AdminUsersPage() {
  const firestore = useFirestore();
  const { user: currentUser, loading: userLoading } = useUser();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Query is only created when we know the user is an admin.
  const usersQuery = useMemoFirebase(
    () =>
      firestore && currentUser?.role === 'admin'
        ? collection(firestore, 'users')
        : null,
    [firestore, currentUser]
  );
  const { data: users, isLoading: dataLoading } = useCollection<User>(usersQuery);

  if (userLoading) {
    return (
      <>
        <PageHeader
          title="Manage Users"
          description="Verifying permissions..."
        />
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Loading...
          </CardContent>
        </Card>
      </>
    );
  }

  if (currentUser?.role !== 'admin') {
    return (
      <PageHeader
        title="Unauthorized"
        description="You do not have permission to view this page."
      />
    );
  }

  return (
    <>
      <PageHeader
        title="Manage Users"
        description={`A list of all users on the platform (${
          users?.length || 0
        } total).`}
      />
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">All Users</CardTitle>
          <CardDescription>
            View, manage, and edit user roles and statuses.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dataLoading && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <Skeleton className="h-4 w-1/4 mx-auto" />
                  </TableCell>
                </TableRow>
              )}
              {!dataLoading &&
                users?.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage
                            src={user.avatarUrl}
                            alt={user.name}
                          />
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="font-medium">
                          <div>{user.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={user.role === 'admin' ? 'default' : 'secondary'}
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>Level {user.level}</TableCell>
                    <TableCell>${user.walletBalance.toFixed(2)}</TableCell>
                    <TableCell>
                      {toDate(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onSelect={() => setSelectedUser(user)}>
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>Edit Role</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            Suspend User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <UserDetailsDialog
        user={selectedUser}
        isOpen={!!selectedUser}
        onOpenChange={(open) => !open && setSelectedUser(null)}
      />
    </>
  );
}
