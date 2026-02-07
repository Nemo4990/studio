'use client';

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
import {
  useDoc,
  useFirestore,
  useMemoFirebase,
  useUser,
  errorEmitter,
  FirestorePermissionError,
} from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import React, { useState, useEffect } from 'react';
import type { PlatformSettings } from '@/lib/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Copy } from 'lucide-react';

const settingsSchema = z.object({
  cryptoDepositAddress: z.string().min(26, 'Please enter a valid crypto address'),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export default function AdminPlatformSettingsPage() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const settingsDocRef = useMemoFirebase(
    () => (firestore ? doc(firestore, 'settings', 'platform') : null),
    [firestore]
  );
  const { data: settings, isLoading: settingsLoading } = useDoc<PlatformSettings>(settingsDocRef);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      cryptoDepositAddress: '',
    },
  });

  useEffect(() => {
    if (settings) {
      form.reset({ cryptoDepositAddress: settings.cryptoDepositAddress });
    }
  }, [settings, form]);
  
  const pageIsLoading = userLoading || settingsLoading;

  const onSubmit = async (values: SettingsFormValues) => {
    if (!settingsDocRef) return;

    toast({ title: 'Saving settings...' });
    try {
      await setDoc(settingsDocRef, { id: 'platform', ...values }, { merge: true });
      toast({ title: 'Platform settings saved successfully!' });
    } catch (error: any) {
      const permissionError = new FirestorePermissionError({
        path: settingsDocRef.path,
        operation: 'write',
        requestResourceData: values,
      });
      errorEmitter.emit('permission-error', permissionError);
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: 'You do not have permission to modify platform settings.',
      });
    }
  };
  
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied to clipboard!' });
  };

  if (userLoading) {
    return <PageHeader title="Platform Settings" description="Verifying permissions..." />;
  }
  
  if (user?.role !== 'admin') {
    return <PageHeader title="Unauthorized" description="You do not have permission to view this page." />;
  }

  return (
    <>
      <PageHeader
        title="Platform Settings"
        description="Manage global configuration for the application."
      />
      <Card>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle className="font-headline">Crypto Deposits</CardTitle>
              <CardDescription>
                Set the primary crypto wallet address where all users will send their deposits.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {pageIsLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <>
                <FormField
                  control={form.control}
                  name="cryptoDepositAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>USDT (TRC20) Deposit Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter the wallet address..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 {form.getValues('cryptoDepositAddress') && (
                    <div className="flex flex-col sm:flex-row items-center gap-6 text-center p-4 rounded-lg bg-secondary">
                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${form.getValues('cryptoDepositAddress')}&bgcolor=292d3e&color=ffffff&qzone=1`} alt="QR Code" width="160" height="160" />
                         <div className='flex-1 text-left space-y-4'>
                             <p className="text-sm text-muted-foreground">This address and QR code will be shown to all users on the wallet deposit page.</p>
                             <div className="flex items-center gap-2">
                                <Input readOnly value={form.getValues('cryptoDepositAddress')} className="font-mono bg-background" />
                                <Button variant="ghost" size="icon" type="button" onClick={() => handleCopy(form.getValues('cryptoDepositAddress'))}>
                                    <Copy />
                                </Button>
                            </div>
                         </div>
                    </div>
                )}
                </>
              )}
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={form.formState.isSubmitting || pageIsLoading}>
                {form.formState.isSubmitting ? 'Saving...' : 'Save Settings'}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </>
  );
}
