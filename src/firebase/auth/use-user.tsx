'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, type User as FirebaseAuthUser } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { useAuth, useFirestore } from '@/firebase/provider';
import type { User } from '@/lib/types';
import { useMemoFirebase } from '@/hooks/use-memo-firebase';

interface UseUserReturn {
  user: User | null;
  firebaseUser: FirebaseAuthUser | null;
  loading: boolean;
  error: Error | null;
}

export function useUser(): UseUserReturn {
  const auth = useAuth();
  const firestore = useFirestore();
  const [firebaseUser, setFirebaseUser] = useState<FirebaseAuthUser | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
    }, (err) => {
        setError(err);
        setLoading(false);
    });

    return () => unsubscribeAuth();
  }, [auth]);

  const userDocRef = useMemoFirebase(
    () => (firestore && firebaseUser ? doc(firestore, 'users', firebaseUser.uid) : null),
    [firestore, firebaseUser]
  );
  
  useEffect(() => {
    if (!userDocRef) {
        setProfile(null);
        // If there's no user, we are not loading anymore
        if (!firebaseUser) setLoading(false);
        return;
    }

    setLoading(true);
    const unsubscribeSnapshot = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const userProfile: User = {
            id: docSnap.id,
            ...data,
            // Convert Firestore Timestamps to JS Dates
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
        } as User;
        setProfile(userProfile);
      } else {
        setProfile(null);
        setError(new Error("User profile not found in Firestore."));
      }
      setLoading(false);
    }, (err) => {
        setError(err);
        setLoading(false);
    });

    return () => unsubscribeSnapshot();
  }, [userDocRef, firebaseUser]);

  return { user: profile, firebaseUser, loading, error };
}
