'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, errorEmitter, FirestorePermissionError } from '@/firebase';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { BrainCircuit } from 'lucide-react';

const GRID_SIZE = 3;
const MIN_LEVEL_TO_PASS = 4;

type GameState = 'not-started' | 'showing-pattern' | 'awaiting-input' | 'finished';
type Pattern = number[];

const generatePattern = (level: number): Pattern => {
  const newPattern: Pattern = [];
  for (let i = 0; i < level; i++) {
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

  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const hasPassed = level - 1 >= MIN_LEVEL_TO_PASS;

  const startGame = () => {
    setLevel(1);
    setUserSequence([]);
    setGameState('showing-pattern');
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
    }
  }, [gameState, level]);

  const handleTileClick = (tileIndex: number) => {
    if (gameState !== 'awaiting-input') return;

    const newUserSequence = [...userSequence, tileIndex];
    setUserSequence(newUserSequence);

    // Check if the click was correct so far
    if (pattern[newUserSequence.length - 1] !== tileIndex) {
      // Incorrect click, end game
      setGameState('finished');
      return;
    }

    // Check if the sequence is complete
    if (newUserSequence.length === pattern.length) {
      // Correct sequence, advance to next level
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
    
    const taskId = '12'; // Memory Pattern Recall task ID
    const taskTitle = 'Memory Pattern Recall';
    const reward = 5;

    const submissionsColRef = collection(firestore, 'submissions');
    const submissionDocRef = doc(submissionsColRef);

    const submissionData = {
      id: submissionDocRef.id,
      userId: user.id,
      taskId,
      submittedAt: serverTimestamp(),
      status: 'pending',
      taskTitle,
      reward,
      user: { name: user.name, email: user.email, avatarUrl: user.avatarUrl },
      proof: `Reached Level: ${level - 1}`,
    };

    setDoc(submissionDocRef, submissionData)
      .then(() => {
        toast({ title: 'Challenge Complete!', description: 'Your submission is pending review.' });
        setGameState('not-started');
      })
      .catch((serverError) => {
        const permissionError = new FirestorePermissionError({
          path: submissionDocRef.path,
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
          <div className="flex flex-col items-center">
            <p className="text-xl font-semibold mb-4">{message}</p>
            <p className="text-muted-foreground mb-6">Level: {level}</p>
            <div className="grid grid-cols-3 gap-3">
              {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => (
                <div
                  key={index}
                  onClick={() => handleTileClick(index)}
                  className={cn(
                    'h-24 w-24 rounded-lg border-2 border-white/20 transition-colors duration-200',
                    gameState === 'awaiting-input' && 'cursor-pointer hover:bg-white/20',
                    activeTile === index ? 'bg-primary border-primary' : 'bg-white/10'
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
            <BrainCircuit className="size-16 mb-4" />
            <h2 className="font-headline text-3xl font-bold mb-4">Memory Pattern Recall</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">Memorize the sequence of glowing tiles. Repeat the pattern to advance to the next level. Reach level {MIN_LEVEL_TO_PASS} to win the reward.</p>
            <Button size="lg" onClick={startGame}>Start Challenge</Button>
          </div>
        );
    }
  };

  return (
    <Card className="w-full max-w-2xl bg-black/30 backdrop-blur-sm text-white border-white/20">
      <CardContent className="p-8 flex flex-col items-center justify-center min-h-[420px]">
        {renderContent()}
      </CardContent>
    </Card>
  );
}
