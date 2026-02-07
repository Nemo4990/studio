'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, errorEmitter, FirestorePermissionError } from '@/firebase';
import { doc, runTransaction } from 'firebase/firestore';
import type { Task, User } from '@/lib/types';
import { Coins } from 'lucide-react';

interface PurchaseTrialsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  user: User;
}

const PURCHASE_COST = 150; // Cost in coins for 5 more trials

export function PurchaseTrialsDialog({ isOpen, onClose, task, user }: PurchaseTrialsDialogProps) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isPurchasing, setIsPurchasing] = useState(false);

  const handlePurchase = () => {
    if (!firestore) return;
    
    if (user.walletBalance < PURCHASE_COST) {
      toast({
        variant: 'destructive',
        title: 'Insufficient Balance',
        description: `You need at least ${PURCHASE_COST} coins to purchase more trials.`,
      });
      return;
    }

    setIsPurchasing(true);
    const userRef = doc(firestore, 'users', user.id);

    runTransaction(firestore, async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists()) {
          throw new Error('User document not found.');
        }

        const currentBalance = userDoc.data().walletBalance || 0;
        if (currentBalance < PURCHASE_COST) {
          throw new Error('Insufficient balance.');
        }

        const newBalance = currentBalance - PURCHASE_COST;
        const currentAttempts = userDoc.data().taskAttempts || {};
        // Resetting the attempt count to 0 gives the user 5 fresh trials for today.
        currentAttempts[task.id] = { count: 0, date: new Date().toISOString() }; 

        transaction.update(userRef, {
          walletBalance: newBalance,
          taskAttempts: currentAttempts,
        });
      })
      .then(() => {
        toast({
            title: 'Purchase Successful!',
            description: `You now have 5 more trials for "${task.name}".`,
        });
        onClose();
      })
      .catch((error: any) => {
        const permissionError = new FirestorePermissionError({
            path: userRef.path,
            operation: 'update',
            requestResourceData: {
                walletBalance: `(balance - ${PURCHASE_COST})`,
                taskAttempts: `(reset for task ${task.id})`,
            }
        });
        errorEmitter.emit('permission-error', permissionError);
        toast({
            variant: 'destructive',
            title: 'Purchase Failed',
            description: 'There was a problem processing your purchase. Please check permissions.',
        });
      })
      .finally(() => {
        setIsPurchasing(false);
      });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-headline">Purchase More Trials</DialogTitle>
          <DialogDescription>
            You have used all your free trials for "{task.name}".
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p>Would you like to purchase 5 more trials for this task?</p>
          <div className="mt-4 flex items-center justify-center rounded-lg border bg-secondary p-4">
            <p className="text-lg font-bold">Cost: </p>
            <div className="flex items-center gap-2 ml-2 text-lg font-bold text-primary">
              <Coins className="size-5 text-amber-500" />
              <span>{PURCHASE_COST} Coins</span>
            </div>
          </div>
           <p className="mt-2 text-sm text-center text-muted-foreground">This amount will be deducted from your wallet balance.</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPurchasing}>Cancel</Button>
          <Button onClick={handlePurchase} disabled={isPurchasing}>
            {isPurchasing ? 'Processing...' : 'Confirm Purchase'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
