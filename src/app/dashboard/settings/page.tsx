'use client';

import React, { useState } from 'react';
import PageHeader from '@/components/dashboard/page-header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUser, useAuth, useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { doc, updateDoc } from 'firebase/firestore';
import { sendPasswordResetEmail } from 'firebase/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

export default function SettingsPage() {
  const { user, loading: userLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [country, setCountry] = useState(user?.country || '');
  const [state, setState] = useState(user?.state || '');
  
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  
  // Keep local state in sync with fetched user data
  React.useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhoneNumber(user.phoneNumber || '');
      setCountry(user.country || '');
      setState(user.state || '');
    }
  }, [user]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !firestore) return;
    setIsSavingProfile(true);

    const userDocRef = doc(firestore, 'users', user.id);
    
    try {
      await updateDoc(userDocRef, {
        name,
        phoneNumber,
        country,
        state
      });
      toast({
        title: 'Profile Updated',
        description: 'Your changes have been saved successfully.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: error.message || 'Could not update your profile.',
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email || !auth) return;
    setIsSendingEmail(true);

    try {
      await sendPasswordResetEmail(auth, user.email);
      toast({
        title: 'Password Reset Email Sent',
        description: `An email has been sent to ${user.email} with instructions.`,
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Request Failed',
        description: error.message || 'Could not send the password reset email.',
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  if (userLoading || !user) {
    return (
        <>
            <PageHeader title="Settings" description="Manage your account settings and preferences." />
            <div className="space-y-8">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-4 w-48" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </CardContent>
                    <CardFooter>
                        <Skeleton className="h-10 w-24" />
                    </CardFooter>
                </Card>
            </div>
        </>
    )
  }

  return (
    <>
      <PageHeader
        title="Settings"
        description="Manage your account settings and preferences."
      />
      <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
        {/* Profile Settings Card */}
        <Card>
          <form onSubmit={handleProfileUpdate}>
            <CardHeader>
              <CardTitle className="font-headline">Profile</CardTitle>
              <CardDescription>
                This is how others will see you on the site.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={user.avatarUrl} alt={user.name} />
                  <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="picture">Profile Picture</Label>
                    <Input id="picture" type="file" />
                    <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB. (Feature is simulated)</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={user.email} disabled />
                 <p className="text-xs text-muted-foreground">Your email address cannot be changed.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input id="phoneNumber" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="Your phone number" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input id="country" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="e.g. Nigeria" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="state">State/Province</Label>
                    <Input id="state" value={state} onChange={(e) => setState(e.target.value)} placeholder="e.g. Lagos" />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isSavingProfile}>
                {isSavingProfile ? 'Saving...' : 'Save Profile'}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Security Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Security</CardTitle>
            <CardDescription>
              Manage your account security settings.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className='p-4 border rounded-lg bg-secondary/50'>
              <Label>Password</Label>
              <p className="text-sm text-muted-foreground mb-4">
                To reset your password, click the button below. We will send a
                secure link to your registered email address.
              </p>
              <Button onClick={handlePasswordReset} variant="outline" disabled={isSendingEmail}>
                {isSendingEmail ? 'Sending...' : 'Send Password Reset Email'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
