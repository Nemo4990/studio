'use client';

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
import { useToast } from '@/hooks/use-toast';
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FirestorePermissionError, errorEmitter } from '@/firebase';

export function SignupForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const auth = getAuth();
  const firestore = getFirestore();

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    createUserWithEmailAndPassword(auth, email, password)
      .then(userCredential => {
        const user = userCredential.user;
        
        sendEmailVerification(user).then(() => {
          toast({
            title: 'Verification email sent',
            description: 'Please check your email to verify your account.',
          });
        });

        const userProfileData = {
            id: user.uid,
            name,
            email,
            emailVerified: user.emailVerified,
            role: email === 'admin@taskverse.io' ? 'admin' : 'user',
            level: 0,
            walletBalance: 0,
            createdAt: serverTimestamp(),
            avatarUrl: `https://picsum.photos/seed/${user.uid}/40/40`,
            phoneNumber: '',
            country: '',
            state: '',
            taskAttempts: {},
        };
        const userDocRef = doc(firestore, 'users', user.uid);

        // Return the promise from setDoc to chain it
        return setDoc(userDocRef, userProfileData)
          .then(() => {
            toast({
              title: 'Account Created',
              description: "Welcome to TaskVerse!",
            });
            router.push('/dashboard');
          })
          .catch(serverError => {
            // This catches Firestore errors
            const permissionError = new FirestorePermissionError({
              path: userDocRef.path,
              operation: 'create',
              requestResourceData: userProfileData,
            });
            errorEmitter.emit('permission-error', permissionError);
            toast({
              variant: 'destructive',
              title: 'Signup Failed',
              description: 'Could not create your user profile. Please check permissions.',
            });
          });
      })
      .catch(error => {
        // This catches Authentication errors
        toast({
          variant: 'destructive',
          title: 'Signup Failed',
          description: error.message,
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <Card className="w-full max-w-sm">
      <form onSubmit={handleSignup}>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Sign Up</CardTitle>
          <CardDescription>
            Create your account to start earning crypto rewards.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="John Doe" required value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="m@example.com" required value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>
          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="underline">
              Login
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
