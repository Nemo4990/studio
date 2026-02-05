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
import { collection, doc, setDoc, serverTimestamp, runTransaction, Timestamp, query, where } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import React, { useMemo, useState } from 'react';
import { QuizDialog } from '@/components/dashboard/quiz-dialog';
import type { Task, TaskSubmission } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { PurchaseTrialsDialog } from '@/components/dashboard/purchase-trials-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { NebulaLedgerDialog } from '@/components/dashboard/nebula-ledger-dialog';

const GAME_TASK_IDS = ['11', '12', '13'];

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

  // Fetch user's submissions
  const submissionsQuery = useMemoFirebase(
    () => (firestore && user) ? query(collection(firestore, 'submissions'), where('userId', '==', user.id)) : null,
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

    return tasks
      .map(task => {
        const isCompleted = submittedTaskIds.has(task.id);
        const isLocked = user.level < task.requiredLevel;
        const status = isCompleted ? 'completed' : isLocked ? 'locked' : 'available';

        let trialsLeft: number | undefined;
        if (GAME_TASK_IDS.includes(task.id)) {
          const attempts = user.taskAttempts?.[task.id] ?? 0;
          trialsLeft = 3 - attempts;
        }
        
        let isDisabled = false;
        if (task.id === '1' && user.lastDailyCheckin) {
            const lastCheckin = (user.lastDailyCheckin as unknown as Timestamp)?.toDate() ?? new Date(0);
            const twentyFourHours = 24 * 60 * 60 * 1000;
            isDisabled = new Date().getTime() - lastCheckin.getTime() < twentyFourHours;
        }

        return { ...task, status, trialsLeft, isDisabled };
      })
      .sort((a, b) => a.requiredLevel - b.requiredLevel);
  }, [tasks, user, userSubmissions, isLoading]);
  
  const handleGenericSubmit = (task: Task) => {
    if (!user || !firestore) return;
    
    const submissionDocRef = doc(collection(firestore, 'submissions'));
    const submissionData = {
      id: submissionDocRef.id,
      userId: user.id,
      taskId: task.id,
      submittedAt: serverTimestamp(),
      status: 'pending' as const,
      taskTitle: task.name,
      reward: task.reward,
      user: { name: user.name || '', email: user.email || '', avatarUrl: user.avatarUrl || '' },
      proof: `https://example.com/proof-for-${task.id}.pdf`,
    };

    setDoc(submissionDocRef, submissionData)
      .then(() => toast({ title: 'Task Submitted!', description: `Your submission for "${task.name}" is pending review.` }))
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
    if (!user || !firestore || task.isDisabled) return;

    const userRef = doc(firestore, 'users', user.id);
    const submissionRef = doc(collection(firestore, 'submissions'));

    try {
      await runTransaction(firestore, async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists()) throw new Error("User document does not exist!");

        const submissionData = {
          id: submissionRef.id,
          userId: user.id,
          taskId: task.id,
          submittedAt: serverTimestamp(),
          status: 'pending' as const,
          taskTitle: task.name,
          reward: task.reward,
          user: { name: user.name || '', email: user.email || '', avatarUrl: user.avatarUrl || '' },
          proof: `Daily check-in for ${new Date().toISOString()}`,
        };
        
        transaction.set(submissionRef, submissionData);
        transaction.update(userRef, { lastDailyCheckin: serverTimestamp() });
      });

      toast({ title: 'Task Submitted!', description: `Your submission for "${task.name}" is pending review.` });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Could not process your daily check-in." });
    }
  };
  
  const handleStartGame = async (task: Task, path: string) => {
    if (!user || !firestore || (task.trialsLeft ?? 0) <= 0) return;
    
    const userRef = doc(firestore, 'users', user.id);
    const newAttempts = { ...user.taskAttempts, [task.id]: (user.taskAttempts?.[task.id] ?? 0) + 1 };
    
    try {
      await runTransaction(firestore, tx => {
        tx.update(userRef, { taskAttempts: newAttempts });
        return Promise.resolve();
      });
      router.push(path);
    } catch (error) {
      toast({ variant: "destructive", title: "Error Starting Game", description: "Could not update your attempts. Please try again." });
    }
  };

  const quizTask = useMemo(() => tasks?.find(t => t.id === '2'), [tasks]);

  if (isLoading) {
    return (
      <>
        <PageHeader title="Tasks" description="Complete tasks to earn crypto rewards and level up." />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}><CardHeader><Skeleton className="h-6 w-3/4" /><Skeleton className="h-4 w-1/2" /></CardHeader><CardContent><Skeleton className="h-10 w-full" /></CardContent><CardFooter><Skeleton className="h-10 w-full" /></CardFooter></Card>
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Tasks" description="Complete tasks to earn crypto rewards and level up." />

      {quizTask && <QuizDialog isOpen={isQuizOpen} onClose={() => setIsQuizOpen(false)} onSubmitSuccess={() => handleGenericSubmit(quizTask)} />}
      {purchaseTask && user && <PurchaseTrialsDialog isOpen={!!purchaseTask} onClose={() => setPurchaseTask(null)} task={purchaseTask} user={user} />}
      {nebulaLedgerTask && <NebulaLedgerDialog isOpen={!!nebulaLedgerTask} onClose={() => setNebulaLedgerTask(null)} task={nebulaLedgerTask} onSubmitSuccess={(reward) => handleGenericSubmit({ ...nebulaLedgerTask, reward })} />}

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
                  {task.id === '2' && <Button className="w-full" onClick={() => setIsQuizOpen(true)}>Take Quiz</Button>}
                  
                  {task.id.startsWith('nl-') && <Button className="w-full" onClick={() => setNebulaLedgerTask(task)}>Start Decryption</Button>}
                  
                  {GAME_TASK_IDS.includes(task.id) && (task.trialsLeft ?? 0) > 0 && (
                    <>
                      {task.id === '11' && <Button className="w-full" onClick={() => handleStartGame(task, '/dashboard/tasks/speedmath')}>Start Challenge</Button>}
                      {task.id === '12' && <Button className="w-full" onClick={() => handleStartGame(task, '/dashboard/tasks/memory-pattern')}>Start Challenge</Button>}
                      {task.id === '13' && <Button className="w-full" onClick={() => handleStartGame(task, '/dashboard/tasks/logic-puzzle')}>Start Challenge</Button>}
                    </>
                  )}
                  {GAME_TASK_IDS.includes(task.id) && (task.trialsLeft ?? 0) <= 0 && <Button className="w-full" onClick={() => setPurchaseTask(task)}><RefreshCw className="mr-2"/>Purchase More Trials</Button>}
                  
                  {/* Fallback for other generic tasks */}
                  {!['1','2', ...GAME_TASK_IDS].includes(task.id) && !task.id.startsWith('nl-') && <Button className="w-full" onClick={() => handleGenericSubmit(task)}>Submit Task</Button>}
                </>
              )}
            </CardFooter>
          </Card>
        ))}
        {processedTasks.length === 0 && !isLoading && (
          <div className="text-center text-muted-foreground md:col-span-2 lg:col-span-3 py-10">No tasks available at the moment. Check back later!</div>
        )}
      </div>
    </>
  );
}
