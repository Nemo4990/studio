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
import { useUser, useFirestore, useCollection, useMemoFirebase, FirestorePermissionError, errorEmitter } from '@/firebase';
import { collection, doc, serverTimestamp, runTransaction, Timestamp, query, writeBatch } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import React, { useMemo, useState } from 'react';
import { QuizDialog } from '@/components/dashboard/quiz-dialog';
import type { Task, TaskSubmission, User } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { PurchaseTrialsDialog } from '@/components/dashboard/purchase-trials-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { NebulaLedgerDialog } from '@/components/dashboard/nebula-ledger-dialog';

const GAME_TASK_IDS = ['11', '12', '13', '2'];

type ProcessedTask = Task & {
  status: 'completed' | 'locked' | 'available';
  trialsLeft?: number;
  isDisabled?: boolean;
};

export default function TasksPage() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();

  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [purchaseTask, setPurchaseTask] = useState<Task | null>(null);
  const [nebulaLedgerTask, setNebulaLedgerTask] = useState<Task | null>(null);

  // Fetch all tasks
  const tasksQuery = useMemoFirebase(() => (firestore ? collection(firestore, 'tasks') : null), [firestore]);
  const { data: tasks, isLoading: tasksLoading } = useCollection<Task>(tasksQuery);

  // Fetch user's submissions from their private subcollection
  const submissionsQuery = useMemoFirebase(
    () => (firestore && user) ? collection(firestore, 'users', user.id, 'submissions') : null,
    [firestore, user]
  );
  const { data: userSubmissions, isLoading: submissionsLoading } = useCollection<TaskSubmission>(submissionsQuery);

  const isLoading = userLoading || tasksLoading || submissionsLoading;

  const processedTasks = useMemo((): ProcessedTask[] => {
    if (isLoading || !tasks || !user) return [];

    const submittedTaskIds = new Set(
      userSubmissions
        ?.filter(s => s.status === 'pending' || s.status === 'approved')
        .map(s => s.taskId) ?? []
    );

    const baseProcessedTasks = tasks
      .map(task => {
        const isGameTask = GAME_TASK_IDS.includes(task.id);
        
        const hasBeenSubmitted = submittedTaskIds.has(task.id);
        
        // Game tasks are repeatable and never "completed", only out of trials.
        // One-off tasks are completed once successfully submitted.
        const isCompleted = !isGameTask && hasBeenSubmitted;
        const isLocked = user.level < task.requiredLevel;
        const status = isCompleted ? 'completed' : isLocked ? 'locked' : 'available';

        let trialsLeft: number | undefined;
        if (isGameTask) {
          const attempts = user.taskAttempts?.[task.id] ?? 0;
          trialsLeft = 5 - attempts;
        }
        
        let isDisabled = false;
        if (task.id === '1' && user.lastDailyCheckin) {
            const lastCheckin = user.lastDailyCheckin;
            const twentyFourHours = 24 * 60 * 60 * 1000;
            isDisabled = new Date().getTime() - lastCheckin.getTime() < twentyFourHours;
        }

        return { ...task, status, trialsLeft, isDisabled };
      });
    
    // Fallback to default sorting
    return baseProcessedTasks.sort((a, b) => a.requiredLevel - b.requiredLevel);

  }, [tasks, user, userSubmissions, isLoading]);
  
  const handleGenericSubmit = (task: Task, proof?: string) => {
    if (!user || !firestore) return;
    
    const userSubmissionsRef = collection(firestore, 'users', user.id, 'submissions');
    const newSubmissionRef = doc(userSubmissionsRef);
    const topLevelSubmissionsRef = doc(firestore, 'submissions', newSubmissionRef.id);

    const submissionData = {
      id: newSubmissionRef.id,
      userId: user.id,
      taskId: task.id,
      submittedAt: serverTimestamp(),
      status: 'pending' as const,
      taskTitle: task.name,
      reward: task.reward,
      user: { name: user.name || '', email: user.email || '', avatarUrl: user.avatarUrl || '' },
      proof: proof || `Submitted proof for ${task.name}`,
    };

    const batch = writeBatch(firestore);
    batch.set(newSubmissionRef, submissionData);
    batch.set(topLevelSubmissionsRef, submissionData);

    batch.commit()
      .then(() => toast({ title: 'Task Submitted!', description: `Your submission for "${task.name}" is pending review.` }))
      .catch((serverError) => {
        const permissionError = new FirestorePermissionError({
          path: newSubmissionRef.path,
          operation: 'create',
          requestResourceData: submissionData,
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  };


  const handleDailyCheckin = async (task: Task) => {
    if (!user || !firestore || task.isDisabled) return;

    const userRef = doc(firestore, 'users', user.id);
    
    try {
      await runTransaction(firestore, async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists()) throw new Error("User document does not exist!");

        const userSubmissionRef = doc(collection(firestore, 'users', user.id, 'submissions'));
        const topLevelSubmissionRef = doc(firestore, 'submissions', userSubmissionRef.id);

        const submissionData = {
          id: userSubmissionRef.id,
          userId: user.id,
          taskId: task.id,
          submittedAt: serverTimestamp(),
          status: 'pending' as const,
          taskTitle: task.name,
          reward: task.reward,
          user: { name: user.name || '', email: user.email || '', avatarUrl: user.avatarUrl || '' },
          proof: `Daily check-in for ${new Date().toISOString()}`,
        };
        
        transaction.set(userSubmissionRef, submissionData);
        transaction.set(topLevelSubmissionRef, submissionData);
        transaction.update(userRef, { lastDailyCheckin: serverTimestamp() });
      });

      toast({ title: 'Task Submitted!', description: `Your submission for "${task.name}" is pending review.` });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Could not process your daily check-in." });
    }
  };
  
  const handleStartGameOrQuiz = async (task: Task) => {
    if (!user || !firestore || (task.trialsLeft ?? 0) <= 0) return;

    const userRef = doc(firestore, 'users', user.id);
    const newAttempts = { ...user.taskAttempts, [task.id]: (user.taskAttempts?.[task.id] ?? 0) + 1 };

    try {
        await runTransaction(firestore, tx => {
            tx.update(userRef, { taskAttempts: newAttempts });
            return Promise.resolve();
        });

        // Now, either navigate or open dialog
        if (task.id === '2') {
            setIsQuizOpen(true);
        } else if (task.id === '11') {
            router.push('/dashboard/tasks/speedmath');
        } else if (task.id === '12') {
            router.push('/dashboard/tasks/memory-pattern');
        } else if (task.id === '13') {
            router.push('/dashboard/tasks/logic-puzzle');
        }

    } catch (error) {
        toast({ variant: "destructive", title: "Error Starting Game", description: "Could not update your attempts. Please try again." });
    }
  };

  const quizTask = useMemo(() => tasks?.find(t => t.id === '2'), [tasks]);

  return (
    <>
      <PageHeader title="Tasks" description="Complete tasks to earn crypto rewards and level up." />

      {quizTask && <QuizDialog isOpen={isQuizOpen} onClose={() => setIsQuizOpen(false)} onSubmitSuccess={() => handleGenericSubmit(quizTask, "Passed Crypto Beginner's Quiz")} />}
      {purchaseTask && user && <PurchaseTrialsDialog isOpen={!!purchaseTask} onClose={() => setPurchaseTask(null)} task={purchaseTask} user={user} />}
      {nebulaLedgerTask && <NebulaLedgerDialog isOpen={!!nebulaLedgerTask} onClose={() => setNebulaLedgerTask(null)} task={nebulaLedgerTask} onSubmitSuccess={(reward, message) => handleGenericSubmit({ ...nebulaLedgerTask, reward }, message)} />}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}><CardHeader><Skeleton className="h-6 w-3/4" /><Skeleton className="h-4 w-1/2" /></CardHeader><CardContent><Skeleton className="h-10 w-full" /></CardContent><CardFooter><Skeleton className="h-10 w-full" /></CardFooter></Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {processedTasks.map((task) => (
            <Card key={task.id} className={cn('flex flex-col', task.status === 'locked' && 'bg-muted/50 border-dashed', task.status === 'completed' && 'bg-primary/5')}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="font-headline">{task.name}</span>
                  {task.status === 'available' && <Sparkles className="size-5 text-accent" />}
                  {task.status === 'locked' && <Lock className="size-5 text-muted-foreground" />}
                  {task.status === 'completed' && <Check className="size-5 text-green-500" />}
                </CardTitle>
                <CardDescription>{task.status === 'locked' ? `Requires Level ${task.requiredLevel}` : `${task.reward.toLocaleString()} Coins Reward`}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground">{task.description}</p>
                {task.trialsLeft !== undefined && task.status === 'available' && (
                  <p className="text-xs text-muted-foreground mt-2">Trials left: {Math.max(0, task.trialsLeft)}</p>
                )}
              </CardContent>
              <CardFooter>
                {task.status === 'completed' && <Button className="w-full" variant="outline" disabled>Completed</Button>}
                {task.status === 'locked' && <Button className="w-full" disabled>Locked</Button>}
                {task.status === 'available' && (
                  <>
                    {task.id === '1' && <Button className="w-full" onClick={() => handleDailyCheckin(task)} disabled={task.isDisabled}>{task.isDisabled ? 'Claimed Today' : 'Claim Reward'}</Button>}
                    
                    {task.id.startsWith('nl-') && <Button className="w-full" onClick={() => setNebulaLedgerTask(task)}>Start Decryption</Button>}

                    {GAME_TASK_IDS.includes(task.id) && (
                      (task.trialsLeft ?? 0) > 0 ? (
                          <Button className="w-full" onClick={() => handleStartGameOrQuiz(task)}>
                              {task.id === '2' ? 'Start Quiz' : 'Start Challenge'}
                          </Button>
                      ) : (
                          <Button className="w-full" onClick={() => setPurchaseTask(task)}>
                              <RefreshCw className="mr-2"/>Purchase More Trials
                          </Button>
                      )
                    )}
                    
                    {/* Fallback for other generic tasks */}
                    {!['1', ...GAME_TASK_IDS].includes(task.id) && !task.id.startsWith('nl-') && <Button className="w-full" onClick={() => handleGenericSubmit(task)}>Submit Task</Button>}
                  </>
                )}
              </CardFooter>
            </Card>
          ))}
          {processedTasks.length === 0 && (
            <div className="text-center text-muted-foreground md:col-span-2 lg:col-span-3 py-10">No tasks available at the moment. Check back later!</div>
          )}
        </div>
      )}
    </>
  );
}
