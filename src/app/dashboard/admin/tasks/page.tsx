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
import { MoreHorizontal, PlusCircle, Coins } from 'lucide-react';
import React, { useState } from 'react';
import type { Task } from '@/lib/types';
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
import { Textarea } from '@/components/ui/textarea';
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

const taskSchema = z.object({
  name: z.string().min(3, 'Task name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  reward: z.coerce.number().min(0, 'Reward must be a positive number'),
  requiredLevel: z.coerce.number().min(0, 'Level must be at least 0'),
});

type TaskFormValues = z.infer<typeof taskSchema>;

export default function AdminTasksPage() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const tasksQuery = useMemoFirebase(
    () =>
      firestore && user?.role === 'admin'
        ? collection(firestore, 'tasks')
        : null,
    [firestore, user]
  );
  const { data: tasks, isLoading: tasksLoading } = useCollection<Task>(
    tasksQuery
  );

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      name: '',
      description: '',
      reward: 0,
      requiredLevel: 0,
    },
  });

  const pageIsLoading = userLoading || tasksLoading;

  const handleOpenDialog = (task: Task | null = null) => {
    setEditingTask(task);
    if (task) {
      form.reset({
        name: task.name,
        description: task.description,
        reward: task.reward,
        requiredLevel: task.requiredLevel,
      });
    } else {
      form.reset({ name: '', description: '', reward: 0, requiredLevel: 0 });
    }
    setIsDialogOpen(true);
  };

  const handleDelete = async (taskId: string) => {
    if (!firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'Firestore not available.' });
      return;
    }
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    toast({ title: 'Deleting task...' });
    const taskDocRef = doc(firestore, 'tasks', taskId);

    try {
      await deleteDoc(taskDocRef);
      toast({ title: 'Task deleted successfully' });
    } catch (error: any) {
      console.error('Delete Failed:', error);
      toast({
        variant: 'destructive',
        title: 'Delete Failed',
        description: 'You do not have permission to delete tasks. See console for details.',
      });
      const permissionError = new FirestorePermissionError({
        path: taskDocRef.path,
        operation: 'delete',
      });
      errorEmitter.emit('permission-error', permissionError);
    }
  };

  const onSubmit = async (values: TaskFormValues) => {
    if (!firestore) return;
    
    const operation = editingTask ? 'update' : 'create';
    const toastTitle = editingTask ? 'Updating task...' : 'Creating task...';
    toast({ title: toastTitle });

    try {
      if (editingTask) {
        const taskRef = doc(firestore, 'tasks', editingTask.id);
        await updateDoc(taskRef, values);
        toast({ title: 'Task updated successfully' });
      } else {
        const taskRef = doc(collection(firestore, 'tasks'));
        const data = { id: taskRef.id, ...values };
        await setDoc(taskRef, data);
        toast({ title: 'Task created successfully' });
      }
      setIsDialogOpen(false);
      setEditingTask(null);
    } catch (error: any) {
      console.error(`${operation} Failed:`, error);
      const permissionError = new FirestorePermissionError({
          path: editingTask ? `tasks/${editingTask.id}` : 'tasks',
          operation: operation,
          requestResourceData: values,
      });
      errorEmitter.emit('permission-error', permissionError);
      toast({
          variant: 'destructive',
          title: `${operation === 'update' ? 'Update' : 'Creation'} Failed`,
          description: `You do not have permission to ${operation} tasks.`,
      });
    }
  };

  const initialTasksToSeed = [
    { id: '1', name: 'Daily Check-in', description: 'Claim your daily bonus just for logging in. Consistency is key!', reward: 200, requiredLevel: 0 },
    { id: '2', name: 'Crypto Beginner\'s Quiz', description: 'Test your knowledge on basic crypto concepts. Pass the quiz to earn a reward and learn something new!', reward: 1000, requiredLevel: 0 },
    { id: 'scavenger-1', name: 'Signal Scavenger', description: 'Visit our partners to find the signal. Click all 12 tiles to claim your reward.', reward: 500, requiredLevel: 0 },
    { id: '11', name: 'Speedmath Challenge', description: 'Answer as many questions as you can. Get over 80% to win the reward!', reward: 500, requiredLevel: 0 },
    { id: '12', name: 'Memory Pattern Recall', description: 'Memorize and replicate the sequence of patterns. Reach Level 4 to win!', reward: 500, requiredLevel: 0 },
    { id: '13', name: 'Logic Puzzle Solving', description: 'Solve the riddle to prove your wits and earn the reward!', reward: 800, requiredLevel: 0 },
    { id: '3', name: 'Meme Magic Contest', description: 'Create and submit a viral meme about TaskVerse. The best one gets a huge bonus prize!', reward: 2500, requiredLevel: 2 },
    { id: '4', name: 'Feature Feedback', description: 'Provide constructive feedback on our new wallet feature. Help us build a better app for everyone.', reward: 1500, requiredLevel: 3 },
  ];

  const seedDatabase = async () => {
    if (!firestore) return;
    toast({ title: 'Seeding tasks...' });
    try {
        const promises = initialTasksToSeed.map((task) => {
          const docRef = doc(firestore, 'tasks', task.id);
          return setDoc(docRef, task, { merge: true });
        });
        await Promise.all(promises);
        toast({ title: 'Tasks seeded successfully!' });
    } catch(error: any) {
        console.error("Seeding failed:", error);
        toast({
            variant: 'destructive',
            title: 'Seeding Failed',
            description: 'You do not have permission to create tasks.',
        });
        const permissionError = new FirestorePermissionError({
            path: 'tasks',
            operation: 'create',
        });
        errorEmitter.emit('permission-error', permissionError);
    }
  };

  if (pageIsLoading) {
    return (
        <>
            <PageHeader title="Manage Tasks" description="Loading..." />
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-48" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-24 w-full" />
                </CardContent>
            </Card>
        </>
    );
  }

  if (user?.role !== 'admin') {
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
        title="Manage Tasks"
        description="Create, edit, and manage tasks available to users."
      >
        <Button onClick={() => handleOpenDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New Task
        </Button>
      </PageHeader>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">All Tasks</CardTitle>
          <CardDescription>
            A list of all tasks currently in the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tasks && tasks.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Reward</TableHead>
                  <TableHead>Min. Level</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell>
                      <div className="font-medium">{task.name}</div>
                      <div className="line-clamp-1 text-sm text-muted-foreground">
                        {task.description}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Coins className="size-4 text-amber-500" />
                        {task.reward.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>Level {task.requiredLevel}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenDialog(task)}>
                            Edit Task
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(task.id)}
                          >
                            Delete Task
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center gap-4 rounded-lg border-2 border-dashed py-10 text-center">
              <p className="text-muted-foreground">
                No tasks found in the database.
              </p>
              <Button onClick={seedDatabase}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Seed Initial Tasks
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingTask ? 'Edit Task' : 'Create New Task'}
            </DialogTitle>
            <DialogDescription>
              Fill in the details for the task below. Click save when
              you&apos;re done.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 py-4"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Task Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Daily Check-in" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the task for the user..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="reward"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reward (Coins)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="500" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="requiredLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Required Level</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? 'Saving...' : 'Save Task'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
