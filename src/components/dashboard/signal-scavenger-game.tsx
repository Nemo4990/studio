'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, errorEmitter, FirestorePermissionError } from '@/firebase';
import { collection, doc, setDoc, serverTimestamp, updateDoc, arrayUnion } from 'firebase/firestore';
import { scavengerTiles } from '@/lib/scavenger-data';
import { cn } from '@/lib/utils';
import { Check, CheckCircle, ExternalLink } from 'lucide-react';

const TASK_ID = 'scavenger-1';
const TASK_TITLE = 'Signal Scavenger';
const TASK_REWARD = 500;

export default function SignalScavengerGame() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const clickedTiles = user?.signalScavengerClickedTiles || [];
  const allTilesClicked = clickedTiles.length === scavengerTiles.length;
  
  const handleTileClick = (tileId: string, url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
    
    if (!user || clickedTiles.includes(tileId)) return;

    const userRef = doc(firestore, 'users', user.id);
    updateDoc(userRef, {
        signalScavengerClickedTiles: arrayUnion(tileId)
    }).catch(serverError => {
        const permissionError = new FirestorePermissionError({
          path: userRef.path,
          operation: 'update',
          requestResourceData: { signalScavengerClickedTiles: arrayUnion(tileId) },
        });
        errorEmitter.emit('permission-error', permissionError);
    });
  };
  
  const handleClaimReward = () => {
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in.' });
      return;
    }
    setIsSubmitting(true);

    const submissionsColRef = collection(firestore, 'submissions');
    const submissionDocRef = doc(submissionsColRef);

    const submissionData = {
      id: submissionDocRef.id,
      userId: user.id,
      taskId: TASK_ID,
      submittedAt: serverTimestamp(),
      status: 'pending' as const,
      taskTitle: TASK_TITLE,
      reward: TASK_REWARD,
      user: { name: user.name, email: user.email, avatarUrl: user.avatarUrl },
      proof: `Completed Signal Scavenger hunt by visiting all ${scavengerTiles.length} tiles.`,
    };

    setDoc(submissionDocRef, submissionData)
      .then(() => {
        toast({ title: 'Task Submitted!', description: 'Your submission is pending review.' });
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
  
  return (
    <Card className="w-full max-w-4xl bg-card/50 backdrop-blur-lg border-border">
      <CardContent className="p-6 md:p-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {scavengerTiles.map(tile => {
            const isClicked = clickedTiles.includes(tile.id);
            return (
              <button
                key={tile.id}
                onClick={() => handleTileClick(tile.id, tile.url)}
                disabled={isClicked}
                className={cn(
                  'relative group aspect-square rounded-lg border-2 p-4 flex flex-col justify-end items-start text-left transition-all duration-300 overflow-hidden',
                  'bg-card/70 border-border hover:bg-muted/50 hover:border-primary',
                  'disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:bg-card/70 disabled:hover:border-green-500/50',
                  isClicked && 'border-green-500/50 bg-green-500/10'
                )}
              >
                <div className="absolute top-2 right-2 transition-opacity duration-300">
                    {isClicked ? <CheckCircle className="size-5 text-green-500" /> : <ExternalLink className="size-4 text-muted-foreground group-hover:text-foreground" />}
                </div>
                <h3 className="font-bold text-sm md:text-base">{tile.name}</h3>
                <p className="text-xs text-muted-foreground">Visit site</p>
              </button>
            );
          })}
        </div>
        {allTilesClicked && (
          <div className="mt-8 text-center">
            <p className="text-lg text-green-400 mb-4">All signals found! You've completed the scavenger hunt.</p>
            <Button onClick={handleClaimReward} disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : `Claim ${TASK_REWARD} Coin Reward`}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
