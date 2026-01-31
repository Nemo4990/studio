'use client';

import PageHeader from '@/components/dashboard/page-header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
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
} from '@/firebase';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import React, { useState } from 'react';
import type { Agent } from '@/lib/types';
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
import { Label } from '@/components/ui/label';
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

const agentSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  country: z.string().min(2, 'Country is required'),
  bankName: z.string().min(2, 'Bank name is required'),
  accountNumber: z.string().min(10, 'Account number must be at least 10 digits'),
});

type AgentFormValues = z.infer<typeof agentSchema>;

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
    defaultValues: {
      name: '',
      country: '',
      bankName: '',
      accountNumber: '',
    },
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

    if (editingAgent) {
      // Update existing agent
      const agentRef = doc(firestore, 'agents', editingAgent.id);
      await updateDoc(agentRef, values);
      toast({ title: 'Agent updated successfully' });
    } else {
      // Create new agent
      const agentRef = doc(collection(firestore, 'agents'));
      await setDoc(agentRef, { id: agentRef.id, ...values });
      toast({ title: 'Agent created successfully' });
    }

    setIsDialogOpen(false);
    setEditingAgent(null);
  };

  if (isLoading) {
    return <PageHeader title="Manage Agents" description="Loading..." />;
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
        title="Manage Agents"
        description="Add, edit, or remove payment agents."
      >
        <Button onClick={() => handleOpenDialog()}>
          <PlusCircle className="mr-2" />
          Create Agent
        </Button>
      </PageHeader>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">All Agents</CardTitle>
          <CardDescription>
            A list of all payment agents in the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {agents && agents.length === 0 && !agentsLoading && (
            <div className="text-center py-10 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">No agents found.</p>
                <Button variant="link" onClick={seedDatabase}>Click here to add initial agents</Button>
            </div>
          )}
          {agents && agents.length > 0 && (
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Bank</TableHead>
                    <TableHead>Account Number</TableHead>
                    <TableHead>
                    <span className="sr-only">Actions</span>
                    </TableHead>
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
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenDialog(agent)}>
                            Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(agent.id)}
                            >
                            Delete
                            </DropdownMenuItem>
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
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingAgent ? 'Edit Agent' : 'Create New Agent'}
            </DialogTitle>
            <DialogDescription>
              Fill in the details for the payment agent.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Agent Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Nigeria" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bankName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bank Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., GTBank" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="accountNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Number</FormLabel>
                    <FormControl>
                      <Input placeholder="0123456789" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
