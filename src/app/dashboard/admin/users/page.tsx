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
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import type { User } from '@/lib/types';
import { collection, Timestamp } from 'firebase/firestore';
import { MoreHorizontal, Coins } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

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
  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex-row items-center gap-4">
          <Avatar className="h-14 w-14">
            <AvatarImage src={user.avatarUrl} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <DialogTitle className="font-headline text-2xl">{user.name}</DialogTitle>
            <DialogDescription className="flex items-center gap-2">
              <span>{user.email}</span>
              {user.emailVerified ? (
                <Badge variant="default" className="bg-green-500/80">
                  Verified
                </Badge>
              ) : (
                <Badge variant="destructive">Unverified</Badge>
              )}
            </DialogDescription>
          </div>
        </DialogHeader>
        <div className="py-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Level</p>
                    <p className="font-semibold">Level {user.level}</p>
                </div>
                 <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Role</p>
                    <p className="font-semibold capitalize">{user.role}</p>
                </div>
            </div>
             <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Wallet Balance</p>
                <p className="font-semibold flex items-center gap-2">
                  <Coins className="size-4 text-amber-500" /> 
                  {user.walletBalance.toLocaleString()} Coins
                </p>
            </div>
             <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Joined</p>
                <p className="font-semibold">{toDate(user.createdAt).toLocaleDateString()}</p>
            </div>
             <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Contact</p>
                <p className="font-semibold">{user.phoneNumber || 'Not provided'}</p>
            </div>
             <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Location</p>
                <p className="font-semibold">{user.state && user.country ? `${user.state}, ${user.country}` : user.country || 'Not provided'}</p>
            </div>
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
