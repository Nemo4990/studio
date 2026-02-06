'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, errorEmitter, FirestorePermissionError } from '@/firebase';
import { collection, doc, serverTimestamp, writeBatch } from 'firebase/firestore';

const TOTAL_QUESTIONS = 10;
const TIME_PER_QUESTION = 5; // seconds

type GameState = 'not-started' | 'playing' | 'finished';

type Question = {
  text: string;
  answer: number;
};

const generateQuestion = (): Question => {
  const num1 = Math.floor(Math.random() * 20) + 1;
  const num2 = Math.floor(Math.random() * 10) + 1;
  const operators = ['+', '-', '*'];
  const operator = operators[Math.floor(Math.random() * operators.length)];

  if (operator === '+') {
    return { text: `${num1} + ${num2}`, answer: num1 + num2 };
  } else if (operator === '-') {
    // Ensure result is not negative
    if (num1 < num2) {
      return { text: `${num2} - ${num1}`, answer: num2 - num1 };
    }
    return { text: `${num1} - ${num2}`, answer: num1 - num2 };
  } else { // operator is '*'
    const smallNum1 = Math.floor(Math.random() * 10) + 1;
    const smallNum2 = Math.floor(Math.random() * 10) + 1;
    return { text: `${smallNum1} × ${smallNum2}`, answer: smallNum1 * smallNum2 };
  }
};


export default function SpeedmathGame() {
  const [gameState, setGameState] = useState<GameState>('not-started');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(TIME_PER_QUESTION);
  const [userAnswer, setUserAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const scorePercentage = (score / TOTAL_QUESTIONS) * 100;
  const hasPassed = scorePercentage >= 80;

  const startTimer = () => {
    setTimer(TIME_PER_QUESTION);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          handleNextQuestion(true); // Times up
          return TIME_PER_QUESTION;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startGame = () => {
    const newQuestions = Array.from({ length: TOTAL_QUESTIONS }, generateQuestion);
    setQuestions(newQuestions);
    setCurrentQuestionIndex(0);
    setScore(0);
    setGameState('playing');
    startTimer();
    setUserAnswer('');
    setTimeout(() => inputRef.current?.focus(), 100);
  };
  
  const handleNextQuestion = (timesUp = false) => {
    if (timerRef.current) clearInterval(timerRef.current);

    const currentQuestion = questions[currentQuestionIndex];
    if (!timesUp && parseInt(userAnswer, 10) === currentQuestion.answer) {
      setScore((prev) => prev + 1);
    }
    
    setUserAnswer('');

    if (currentQuestionIndex < TOTAL_QUESTIONS - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      startTimer();
      inputRef.current?.focus();
    } else {
      setGameState('finished');
    }
  };

  const handleAnswerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleNextQuestion();
  };

  const handleClaimReward = () => {
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in.' });
      return;
    }
    setIsSubmitting(true);
    
    const taskId = '11'; // Speedmath Challenge task ID
    const taskTitle = 'Speedmath Challenge';
    const reward = 500;
    
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
      proof: `Score: ${score}/${TOTAL_QUESTIONS} (${scorePercentage.toFixed(0)}%)`,
    };

    const batch = writeBatch(firestore);
    batch.set(newSubmissionRef, submissionData);
    batch.set(topLevelSubmissionsRef, submissionData);

    batch.commit()
      .then(() => {
        toast({ title: 'Challenge Complete!', description: 'Your submission is pending review.' });
        setGameState('not-started'); // Reset game
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

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const renderContent = () => {
    switch (gameState) {
      case 'playing':
        const currentQuestion = questions[currentQuestionIndex];
        return (
          <>
            <div className="w-full text-center mb-4">
                <p className="text-sm text-muted-foreground">Question {currentQuestionIndex + 1} of {TOTAL_QUESTIONS}</p>
                <p className="text-sm text-muted-foreground">Score: {score}</p>
            </div>
            <Progress value={(timer / TIME_PER_QUESTION) * 100} className="w-full h-2 mb-6" />
            <p className="font-headline text-5xl md:text-7xl font-bold mb-8 text-center">{currentQuestion.text}</p>
            <form onSubmit={handleAnswerSubmit}>
              <Input
                ref={inputRef}
                type="number"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Your Answer"
                className="text-2xl h-14 text-center bg-background/50"
                autoFocus
              />
            </form>
          </>
        );
      case 'finished':
        return (
          <div className="text-center flex flex-col items-center">
            <h2 className="font-headline text-3xl font-bold mb-2">Challenge Complete!</h2>
            <p className="text-muted-foreground mb-4">You scored</p>
            <p className="font-headline text-7xl font-bold mb-6">{scorePercentage.toFixed(0)}%</p>
            {hasPassed ? (
                <p className="text-green-500 mb-6">Congratulations! You passed the challenge.</p>
            ) : (
                <p className="text-destructive mb-6">So close! You need 80% to pass. Try again!</p>
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
          <div className="text-center">
            <h2 className="font-headline text-3xl font-bold mb-4">Ready to test your speed?</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">You'll have {TIME_PER_QUESTION} seconds for each of the {TOTAL_QUESTIONS} questions. You need to score at least 80% to win.</p>
            <Button size="lg" onClick={startGame}>Start Challenge</Button>
          </div>
        );
    }
  };

  return (
    <Card className="w-full max-w-2xl bg-card/50 backdrop-blur-lg border-border text-foreground">
      <CardContent className="p-8 flex flex-col items-center justify-center min-h-[350px]">
        {renderContent()}
      </CardContent>
    </Card>
  );
}
