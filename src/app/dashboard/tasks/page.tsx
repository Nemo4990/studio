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
import { collection, doc, setDoc, serverTimestamp, updateDoc, Timestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';
import React from 'react';
import { QuizDialog } from '@/components/dashboard/quiz-dialog';
import type { Task } from '@/lib/types';
import Link from 'next/link';

export default function TasksPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isQuizOpen, setIsQuizOpen] = React.useState(false);

  const handleSubmit = (taskId: string, taskTitle: string, reward: number) => {
    if (!user || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'You must be logged in to submit a task.',
      });
      return;
    }

    const submissionsColRef = collection(firestore, 'submissions');
    const submissionDocRef = doc(submissionsColRef); // Create a reference with a new ID

    const submissionData = {
      id: submissionDocRef.id,
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
      proof: 'https://example.com/proof-of-quiz.pdf', // Placeholder for now
    };

    setDoc(submissionDocRef, submissionData)
      .then(() => {
        toast({
          title: 'Task Submitted!',
          description: `Your submission for "${taskTitle}" is pending review.`,
        });
      })
      .catch((serverError) => {
        const permissionError = new FirestorePermissionError({
          path: submissionDocRef.path,
          operation: 'create',
          requestResourceData: submissionData,
        });
        errorEmitter.emit('permission-error', permissionError);
        toast({
          variant: 'destructive',
          title: 'Submission Failed',
          description: 'There was a problem submitting your task. Please try again.',
        });
      });
  };

  const handleDailyCheckin = (task: Task) => {
    if (!user || !firestore) return;

    const twentyFourHours = 24 * 60 * 60 * 1000;
    const lastCheckin = user.lastDailyCheckin as unknown as Timestamp;
    if (lastCheckin && new Date().getTime() - lastCheckin.toDate().getTime() < twentyFourHours) {
        toast({
            title: 'Already Claimed',
            description: 'You can claim your daily check-in reward once every 24 hours.',
            variant: 'destructive'
        });
        return;
    }

    handleSubmit(task.id, task.title, task.reward);

    const userRef = doc(firestore, 'users', user.id);
    updateDoc(userRef, { lastDailyCheckin: serverTimestamp() }).catch(err => {
      // This is a best-effort update. If it fails, the user can just submit again.
      // The main submission is what matters for the reward.
      console.error("Failed to update lastDailyCheckin timestamp:", err);
    });
  }

  const getTaskAction = (task: Task) => {
    switch (task.status) {
      case 'completed':
        return (
          <Button className="w-full" variant="outline" disabled>
            Completed
          </Button>
        );
      case 'locked':
        return (
          <Button className="w-full" disabled>
            Locked
          </Button>
        );
      case 'available':
        if (task.id === '1') { // Daily Check-in
            const twentyFourHours = 24 * 60 * 60 * 1000;
            const lastCheckin = user?.lastDailyCheckin as unknown as Timestamp;
            const isDisabled = lastCheckin && new Date().getTime() - lastCheckin.toDate().getTime() < twentyFourHours;
            
            return (
                <Button className="w-full" onClick={() => handleDailyCheckin(task)} disabled={isDisabled}>
                {isDisabled ? 'Claimed Today' : 'Claim Reward'}
                </Button>
            );
        }
        if (task.id === '2') { // Crypto Beginner's Quiz
            return (
                <Button className="w-full" onClick={() => setIsQuizOpen(true)}>
                    Take Quiz
                </Button>
            );
        }
        if (task.id === '11') { // Speedmath Challenge
            return (
                <Button className="w-full" asChild>
                    <Link href="/dashboard/tasks/speedmath">Start Challenge</Link>
                </Button>
            );
        }
        if (task.id === '12') { // Memory Pattern Recall
            return (
                <Button className="w-full" asChild>
                    <Link href="/dashboard/tasks/memory-pattern">Start Challenge</Link>
                </Button>
            );
        }
        return (
          <Button
            className="w-full"
            onClick={() => handleSubmit(task.id, task.title, task.reward)}
          >
            Submit Task
          </Button>
        );
      default:
        return null;
    }
  };
  
  const quizTask = userTasks.find(t => t.id === '2');

  return (
    <>
      <PageHeader
        title="Tasks"
        description="Complete tasks to earn crypto rewards and level up."
      />

      {quizTask && <QuizDialog 
        isOpen={isQuizOpen} 
        onClose={() => setIsQuizOpen(false)} 
        onSubmitSuccess={() => {
            handleSubmit(quizTask.id, quizTask.title, quizTask.reward);
        }}
      />}

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
                {getTaskAction(task)}
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  );
}
