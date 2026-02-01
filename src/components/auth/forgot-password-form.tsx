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
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import Link from 'next/link';
import { useState } from 'react';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();
  const auth = getAuth();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      // For security, show the same message whether the email exists or not
      toast({
        title: 'Password Reset Email Sent',
        description: `If an account exists for ${email}, you will receive an email with instructions.`,
      });
      setSubmitted(true);
    } catch (error: any) {
      // Do not reveal if the email exists or not. Log for debugging but show generic message.
      console.error("Password reset error:", error); 
      toast({
        title: 'Password Reset Email Sent',
        description: `If an account exists for ${email}, you will receive an email with instructions.`,
      });
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
        <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Check your email</CardTitle>
              <CardDescription>
                A password reset link has been sent to your email address. Please follow the instructions in the email to reset your password.
              </CardDescription>
            </CardHeader>
            <CardFooter>
                 <Button className="w-full" asChild>
                    <Link href="/login">Back to Login</Link>
                 </Button>
            </CardFooter>
        </Card>
    )
  }

  return (
    <Card className="w-full max-w-sm">
      <form onSubmit={handleReset}>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Forgot Password</CardTitle>
          <CardDescription>
            Enter your email and we&apos;ll send you a link to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </Button>
          <div className="mt-4 text-center text-sm">
            Remember your password?{' '}
            <Link href="/login" className="underline">
              Login
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
