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
import { cn } from '@/lib/utils';
import { Check, Lock, Sparkles, RefreshCw } from 'lucide-react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, setDoc, serverTimestamp, updateDoc, Timestamp, query, where, runTransaction } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';
import React, { useMemo, useState } from 'react';
import { QuizDialog } from '@/components/dashboard/quiz-dialog';
import type { Task, TaskSubmission } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { PurchaseTrialsDialog } from '@/components/dashboard/purchase-trials-dialog';
import { Skeleton } from '@/components/ui/skeleton';

const GAME_TASK_IDS = ['11', '12', '13'];

export default function TasksPage() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();

  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [purchaseTask, setPurchaseTask] = useState<Task | null>(null);

  const tasksQuery = useMemoFirebase(
    () => firestore ? collection(firestore, 'tasks') : null,
    [firestore]
  );
  const { data: tasks, isLoading: tasksLoading } = useCollection<Task>(tasksQuery);

  const submissionsQuery = useMemoFirebase(
    () => (firestore && user) ? query(collection(firestore, 'submissions'), where('userId', '==', user.id)) : null,
    [firestore, user]
  );
  const { data: userSubmissions, isLoading: submissionsLoading } = useCollection<TaskSubmission>(submissionsQuery);

  const submittedTaskIds = useMemo(() => {
    if (!userSubmissions) return new Set();
    return new Set(userSubmissions.filter(s => s.status === 'pending' || s.status === 'approved').map(s => s.taskId));
  }, [userSubmissions]);

  const quizTask = useMemo(() => tasks?.find(t => t.id === '2'), [tasks]);

  const isLoading = userLoading || tasksLoading || submissionsLoading;

  const processedTasks = useMemo(() => {
    if (!tasks || !user) return [];

    return tasks.map(task => {
      const status = submittedTaskIds.has(task.id)
        ? 'completed'
        : user.level < task.requiredLevel
        ? 'locked'
        : 'available';

      const isGameTask = GAME_TASK_IDS.includes(task.id);
      const totalAttempts = user.taskAttempts?.[task.id] ?? 0;
      const trialsLeft = isGameTask ? 3 - totalAttempts : Infinity;

      return { ...task, status, trialsLeft };
    }).sort((a, b) => a.requiredLevel - b.requiredLevel);
  }, [tasks, user, submittedTaskIds]);


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
    const submissionDocRef = doc(submissionsColRef);

    const submissionData = {
      id: submissionDocRef.id,
      userId: user.id,
      taskId,
      submittedAt: serverTimestamp(),
      status: 'pending' as const,
      taskTitle,
      reward,
      user: {
        name: user.name || '',
        email: user.email || '',
        avatarUrl: user.avatarUrl || '',
      },
      proof: `https://example.com/proof-for-${taskId}.pdf`,
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
      });
  };

  const handleDailyCheckin = async (task: Task) => {
    if (!user || !firestore) return;

    const userRef = doc(firestore, 'users', user.id);
    const submissionRef = doc(collection(firestore, 'submissions'));

    try {
      await runTransaction(firestore, async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists()) {
          throw new Error("User document does not exist!");
        }

        const lastCheckin = userDoc.data().lastDailyCheckin as Timestamp;
        const twentyFourHours = 24 * 60 * 60 * 1000;
        if (lastCheckin && new Date().getTime() - lastCheckin.toDate().getTime() < twentyFourHours) {
          throw new Error('Already Claimed');
        }

        const submissionData = {
          id: submissionRef.id,
          userId: user.id,
          taskId: task.id,
          submittedAt: serverTimestamp(),
          status: 'pending' as const,
          taskTitle: task.name,
          reward: task.reward,
          user: {
            name: user.name || '',
            email: user.email || '',
            avatarUrl: user.avatarUrl || '',
          },
          proof: `Daily check-in for ${new Date().toISOString()}`,
        };
        
        transaction.set(submissionRef, submissionData);
        transaction.update(userRef, { lastDailyCheckin: serverTimestamp() });
      });

      toast({
        title: 'Task Submitted!',
        description: `Your submission for "${task.name}" is pending review.`,
      });
    } catch (error: any) {
      if (error.message === 'Already Claimed') {
        toast({
          title: 'Already Claimed',
          description: 'You can claim your daily check-in reward once every 24 hours.',
          variant: 'destructive',
        });
      } else {
        console.error("Daily check-in failed:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not process your daily check-in. Please try again.",
        });
      }
    }
  };

  const handleStartGame = async (taskId: string, path: string) => {
    if (!user || !firestore) return;
    const userRef = doc(firestore, 'users', user.id);
    
    try {
      await runTransaction(firestore, async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists()) {
          throw new Error("User document does not exist!");
        }
        const currentAttempts = userDoc.data().taskAttempts || {};
        const newAttempts = { ...currentAttempts, [taskId]: (currentAttempts[taskId] ?? 0) + 1 };
        transaction.update(userRef, { taskAttempts: newAttempts });
      });
      router.push(path);
    } catch (error) {
      console.error("Failed to update task attempts:", error);
      toast({
        variant: "destructive",
        title: "Error Starting Game",
        description: "Could not update your attempts. Please try again.",
      });
    }
  };

  const getTaskAction = (task: (Task & { status: string; trialsLeft: number })) => {
    switch (task.status) {
      case 'completed': return <Button className="w-full" variant="outline" disabled>Completed</Button>;
      case 'locked': return <Button className="w-full" disabled>Locked</Button>;
      case 'available':
        const isGameTask = GAME_TASK_IDS.includes(task.id);
        if (isGameTask && task.trialsLeft <= 0) {
            return <Button className="w-full" onClick={() => setPurchaseTask(task)}><RefreshCw className="mr-2"/>Purchase More Trials</Button>;
        }

        if (task.id === '1') {
            const twentyFourHours = 24 * 60 * 60 * 1000;
            const lastCheckin = user?.lastDailyCheckin as unknown as Timestamp;
            const isDisabled = lastCheckin && new Date().getTime() - lastCheckin.toDate().getTime() < twentyFourHours;
            return <Button className="w-full" onClick={() => handleDailyCheckin(task)} disabled={isDisabled}>{isDisabled ? 'Claimed Today' : 'Claim Reward'}</Button>;
        }
        if (task.id === '2') {
            return <Button className="w-full" onClick={() => setIsQuizOpen(true)}>Take Quiz</Button>;
        }
        if (task.id === '11') {
            return <Button className="w-full" onClick={() => handleStartGame(task.id, '/dashboard/tasks/speedmath')}>Start Challenge</Button>;
        }
        if (task.id === '12') {
            return <Button className="w-full" onClick={() => handleStartGame(task.id, '/dashboard/tasks/memory-pattern')}>Start Challenge</Button>;
        }
        if (task.id === '13') {
            return <Button className="w-full" onClick={() => handleStartGame(task.id, '/dashboard/tasks/logic-puzzle')}>Start Challenge</Button>;
        }
        return <Button className="w-full" onClick={() => handleSubmit(task.id, task.name, task.reward)}>Submit Task</Button>;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <>
        <PageHeader title="Tasks" description="Complete tasks to earn crypto rewards and level up." />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-full" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </>
    )
  }

  return (
    <>
      <PageHeader title="Tasks" description="Complete tasks to earn crypto rewards and level up." />

      {quizTask && <QuizDialog 
        isOpen={isQuizOpen} 
        onClose={() => setIsQuizOpen(false)} 
        onSubmitSuccess={() => {
            handleSubmit(quizTask.id, quizTask.name, quizTask.reward);
        }}
      />}
      
      {purchaseTask && user && (
        <PurchaseTrialsDialog
            isOpen={!!purchaseTask}
            onClose={() => setPurchaseTask(null)}
            task={purchaseTask}
            user={user}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {processedTasks.map((task) => (
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
                <span className="font-headline">{task.name}</span>
                {task.status === 'available' && <Sparkles className="size-5 text-accent" />}
                {task.status === 'locked' && <Lock className="size-5 text-muted-foreground" />}
                {task.status === 'completed' && <Check className="size-5 text-green-500" />}
              </CardTitle>
              <CardDescription>
                {task.status === 'locked'
                  ? `Requires Level ${task.requiredLevel}`
                  : `${task.reward.toLocaleString()} Coins Reward`}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-muted-foreground">
                {task.description}
              </p>
               {GAME_TASK_IDS.includes(task.id) && task.status === 'available' && (
                <p className="text-xs text-muted-foreground mt-2">
                  Trials left: {task.trialsLeft < 0 ? 0 : task.trialsLeft}
                </p>
              )}
            </CardContent>
            <CardFooter>
                {getTaskAction(task)}
            </CardFooter>
          </Card>
        ))}
        {processedTasks.length === 0 && !isLoading && (
            <div className="text-center text-muted-foreground md:col-span-2 lg:col-span-3 py-10">
                No tasks available at the moment. Check back later!
            </div>
        )}
      </div>
    </>
  );
}
