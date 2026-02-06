'use client';

import PageHeader from '@/components/dashboard/page-header';
import { Button, buttonVariants } from '@/components/ui/button';
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
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import { MoreHorizontal, PlusCircle, Coins, Trash2, HelpCircle } from 'lucide-react';
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
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


const taskSchema = z.object({
  name: z.string().min(3, 'Task name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  reward: z.coerce.number().min(0, 'Reward must be a positive number'),
  requiredLevel: z.coerce.number().min(0, 'Level must be at least 0'),
  icon: z.string().min(1, 'Icon image is required'),
});

type TaskFormValues = z.infer<typeof taskSchema>;

export default function AdminTasksPage() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deleteAlert, setDeleteAlert] = useState<{ open: boolean; task: Task | 'all' | null }>({ open: false, task: null });
  const [iconPreview, setIconPreview] = useState<string | null>(null);


  const tasksQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'tasks') : null),
    [firestore]
  );
  const { data: tasks, isLoading: tasksLoading } = useCollection<Task>(tasksQuery);

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      name: '',
      description: '',
      reward: 0,
      requiredLevel: 0,
      icon: '',
    },
  });

  const pageIsLoading = userLoading || tasksLoading;

  const handleOpenForm = (task: Task | null = null) => {
    setEditingTask(task);
    if (task) {
      form.reset({
        name: task.name,
        description: task.description,
        reward: task.reward,
        requiredLevel: task.requiredLevel,
        icon: task.icon,
      });
      setIconPreview(task.icon);
    } else {
      form.reset({ name: '', description: '', reward: 0, requiredLevel: 0, icon: '' });
      setIconPreview(null);
    }
    setIsFormOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!deleteAlert.task) return;

    if (deleteAlert.task === 'all') {
      handleDeleteAllTasks();
    } else {
      handleDeleteTask(deleteAlert.task);
    }
    setDeleteAlert({ open: false, task: null });
  }

  const handleDeleteTask = async (task: Task) => {
    if (!firestore) return;
    
    toast({ title: `Deleting task "${task.name}"...` });
    const taskDocRef = doc(firestore, 'tasks', task.id);

    try {
        await deleteDoc(taskDocRef);
        toast({ title: 'Task deleted successfully' });
    } catch (error: any) {
        console.error('Delete Failed:', error);
        const permissionError = new FirestorePermissionError({
            path: taskDocRef.path,
            operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
        toast({
            variant: 'destructive',
            title: 'Delete Failed',
            description: 'You do not have permission to delete this task.',
        });
    }
  };

  const handleDeleteAllTasks = async () => {
    if (!firestore || !tasksQuery) return;
    toast({ title: 'Deleting all tasks...' });

    try {
      const allTasksSnapshot = await getDocs(tasksQuery);
      if (allTasksSnapshot.empty) {
          toast({ title: 'No tasks to delete.' });
          return;
      }
      
      const batch = writeBatch(firestore);
      allTasksSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();

      toast({ title: 'All tasks deleted successfully!' });
    } catch (error: any) {
        console.error("Delete All Failed:", error);
        const permissionError = new FirestorePermissionError({
            path: 'tasks',
            operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
        toast({
            variant: 'destructive',
            title: 'Deletion Failed',
            description: 'You do not have permission to delete all tasks.',
        });
    }
  };


  const onSubmit = async (values: TaskFormValues) => {
    if (!firestore || !user || user.role !== 'admin') {
      toast({ variant: 'destructive', title: 'Permission Denied', description: 'You must be an admin to perform this action.' });
      return;
    }
    
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
      setIsFormOpen(false);
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
          description: `You do not have permission to ${operation} tasks. Check security rules.`,
      });
    }
  };

  const initialTasksToSeed = [
    { id: '1', name: 'Daily Check-in', description: 'Claim your daily bonus just for logging in. Consistency is key!', reward: 200, requiredLevel: 0, icon: 'https://placehold.co/40x40/transparent/FFFFFF/png?text=%F0%9F%97%93%EF%B8%8F' },
    { id: '2', name: 'Crypto Beginner\'s Quiz', description: 'Test your knowledge on basic crypto concepts. Pass the quiz to earn a reward and learn something new!', reward: 1000, requiredLevel: 0, icon: 'https://placehold.co/40x40/transparent/FFFFFF/png?text=%F0%9F%92%A1' },
    { id: '11', name: 'Speedmath Challenge', description: 'Answer as many questions as you can. Get over 80% to win the reward!', reward: 500, requiredLevel: 0, icon: 'https://placehold.co/40x40/transparent/FFFFFF/png?text=%F0%9F%A7%AE' },
    { id: '12', name: 'Memory Pattern Recall', description: 'Memorize and replicate the sequence of patterns. Reach Level 4 to win!', reward: 500, requiredLevel: 0, icon: 'https://placehold.co/40x40/transparent/FFFFFF/png?text=%F0%9F%A7%A0' },
    { id: '13', name: 'Logic Puzzle Solving', description: 'Solve the riddle to prove your wits and earn the reward!', reward: 800, requiredLevel: 0, icon: 'https://placehold.co/40x40/transparent/FFFFFF/png?text=%F0%9F%A7%A9' },
    { id: 'nl-1', name: 'Nebula Ledger: Low Risk', description: 'Decrypt a standard data node. High success rate, modest rewards.', reward: 50, requiredLevel: 0, icon: 'https://placehold.co/40x40/transparent/FFFFFF/png?text=%F0%9F%9B%A1%EF%B8%8F' },
    { id: 'nl-2', name: 'Nebula Ledger: Medium Risk', description: 'Tackle an encrypted cache. Good chance of success with better rewards.', reward: 150, requiredLevel: 0, icon: 'https://placehold.co/40x40/transparent/FFFFFF/png?text=%F0%9F%9B%A1%EF%B8%8F' },
    { id: 'nl-3', name: 'Nebula Ledger: High Risk', description: 'Attempt to breach a quantum ledger. Low success rate, massive rewards.', reward: 400, requiredLevel: 0, icon: 'https://placehold.co/40x40/transparent/FFFFFF/png?text=%F0%9F%9B%A1%EF%B8%8F' },
    { id: '3', name: 'Meme Magic Contest', description: 'Create and submit a viral meme about TaskVerse. The best one gets a huge bonus prize!', reward: 2500, requiredLevel: 2, icon: 'https://placehold.co/40x40/transparent/FFFFFF/png?text=%F0%9F%96%BC%EF%B8%8F' },
    { id: '4', name: 'Feature Feedback', description: 'Provide constructive feedback on our new wallet feature. Help us build a better app for everyone.', reward: 1500, requiredLevel: 3, icon: 'https://placehold.co/40x40/transparent/FFFFFF/png?text=%F0%9F%92%AC' },
  ];

  const seedDatabase = async () => {
    if (!firestore || !tasksQuery) return;
    toast({ title: 'Seeding tasks...' });
    try {
        const existingTasksSnapshot = await getDocs(tasksQuery);
        if (!existingTasksSnapshot.empty) {
            toast({ variant: 'destructive', title: 'Seeding Aborted', description: 'Tasks collection is not empty. Please clear it before seeding.' });
            return;
        }

        const batch = writeBatch(firestore);
        initialTasksToSeed.forEach((task) => {
          const docRef = doc(firestore, 'tasks', task.id);
          batch.set(docRef, task);
        });
        await batch.commit();

        toast({ title: 'Tasks seeded successfully!' });
    } catch(error: any) {
        console.error("Seeding failed:", error);
        const permissionError = new FirestorePermissionError({
            path: 'tasks',
            operation: 'create',
        });
        errorEmitter.emit('permission-error', permissionError);
        toast({
            variant: 'destructive',
            title: 'Seeding Failed',
            description: 'You do not have permission to create tasks.',
        });
    }
  };
  
  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        form.setValue('icon', dataUri, { shouldValidate: true });
        setIconPreview(dataUri);
      };
      reader.readAsDataURL(file);
    }
  };

  if (userLoading) {
    return <PageHeader title="Manage Tasks" description="Verifying permissions..." />;
  }
  
  if (user?.role !== 'admin') {
    return <PageHeader title="Unauthorized" description="You do not have permission to view this page." />;
  }

  return (
    <>
      <PageHeader
        title="Manage Tasks"
        description="Create, edit, and manage tasks available to users."
      >
        <Button onClick={() => handleOpenForm()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New Task
        </Button>
         <Button variant="destructive-outline" onClick={() => setDeleteAlert({ open: true, task: 'all' })} disabled={!tasks || tasks.length === 0}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete All Tasks
        </Button>
      </PageHeader>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">All Tasks</CardTitle>
          <CardDescription>
            A list of all tasks currently in the system. Changes here are reflected live for all users.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pageIsLoading ? (
             <Skeleton className="h-48 w-full" />
          ) : tasks && tasks.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Reward</TableHead>
                  <TableHead>Min. Level</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="rounded-md">
                            <AvatarImage src={task.icon} alt={task.name} className="object-cover" />
                            <AvatarFallback className="bg-secondary rounded-md">
                                <HelpCircle className="size-5 text-muted-foreground" />
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="font-medium">{task.name}</div>
                            <div className="line-clamp-1 text-sm text-muted-foreground">
                                {task.description}
                            </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Coins className="size-4 text-amber-500" />
                        {task.reward.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>Level {task.requiredLevel}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenForm(task)}>
                            Edit Task
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onSelect={(e) => e.preventDefault()}
                            onClick={() => setDeleteAlert({ open: true, task: task })}
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

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
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
              <FormItem>
                <FormLabel>Task Icon</FormLabel>
                <FormControl>
                    <Input type="file" accept="image/*" onChange={handleIconUpload} />
                </FormControl>
                <FormMessage>{form.formState.errors.icon?.message}</FormMessage>
                {iconPreview && (
                    <img src={iconPreview} alt="Icon preview" className="h-12 w-12 object-cover rounded-md mt-2" />
                )}
             </FormItem>
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
      
       <AlertDialog open={deleteAlert.open} onOpenChange={(open) => setDeleteAlert({ open, task: null })}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        {deleteAlert.task === 'all'
                            ? "This action cannot be undone. This will permanently delete all tasks from the database."
                            : `This will permanently delete the task: "${(deleteAlert.task as Task)?.name}".`}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleConfirmDelete} className={cn(buttonVariants({ variant: "destructive" }))}>
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </>
  );
}
