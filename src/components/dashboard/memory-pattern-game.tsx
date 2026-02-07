'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, errorEmitter, FirestorePermissionError } from '@/firebase';
import { collection, doc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { BrainCircuit } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const GRID_SIZE = 3;
const MIN_LEVEL_TO_PASS = 4;
const BASE_TIME_PER_LEVEL = 8; // seconds

type GameState = 'not-started' | 'showing-pattern' | 'awaiting-input' | 'finished';
type Pattern = number[];

const generatePattern = (level: number): Pattern => {
  const newPattern: Pattern = [];
  // Level 1 starts with 2 tiles
  for (let i = 0; i < level + 1; i++) {
    newPattern.push(Math.floor(Math.random() * (GRID_SIZE * GRID_SIZE)));
  }
  return newPattern;
};

export default function MemoryPatternGame() {
  const [gameState, setGameState] = useState<GameState>('not-started');
  const [level, setLevel] = useState(1);
  const [pattern, setPattern] = useState<Pattern>([]);
  const [userSequence, setUserSequence] = useState<Pattern>([]);
  const [activeTile, setActiveTile] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [timer, setTimer] = useState(BASE_TIME_PER_LEVEL);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const hasPassed = level - 1 >= MIN_LEVEL_TO_PASS;
  const timeForCurrentLevel = Math.max(3, BASE_TIME_PER_LEVEL - Math.floor(level / 2));

  const cleanupTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startGame = () => {
    setLevel(1);
    setUserSequence([]);
    setGameState('showing-pattern');
    cleanupTimer();
  };
  
  useEffect(() => {
    if (gameState === 'showing-pattern') {
      const newPattern = generatePattern(level);
      setPattern(newPattern);
      setUserSequence([]);
      
      let i = 0;
      const interval = setInterval(() => {
        if (i < newPattern.length) {
          setActiveTile(newPattern[i]);
          setTimeout(() => setActiveTile(null), 400);
          i++;
        } else {
          clearInterval(interval);
          setGameState('awaiting-input');
        }
      }, 700);

      return () => clearInterval(interval);
    } else if (gameState === 'awaiting-input') {
      setTimer(timeForCurrentLevel);
      timerRef.current = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            cleanupTimer();
            setGameState('finished');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
        cleanupTimer();
    }

    return cleanupTimer;
  }, [gameState, level, timeForCurrentLevel]);

  const handleTileClick = (tileIndex: number) => {
    if (gameState !== 'awaiting-input') return;

    const newUserSequence = [...userSequence, tileIndex];
    setUserSequence(newUserSequence);

    if (pattern[newUserSequence.length - 1] !== tileIndex) {
      setGameState('finished');
      return;
    }

    if (newUserSequence.length === pattern.length) {
      cleanupTimer();
      setTimeout(() => {
        setLevel(level + 1);
        setGameState('showing-pattern');
      }, 500);
    }
  };

  const handleClaimReward = () => {
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in.' });
      return;
    }
    setIsSubmitting(true);
    
    const taskId = '12';
    const taskTitle = 'Memory Pattern Recall';
    const reward = 400;

    const userSubmissionsRef = collection(firestore, 'users', user.id, 'submissions');
    const newSubmissionRef = doc(userSubmissionsRef);
    const topLevelSubmissionsRef = doc(firestore, 'submissions', newSubmissionRef.id);

    const submissionData = {
      id: newSubmissionRef.id,
      userId: user.id,
      taskId,
      submittedAt: serverTimestamp(),
      status: 'pending' as const,
      taskTitle,
      reward,
      user: { name: user.name, email: user.email, avatarUrl: user.avatarUrl },
      proof: `Reached Level: ${level - 1}`,
    };

    const batch = writeBatch(firestore);
    batch.set(newSubmissionRef, submissionData);
    batch.set(topLevelSubmissionsRef, submissionData);

    batch.commit()
      .then(() => {
        toast({ title: 'Challenge Complete!', description: 'Your submission is pending review.' });
        setGameState('not-started');
      })
      .catch((serverError) => {
        const permissionError = new FirestorePermissionError({
          path: newSubmissionRef.path,
          operation: 'create',
          requestResourceData: submissionData,
        });
        errorEmitter.emit('permission-error', permissionError);
        toast({ variant: 'destructive', title: 'Submission Failed', description: 'Please try again.' });
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const renderContent = () => {
    switch (gameState) {
      case 'showing-pattern':
      case 'awaiting-input':
        let message = 'Watch carefully...';
        if (gameState === 'awaiting-input') {
          message = 'Your turn!';
        }
        return (
          <div className="flex flex-col items-center w-full">
            <p className="text-xl font-semibold mb-2">{message}</p>
            <p className="text-muted-foreground mb-4">Level: {level}</p>
            {gameState === 'awaiting-input' && (
                <div className="w-full max-w-sm mb-4">
                    <Progress value={(timer / timeForCurrentLevel) * 100} className="h-2" />
                    <p className="text-center text-sm mt-1 text-muted-foreground">{timer}s remaining</p>
                </div>
            )}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => (
                <div
                  key={index}
                  onClick={() => handleTileClick(index)}
                  className={cn(
                    'h-20 w-20 sm:h-24 sm:w-24 rounded-lg border-2 border-border transition-colors duration-200',
                    gameState === 'awaiting-input' && 'cursor-pointer hover:bg-muted/50',
                    activeTile === index ? 'bg-primary border-primary' : 'bg-card/80'
                  )}
                />
              ))}
            </div>
          </div>
        );
      case 'finished':
        return (
          <div className="text-center flex flex-col items-center">
            <h2 className="font-headline text-3xl font-bold mb-2">Game Over</h2>
            <p className="text-muted-foreground mb-4">You reached</p>
            <p className="font-headline text-7xl font-bold mb-6">Level {level - 1}</p>
            {hasPassed ? (
                <p className="text-green-500 mb-6">Congratulations! You passed the minimum requirement.</p>
            ) : (
                <p className="text-destructive mb-6">You need to reach Level {MIN_LEVEL_TO_PASS} to pass. Try again!</p>
            )}
            <div className="flex gap-4">
                <Button onClick={startGame} variant="outline">Play Again</Button>
                {hasPassed && <Button onClick={handleClaimReward} disabled={isSubmitting}>{isSubmitting ? 'Submitting...' : 'Claim Reward'}</Button>}
            </div>
          </div>
        );
      case 'not-started':
      default:
        return (
          <div className="text-center flex flex-col items-center">
            <BrainCircuit className="size-16 mb-4 text-primary" />
            <h2 className="font-headline text-3xl font-bold mb-4">Memory Pattern Recall</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">Memorize the sequence of glowing tiles. Repeat the pattern to advance to the next level. Reach level {MIN_LEVEL_TO_PASS} to win the reward.</p>
            <Button size="lg" onClick={startGame}>Start Challenge</Button>
          </div>
        );
    }
  };

  return (
    <Card className="w-full max-w-2xl bg-card/50 backdrop-blur-lg border-border">
      <CardContent className="p-4 sm:p-8 flex flex-col items-center justify-center min-h-[480px]">
        {renderContent()}
      </CardContent>
    </Card>
  );
}
