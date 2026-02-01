'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, errorEmitter, FirestorePermissionError } from '@/firebase';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { logicPuzzles, type Puzzle } from '@/lib/puzzle-data';
import { Lightbulb, BrainCircuit, CheckCircle, XCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type GameState = 'not-started' | 'playing' | 'finished';

const shuffleArray = <T,>(array: T[]): T[] => {
  return [...array].sort(() => Math.random() - 0.5);
};

export default function LogicPuzzleGame() {
  const [gameState, setGameState] = useState<GameState>('not-started');
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const startGame = () => {
    const randomPuzzle = shuffleArray(logicPuzzles)[0];
    setPuzzle(randomPuzzle);
    setGameState('playing');
    setUserAnswer('');
    setShowHint(false);
    setIsCorrect(null);
  };

  const checkAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!puzzle) return;

    const formattedUserAnswer = userAnswer.trim().toLowerCase();
    const correct = formattedUserAnswer === puzzle.answer.toLowerCase();
    
    setIsCorrect(correct);
    setGameState('finished');
  };
  
  const handleClaimReward = () => {
    if (!user || !firestore || !puzzle) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in.' });
      return;
    }
    setIsSubmitting(true);
    
    const taskId = '13';
    const taskTitle = 'Logic Puzzle Solving';
    const reward = 800;

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
      user: { name: user.name, email: user.email, avatarUrl: user.avatarUrl },
      proof: `Solved puzzle: "${puzzle?.question}"`,
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
      case 'playing':
        if (!puzzle) return null;
        return (
          <div className="w-full text-center">
            <p className="text-xl md:text-2xl leading-relaxed text-muted-foreground mb-8">
              {puzzle.question}
            </p>
            <form onSubmit={checkAnswer} className="max-w-sm mx-auto space-y-4">
              <Input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Your answer..."
                className="text-lg h-12 text-center"
                autoFocus
              />
              <Button type="submit" className="w-full" disabled={!userAnswer}>Submit Answer</Button>
            </form>
            <div className="mt-8">
                <Button variant="ghost" onClick={() => setShowHint(true)} disabled={showHint}>
                    <Lightbulb className="mr-2 size-4" /> Need a hint?
                </Button>
                {showHint && (
                    <Alert className="mt-4 text-left max-w-sm mx-auto bg-black/20 border-white/20">
                        <Lightbulb className="h-4 w-4 text-amber-300" />
                        <AlertTitle className="text-amber-300">Hint</AlertTitle>
                        <AlertDescription className="text-white/80">
                            {puzzle.hint}
                        </AlertDescription>
                    </Alert>
                )}
            </div>
          </div>
        );
      case 'finished':
        return (
          <div className="text-center flex flex-col items-center">
            {isCorrect ? (
                <>
                    <CheckCircle className="size-16 text-green-500 mb-4" />
                    <h2 className="font-headline text-3xl font-bold mb-2">Correct!</h2>
                    <p className="text-muted-foreground mb-6 max-w-md">You've successfully solved the puzzle. Your mind is sharp!</p>
                    <Button onClick={handleClaimReward} disabled={isSubmitting}>
                        {isSubmitting ? 'Submitting...' : 'Claim Your 800 Coin Reward'}
                    </Button>
                </>
            ) : (
                <>
                    <XCircle className="size-16 text-destructive mb-4" />
                    <h2 className="font-headline text-3xl font-bold mb-2">Not Quite...</h2>
                    <p className="text-muted-foreground mb-6">That wasn't the right answer. Give it another shot!</p>
                    <Button onClick={startGame} variant="outline">Try Another Puzzle</Button>
                </>
            )}
            
          </div>
        );
      case 'not-started':
      default:
        return (
          <div className="text-center flex flex-col items-center">
            <BrainCircuit className="size-16 mb-4" />
            <h2 className="font-headline text-3xl font-bold mb-4">Logic Puzzle Challenge</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">A riddle will be presented. Solve it to prove your critical thinking skills and earn a reward.</p>
            <Button size="lg" onClick={startGame}>Start Challenge</Button>
          </div>
        );
    }
  };

  return (
    <Card className="w-full max-w-2xl bg-black/30 backdrop-blur-sm text-white border-white/20">
      <CardContent className="p-8 flex flex-col items-center justify-center min-h-[400px]">
        {renderContent()}
      </CardContent>
    </Card>
  );
}
