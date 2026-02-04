'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Coins, Cpu, ShieldCheck, ShieldAlert, Sparkles, XCircle, CheckCircle } from 'lucide-react';
import type { Task } from '@/lib/types';
import { cn } from '@/lib/utils';

interface NebulaLedgerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  onSubmitSuccess: (reward: number, message: string) => void;
}

type GameState = 'idle' | 'decrypting' | 'result';
type GameResult = {
  success: boolean;
  reward: number;
  multiplier: number;
  message: string;
};

const nodeConfig = {
    'nl-1': { name: 'Standard Data Node', risk: 'Low', successChance: 0.9, jackpotChance: 0.05, jackpotMultiplier: 3, icon: ShieldCheck },
    'nl-2': { name: 'Encrypted Cache', risk: 'Medium', successChance: 0.7, jackpotChance: 0.1, jackpotMultiplier: 5, icon: ShieldCheck },
    'nl-3': { name: 'Quantum Ledger', risk: 'High', successChance: 0.5, jackpotChance: 0.15, jackpotMultiplier: 10, icon: ShieldAlert },
}

export function NebulaLedgerDialog({ isOpen, onClose, task, onSubmitSuccess }: NebulaLedgerDialogProps) {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<GameResult | null>(null);

  const config = nodeConfig[task.id as keyof typeof nodeConfig] || nodeConfig['nl-1'];
  const Icon = config.icon;

  useEffect(() => {
    if (gameState !== 'decrypting') return;

    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev + Math.random() * 20;
        if (next >= 100) {
          clearInterval(interval);
          runDecryptionLogic();
          return 100;
        }
        return next;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [gameState]);
  
  useEffect(() => {
    // Reset game state when dialog is re-opened for a new task
    if (isOpen) {
        setGameState('idle');
        setProgress(0);
        setResult(null);
    }
  }, [isOpen, task.id]);


  const runDecryptionLogic = () => {
    const isSuccess = Math.random() < config.successChance;
    
    if (isSuccess) {
      const isJackpot = Math.random() < config.jackpotChance;
      const multiplier = isJackpot ? config.jackpotMultiplier : 1;
      const finalReward = task.reward * multiplier;
      
      let message = `You earned ${finalReward.toLocaleString()} coins.`;
      if (isJackpot) {
        message = `JACKPOT! You hit a ${multiplier}x multiplier and earned ${finalReward.toLocaleString()} coins!`
      }
      
      setResult({ success: true, reward: finalReward, multiplier, message });
    } else {
      setResult({ success: false, reward: 0, multiplier: 1, message: "Decryption failed. No reward this time." });
    }
    
    setGameState('result');
  };

  const handleStart = () => {
    setGameState('decrypting');
  };
  
  const handleClaimAndClose = () => {
    if (result?.success) {
      onSubmitSuccess(result.reward, result.message);
    }
    onClose();
  };

  const renderContent = () => {
    switch (gameState) {
      case 'idle':
        return (
          <div className="flex flex-col items-center text-center">
            <Icon className={cn("size-16 mb-4", config.risk === 'High' ? 'text-destructive' : 'text-primary')} />
            <p className="font-bold text-lg">Decrypting: {config.name}</p>
            <p className="text-sm text-muted-foreground mb-4">Risk Level: {config.risk}</p>
            <Alert className="text-left mb-6">
                <Coins className="h-4 w-4" />
                <AlertTitle>Potential Rewards</AlertTitle>
                <AlertDescription>
                    Base reward of {task.reward} coins, with a chance for a jackpot up to <span className="font-bold text-accent">{ (task.reward * config.jackpotMultiplier).toLocaleString() }</span> coins!
                </AlertDescription>
            </Alert>
            <Button size="lg" onClick={handleStart} className="w-full">
              Start Decryption
            </Button>
          </div>
        );
        
      case 'decrypting':
        return (
          <div className="flex flex-col items-center text-center">
            <Cpu className="size-16 mb-4 text-primary animate-pulse" />
            <p className="font-bold text-lg">Decrypting Node...</p>
            <p className="text-sm text-muted-foreground mb-6">Analyzing quantum signatures...</p>
            <Progress value={progress} className="w-full" />
          </div>
        );
        
      case 'result':
        if (!result) return null;
        return (
          <div className="flex flex-col items-center text-center">
            {result.success ? (
                <>
                    {result.multiplier > 1 ? <Sparkles className="size-16 mb-4 text-amber-400" /> : <CheckCircle className="size-16 mb-4 text-green-500" />}
                    <h3 className="font-headline text-2xl font-bold">{result.multiplier > 1 ? 'JACKPOT!' : 'Decryption Successful!'}</h3>
                </>
            ) : (
                <>
                    <XCircle className="size-16 mb-4 text-destructive" />
                    <h3 className="font-headline text-2xl font-bold">Decryption Failed</h3>
                </>
            )}
            <p className="text-muted-foreground my-4 max-w-sm">{result.message}</p>
            <Button size="lg" onClick={handleClaimAndClose} className="w-full">
              {result.success ? `Claim ${result.reward.toLocaleString()} Coins` : 'Continue'}
            </Button>
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-headline">Nebula Ledger</DialogTitle>
          <DialogDescription>
            High risk, high reward. Decrypt the node to claim your prize.
          </DialogDescription>
        </DialogHeader>
        <div className="py-6 min-h-[250px] flex items-center justify-center">
            {renderContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
