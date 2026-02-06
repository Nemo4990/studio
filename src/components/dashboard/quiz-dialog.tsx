'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { cryptoQuiz, type QuizQuestion } from '@/lib/quiz-data';
import { CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QuizDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess: () => void;
}

const shuffleArray = <T,>(array: T[]): T[] => {
  return [...array].sort(() => Math.random() - 0.5);
};

export function QuizDialog({ isOpen, onClose, onSubmitSuccess }: QuizDialogProps) {
  const { toast } = useToast();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  const randomizedQuestions = useMemo(() => shuffleArray(cryptoQuiz), [isOpen]);

  useEffect(() => {
    if (isOpen) {
      // Each time the dialog opens, reset the state and get new random questions
      const selectedQuestions = shuffleArray(cryptoQuiz).slice(0, 3); // Pick 3 random questions
      setQuestions(selectedQuestions);
      setAnswers({});
      setShowResults(false);
      setScore(0);
    }
  }, [isOpen, randomizedQuestions]);

  const handleAnswerChange = (questionIndex: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionIndex]: value }));
  };

  const handleSubmit = () => {
    let correctAnswers = 0;
    questions.forEach((q, index) => {
      if (answers[index] === q.correctAnswer) {
        correctAnswers++;
      }
    });
    const finalScore = (correctAnswers / questions.length) * 100;
    setScore(finalScore);
    setShowResults(true);

    if (finalScore >= 80) {
      toast({
        title: 'Quiz Passed!',
        description: 'Submitting task for approval.',
      });
      onSubmitSuccess();
      // Keep dialog open to show results, then auto-close or let user close.
      setTimeout(() => onClose(), 2000);
    } else {
      toast({
        variant: 'destructive',
        title: 'Quiz Failed',
        description: `You scored ${finalScore.toFixed(0)}%. Please try again.`,
      });
    }
  };

  const allQuestionsAnswered = Object.keys(answers).length === questions.length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-headline">Crypto Beginner's Quiz</DialogTitle>
          <DialogDescription>
            Answer all questions correctly to complete the task.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4 max-h-[60vh] overflow-y-auto pr-4">
          {questions.map((q, index) => (
            <div key={index} className="space-y-3">
              <p className="font-semibold">
                {index + 1}. {q.question}
              </p>
              <RadioGroup
                value={answers[index]}
                onValueChange={(value) => handleAnswerChange(index, value)}
                disabled={showResults}
              >
                {q.options.map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`q${index}-${option}`} />
                    <Label
                      htmlFor={`q${index}-${option}`}
                      className={`cursor-pointer ${
                        showResults && option === q.correctAnswer
                          ? 'text-green-500'
                          : ''
                      } ${
                        showResults &&
                        answers[index] === option &&
                        option !== q.correctAnswer
                          ? 'text-red-500'
                          : ''
                      }`}
                    >
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          ))}
        </div>
        <DialogFooter>
          {showResults ? (
             <div className="w-full flex justify-center items-center gap-2">
                {score >= 80 ? (
                    <CheckCircle className="size-6 text-green-500"/>
                ) : (
                    <XCircle className="size-6 text-red-500"/>
                )}
                <p className="font-bold text-lg">Your Score: {score.toFixed(0)}%</p>
             </div>
          ) : (
            <Button onClick={handleSubmit} disabled={!allQuestionsAnswered}>
                Submit Quiz
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
