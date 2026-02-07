'use client';

import React, { useState, useEffect, useRef } from 'react';
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
import { ScrollArea } from '@/components/ui/scroll-area';

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

const generateFakeHash = () => '0x' + [...Array(16)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');

const logLines = [
    'Initializing quantum entanglement matrix...',
    'Authenticating with target node via ZK-Proof...',
    () => `Verifying cryptographic signature: ${generateFakeHash()}`,
    'Access granted. Bypassing L1 firewall...',
    'Layer 1 breached. Exploiting consensus vulnerability...',
    'Bypassing L2 sharding protocol...',
    () => `Analyzing data shard: ${generateFakeHash()}`,
    'Shard hash mismatch. Attempting consensus override...',
    () => `Signature re-verified with temporal key: ${generateFakeHash()}`,
    'Bypassing L3 oracle validation...',
    'Firewall layers breached. Accessing core ledger.',
    'Initiating decryption of root block...',
    'Applying quantum de-encryption algorithm...',
    'Finalizing decryption sequence...',
    'Ledger unlocked. Extracting data payload.'
];


export function NebulaLedgerDialog({ isOpen, onClose, task, onSubmitSuccess }: NebulaLedgerDialogProps) {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<GameResult | null>(null);
  const [decryptionLog, setDecryptionLog] = useState<string[]>([]);
  const logEndRef = useRef<HTMLDivElement | null>(null);

  const config = nodeConfig[task.id as keyof typeof nodeConfig] || nodeConfig['nl-1'];
  const Icon = config.icon;

  useEffect(() => {
    if (gameState === 'decrypting') {
        setProgress(0);
        setDecryptionLog(['Connection established.']);
        
        let logIndex = 0;

        const interval = setInterval(() => {
            setProgress(prev => {
                const next = prev + 100 / (logLines.length + 1);
                if (next >= 100) {
                    clearInterval(interval);
                    setDecryptionLog(prevLog => [...prevLog, 'Decryption complete.']);
                    setTimeout(runDecryptionLogic, 500);
                    return 100;
                }
                return next;
            });

            if (logIndex < logLines.length) {
                const lineOrFn = logLines[logIndex];
                const newLine = typeof lineOrFn === 'function' ? lineOrFn() : lineOrFn;
                setDecryptionLog(prevLog => [...prevLog, newLine]);
                logIndex++;
            }

        }, 600); // Slower animation

        return () => clearInterval(interval);
    }
  }, [gameState]);
  
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [decryptionLog]);
  
  useEffect(() => {
    if (isOpen) {
        setGameState('idle');
        setProgress(0);
        setResult(null);
        setDecryptionLog([]);
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
            <Icon className={cn("size-16 mb-4", config.risk === 'High' ? 'text-destructive' : 'text-green-400')} />
            <p className="font-bold text-lg">Decrypting: {config.name}</p>
            <p className="text-sm text-muted-foreground mb-4">Risk Level: {config.risk}</p>
            <Alert className="text-left mb-6 bg-green-900/20 border-green-500/30">
                <Coins className="h-4 w-4 text-green-400" />
                <AlertTitle className="text-green-300">Potential Rewards</AlertTitle>
                <AlertDescription className="text-green-400/80">
                    Base reward of {task.reward} coins, with a chance for a jackpot up to <span className="font-bold text-green-300">{ (task.reward * config.jackpotMultiplier).toLocaleString() }</span> coins!
                </AlertDescription>
            </Alert>
            <Button size="lg" onClick={handleStart} className="w-full">
              Start Decryption
            </Button>
          </div>
        );
        
      case 'decrypting':
        return (
            <div className="flex flex-col items-center text-center w-full">
                <p className="font-bold text-lg">Decrypting Node...</p>
                <p className="text-sm text-muted-foreground mb-4">Establishing secure connection...</p>
                
                <ScrollArea className="h-48 w-full rounded-md border border-green-500/30 bg-black/50 p-4 my-4 font-mono text-xs text-green-400">
                    {decryptionLog.map((line, index) => (
                        <p key={index} className="animate-in fade-in">{`> ${line}`}</p>
                    ))}
                    <div ref={logEndRef} />
                </ScrollArea>
                
                <Progress value={progress} className="w-full [&>div]:bg-green-400" />
            </div>
        );
        
      case 'result':
        if (!result) return null;
        return (
          <div className="flex flex-col items-center text-center">
            {result.success ? (
                <>
                    {result.multiplier > 1 ? <Sparkles className="size-16 mb-4 text-amber-400" /> : <CheckCircle className="size-16 mb-4 text-green-400" />}
                    <h3 className="font-headline text-2xl font-bold text-green-300">{result.multiplier > 1 ? 'JACKPOT!' : 'Decryption Successful!'}</h3>
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
      <DialogContent className="bg-background/80 backdrop-blur-sm border-primary/20 shadow-lg shadow-primary/20">
        <DialogHeader>
          <DialogTitle className="font-headline">Nebula Ledger</DialogTitle>
          <DialogDescription>
            High risk, high reward. Decrypt the node to claim your prize.
          </DialogDescription>
        </DialogHeader>
        <div className="py-6 min-h-[350px] flex items-center justify-center">
            {renderContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
