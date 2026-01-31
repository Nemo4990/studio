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
import { userTasks } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Check, Lock, Sparkles } from 'lucide-react';
import { useUser } from '@/firebase';
import { useFirestore } from '@/firebase/provider';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';

export default function TasksPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleSubmit = (taskId: string, taskTitle: string, reward: number) => {
    if (!user || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'You must be logged in to submit a task.',
      });
      return;
    }

    // Note: The admin page expects a denormalized structure.
    // We are including user and task details directly in the submission document.
    const submissionData = {
      userId: user.id,
      taskId,
      submittedAt: serverTimestamp(),
      status: 'pending',
      taskTitle,
      reward,
      user: {
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
      },
      proof: 'https://example.com/placeholder-proof.pdf', // Placeholder for now
    };

    const submissionsRef = collection(firestore, `users/${user.id}/submissions`);

    addDoc(submissionsRef, submissionData)
      .then(() => {
        toast({
          title: 'Task Submitted!',
          description: `Your submission for "${taskTitle}" is pending review.`,
        });
      })
      .catch((serverError) => {
        // Construct a detailed error for better debugging, especially for security rule issues.
        const permissionError = new FirestorePermissionError({
          path: submissionsRef.path,
          operation: 'create',
          requestResourceData: submissionData,
        });

        // Emit the detailed error for the global error listener to catch and display.
        errorEmitter.emit('permission-error', permissionError);

        // Show a generic error toast to the user.
        toast({
          variant: 'destructive',
          title: 'Submission Failed',
          description: 'There was a problem submitting your task. Please try again.',
        });
      });
  };

  return (
    <>
      <PageHeader
        title="Tasks"
        description="Complete tasks to earn crypto rewards and level up."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {userTasks.map((task) => (
          <Card
            key={task.id}
            className={cn(
              'flex flex-col',
              task.status === 'locked' && 'bg-muted/50 border-dashed',
              task.status === 'completed' && 'bg-primary/5'
            )}
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="font-headline">{task.title}</span>
                {task.status === 'available' && (
                  <Sparkles className="size-5 text-accent" />
                )}
                {task.status === 'locked' && (
                  <Lock className="size-5 text-muted-foreground" />
                )}
                {task.status === 'completed' && (
                  <Check className="size-5 text-green-500" />
                )}
              </CardTitle>
              <CardDescription>
                {task.status === 'locked'
                  ? `Requires Level ${task.minLevel}`
                  : `$${task.reward} Reward`}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-muted-foreground">
                {task.description}
              </p>
            </CardContent>
            <CardFooter>
              {task.status === 'available' && (
                <Button
                  className="w-full"
                  onClick={() => handleSubmit(task.id, task.title, task.reward)}
                >
                  Submit Task
                </Button>
              )}
              {task.status === 'locked' && (
                <Button className="w-full" disabled>
                  Locked
                </Button>
              )}
              {task.status === 'completed' && (
                <Button className="w-full" variant="outline" disabled>
                  Completed
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  );
}
