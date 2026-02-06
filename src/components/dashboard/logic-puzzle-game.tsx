'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, errorEmitter, FirestorePermissionError } from '@/firebase';
import { collection, doc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { logicPuzzles, type Puzzle } from '@/lib/puzzle-data';
import { Lightbulb, BrainCircuit, CheckCircle, XCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

type GameState = 'not-started' | 'playing' | 'finished';

const shuffleArray = <T,>(array: T[]): T[] => {
  return [...array].sort(() => Math.random() - 0.5);
};

export default function LogicPuzzleGame() {
  const [gameState, setGameState] = useState<GameState>('not-started');
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
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
    setShuffledOptions(shuffleArray(randomPuzzle.options));
    setGameState('playing');
    setUserAnswer('');
    setShowHint(false);
    setIsCorrect(null);
  };

  const checkAnswer = () => {
    if (!puzzle) return;

    const correct = userAnswer === puzzle.correctAnswer;
    
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
      proof: `Solved puzzle: "${puzzle?.question}"`,
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
      case 'playing':
        if (!puzzle) return null;
        return (
          <div className="w-full text-center">
            <p className="text-xl md:text-2xl leading-relaxed text-muted-foreground mb-8">
              {puzzle.question}
            </p>
             <div className="max-w-md mx-auto space-y-4">
              <RadioGroup
                value={userAnswer}
                onValueChange={setUserAnswer}
                className="grid grid-cols-1 gap-3"
              >
                {shuffledOptions.map((option) => (
                  <Label key={option} htmlFor={option} className="flex items-center space-x-3 p-4 border border-border rounded-lg cursor-pointer hover:bg-muted/50 has-[:checked]:bg-primary has-[:checked]:border-primary has-[:checked]:text-primary-foreground transition-colors">
                      <RadioGroupItem value={option} id={option} className="border-foreground text-primary" />
                      <span className="text-base">{option}</span>
                  </Label>
                ))}
              </RadioGroup>
              <Button onClick={checkAnswer} className="w-full" disabled={!userAnswer}>Submit Answer</Button>
            </div>
            <div className="mt-8">
                <Button variant="ghost" onClick={() => setShowHint(true)} disabled={showHint}>
                    <Lightbulb className="mr-2 size-4" /> Need a hint?
                </Button>
                {showHint && (
                    <Alert className="mt-4 text-left max-w-sm mx-auto bg-card/50 border-border">
                        <Lightbulb className="h-4 w-4 text-primary" />
                        <AlertTitle className="text-primary">Hint</AlertTitle>
                        <AlertDescription>
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
                    <p className="text-muted-foreground mb-6">That wasn't the right answer. The correct answer was: <strong className="text-foreground">{puzzle?.correctAnswer}</strong>.</p>
                    <Button onClick={startGame} variant="outline">Try Another Puzzle</Button>
                </>
            )}
            
          </div>
        );
      case 'not-started':
      default:
        return (
          <div className="text-center flex flex-col items-center">
            <BrainCircuit className="size-16 mb-4 text-primary" />
            <h2 className="font-headline text-3xl font-bold mb-4">Logic Puzzle Challenge</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">A riddle will be presented. Solve it to prove your critical thinking skills and earn a reward.</p>
            <Button size="lg" onClick={startGame}>Start Challenge</Button>
          </div>
        );
    }
  };

  return (
    <Card className="w-full max-w-2xl bg-card/50 backdrop-blur-lg border-border">
      <CardContent className="p-8 flex flex-col items-center justify-center min-h-[400px]">
        {renderContent()}
      </CardContent>
    </Card>
  );
}
