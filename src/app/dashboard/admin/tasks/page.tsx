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

const taskSchema = z.object({
  name: z.string().min(3, 'Task name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  reward: z.coerce.number().min(0, 'Reward must be a positive number'),
  requiredLevel: z.coerce.number().min(1, 'Level must be at least 1'),
});

type TaskFormValues = z.infer<typeof taskSchema>;

export default function AdminTasksPage() {
    const { user, loading: userLoading } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);

    const tasksQuery = useMemoFirebase(
        () => (firestore && user?.role === 'admin' ? collection(firestore, 'tasks') : null),
        [firestore, user]
    );
    const { data: tasks, isLoading: tasksLoading } = useCollection<Task>(tasksQuery);

    const form = useForm<TaskFormValues>({
        resolver: zodResolver(taskSchema),
        defaultValues: {
            name: '',
            description: '',
            reward: 0,
            requiredLevel: 1,
        },
    });

    const isLoading = userLoading || tasksLoading;

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
            form.reset({
                name: '',
                description: '',
                reward: 0,
                requiredLevel: 1,
            });
        }
        setIsDialogOpen(true);
    };

    const handleDelete = async (taskId: string) => {
        if (!firestore || !window.confirm("Are you sure you want to delete this task?")) return;
        try {
            await deleteDoc(doc(firestore, 'tasks', taskId));
            toast({ title: 'Task deleted successfully' });
        } catch (error: any) {
            toast({ title: 'Error deleting task', description: error.message, variant: 'destructive' });
        }
    };

    const onSubmit = async (values: TaskFormValues) => {
        if (!firestore) return;

        try {
            if (editingTask) {
                const taskRef = doc(firestore, 'tasks', editingTask.id);
                await updateDoc(taskRef, values);
                toast({ title: 'Task updated successfully' });
            } else {
                const taskRef = doc(collection(firestore, 'tasks'));
                await setDoc(taskRef, { id: taskRef.id, ...values });
                toast({ title: 'Task created successfully' });
            }
            setIsDialogOpen(false);
            setEditingTask(null);
        } catch (error: any) {
             toast({ title: 'Error saving task', description: error.message, variant: 'destructive' });
        }
    };

    if (isLoading) {
        return <PageHeader title="Manage Tasks" description="Loading..." />;
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
                <Button onClick={() => handleOpenDialog()}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create New Task
                </Button>
            </PageHeader>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">All Tasks</CardTitle>
                    <CardDescription>A list of all tasks currently in the system.</CardDescription>
                </CardHeader>
                <CardContent>
                    {tasks && tasks.length === 0 && !tasksLoading && (
                        <div className="text-center py-10 border-2 border-dashed rounded-lg">
                            <p className="text-muted-foreground">No tasks found.</p>
                        </div>
                    )}
                    {tasks && tasks.length > 0 && (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Reward</TableHead>
                                    <TableHead>Min. Level</TableHead>
                                    <TableHead><span className="sr-only">Actions</span></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tasks.map(task => (
                                    <TableRow key={task.id}>
                                        <TableCell>
                                            <div className="font-medium">{task.name}</div>
                                            <div className="text-sm text-muted-foreground line-clamp-1">{task.description}</div>
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
                                                    <DropdownMenuItem onClick={() => handleOpenDialog(task)}>Edit Task</DropdownMenuItem>
                                                    <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(task.id)}>Delete Task</DropdownMenuItem>
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
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{editingTask ? 'Edit Task' : 'Create New Task'}</DialogTitle>
                        <DialogDescription>
                            Fill in the details for the task below. Click save when you're done.
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
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
                                            <Textarea placeholder="Describe the task for the user..." {...field} />
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
                                                <Input type="number" placeholder="1" {...field} />
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
