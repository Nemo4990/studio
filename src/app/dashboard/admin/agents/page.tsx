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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  useCollection,
  useFirestore,
  useMemoFirebase,
  useUser,
  useDoc,
  errorEmitter,
  FirestorePermissionError,
} from '@/firebase';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';
import { MoreHorizontal, PlusCircle, Copy, Trash2 } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import type { Agent, PlatformSettings } from '@/lib/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
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

// Zod Schema for Crypto Settings
const settingsSchema = z.object({
  cryptoDepositAddress: z.string().min(26, 'Please enter a valid crypto address'),
});
type SettingsFormValues = z.infer<typeof settingsSchema>;

// Component to manage the global crypto wallet
function CryptoWalletManager() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const settingsDocRef = useMemoFirebase(
    () => (firestore && user ? doc(firestore, 'settings', 'platform') : null),
    [firestore, user]
  );
  const { data: settings, isLoading: settingsLoading } = useDoc<PlatformSettings>(settingsDocRef);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      cryptoDepositAddress: '',
    },
  });

  const pageIsLoading = userLoading || settingsLoading;

  useEffect(() => {
    if (settings) {
      form.reset({ cryptoDepositAddress: settings.cryptoDepositAddress });
    }
  }, [settings, form]);
  
  const onSubmit = (values: SettingsFormValues) => {
    if (!settingsDocRef) return;

    toast({ title: 'Saving settings...' });
    setDoc(settingsDocRef, { id: 'platform', ...values }, { merge: true })
      .then(() => {
        toast({ title: 'Crypto wallet saved successfully!' });
      })
      .catch(() => {
        const permissionError = new FirestorePermissionError({
          path: settingsDocRef.path,
          operation: 'write',
          requestResourceData: values,
        });
        errorEmitter.emit('permission-error', permissionError);
        toast({
          variant: 'destructive',
          title: 'Save Failed',
          description: 'You do not have permission to modify these settings.',
        });
      });
  };
  
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied to clipboard!' });
  };

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle className="font-headline">Crypto Deposit Wallet</CardTitle>
            <CardDescription>
              Set the primary crypto wallet address where all users will send their deposits.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {pageIsLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-10 w-full" />
              </div>
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
              {form.formState.isSubmitting ? 'Saving...' : 'Save Crypto Wallet'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}


// Zod Schema for Local Agents
const agentSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  country: z.string().min(2, 'Country is required'),
  bankName: z.string().min(2, 'Bank name is required'),
  accountNumber: z.string().min(10, 'Account number must be at least 10 digits'),
});
type AgentFormValues = z.infer<typeof agentSchema>;

// Main Page Component
export default function AdminAgentsPage() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);

  const agentsQuery = useMemoFirebase(
    () => (firestore && user?.role === 'admin' ? collection(firestore, 'agents') : null),
    [firestore, user]
  );
  const { data: agents, isLoading: agentsLoading } = useCollection<Agent>(agentsQuery);

  const form = useForm<AgentFormValues>({
    resolver: zodResolver(agentSchema),
    defaultValues: { name: '', country: '', bankName: '', accountNumber: '' },
  });

  const isLoading = userLoading || agentsLoading;

  const handleOpenDialog = (agent: Agent | null = null) => {
    setEditingAgent(agent);
    if (agent) {
      form.reset(agent);
    } else {
      form.reset({ name: '', country: '', bankName: '', accountNumber: '' });
    }
    setIsDialogOpen(true);
  };

  const handleDelete = async (agentId: string) => {
    if (!firestore || !window.confirm("Are you sure you want to delete this agent?")) return;
    await deleteDoc(doc(firestore, 'agents', agentId));
    toast({ title: 'Agent deleted' });
  };

  const onSubmit = async (values: AgentFormValues) => {
    if (!firestore) return;

    const action = editingAgent ? 'update' : 'create';
    toast({ title: editingAgent ? 'Updating agent...' : 'Creating agent...' });

    try {
        if (editingAgent) {
            await updateDoc(doc(firestore, 'agents', editingAgent.id), values);
            toast({ title: 'Agent updated successfully' });
        } else {
            const agentRef = doc(collection(firestore, 'agents'));
            await setDoc(agentRef, { id: agentRef.id, ...values });
            toast({ title: 'Agent created successfully' });
        }
        setIsDialogOpen(false);
        setEditingAgent(null);
    } catch (error: any) {
        const path = editingAgent ? `agents/${editingAgent.id}` : 'agents';
        const permissionError = new FirestorePermissionError({
            path,
            operation: action,
            requestResourceData: values,
        });
        errorEmitter.emit('permission-error', permissionError);
        toast({ variant: 'destructive', title: 'Action Failed', description: `Could not ${action} agent.` });
    }
  };

  if (userLoading) {
    return <PageHeader title="Agents & Wallets" description="Loading..." />;
  }

  if (user?.role !== 'admin') {
    return <PageHeader title="Unauthorized" description="You can't view this page." />;
  }
  
  const initialAgentsToSeed = [
    { id: 'agent1', name: 'John Doe', country: 'Nigeria', bankName: 'GTBank', accountNumber: '0123456789' },
    { id: 'agent2', name: 'Jane Smith', country: 'Nigeria', bankName: 'First Bank', accountNumber: '9876543210' },
    { id: 'agent3', name: 'Mike Ross', country: 'USA', bankName: 'Bank of America', accountNumber: '1122334455' },
    { id: 'agent4', name: 'Rachel Zane', country: 'USA', bankName: 'Chase', accountNumber: '5544332211' },
    { id: 'agent5', name: 'Abebe Bikila', country: 'Ethiopia', bankName: 'Commercial Bank of Ethiopia', accountNumber: '1000123456789' },
  ];

  const seedDatabase = async () => {
    if (!firestore) return;
    toast({ title: 'Seeding database...' });
    const promises = initialAgentsToSeed.map(agent => {
        const docRef = doc(firestore, 'agents', agent.id);
        return setDoc(docRef, agent, { merge: true });
    });
    await Promise.all(promises);
    toast({ title: 'Database seeded successfully!' });
  }

  return (
    <>
      <PageHeader
        title="Agents & Wallets"
        description="Manage local currency agents and the global crypto deposit wallet."
      >
        <Button onClick={() => handleOpenDialog()}>
          <PlusCircle className="mr-2" />
          Create Local Agent
        </Button>
      </PageHeader>
      
      <div className="space-y-8">
        <CryptoWalletManager />

        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Local Currency Agents</CardTitle>
            <CardDescription>
              A list of all local payment agents in the system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-40 w-full" /> : 
             agents && agents.length === 0 ? (
              <div className="text-center py-10 border-2 border-dashed rounded-lg">
                  <p className="text-muted-foreground">No local agents found.</p>
                  <Button variant="link" onClick={seedDatabase}>Click here to add initial agents</Button>
              </div>
            ) : (
              <Table>
                  <TableHeader>
                  <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead>Bank</TableHead>
                      <TableHead>Account Number</TableHead>
                      <TableHead><span className="sr-only">Actions</span></TableHead>
                  </TableRow>
                  </TableHeader>
                  <TableBody>
                  {agents?.map((agent) => (
                      <TableRow key={agent.id}>
                      <TableCell>{agent.name}</TableCell>
                      <TableCell>{agent.country}</TableCell>
                      <TableCell>{agent.bankName}</TableCell>
                      <TableCell>{agent.accountNumber}</TableCell>
                      <TableCell>
                          <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleOpenDialog(agent)}>Edit</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(agent.id)}>Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                          </DropdownMenu>
                      </TableCell>
                      </TableRow>
                  ))}
                  </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingAgent ? 'Edit Agent' : 'Create New Agent'}</DialogTitle>
            <DialogDescription>Fill in the details for the local payment agent.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Agent Name</FormLabel>
                  <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="country" render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl><Input placeholder="e.g., Nigeria" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="bankName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Bank Name</FormLabel>
                  <FormControl><Input placeholder="e.g., GTBank" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="accountNumber" render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Number</FormLabel>
                  <FormControl><Input placeholder="0123456789" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <DialogFooter>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? 'Saving...' : 'Save Agent'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
