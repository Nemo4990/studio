'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, type User as FirebaseAuthUser } from 'firebase/auth';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth, useFirestore, useMemoFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';
import type { User } from '@/lib/types';


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
      if (!user) {
        setLoading(false);
        setProfile(null);
      }
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
    if (!userDocRef || !firebaseUser) {
      return;
    }

    setLoading(true);
    const unsubscribeSnapshot = onSnapshot(userDocRef, async (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const userProfile: User = {
            id: docSnap.id,
            ...data,
            // Convert Firestore Timestamps to JS Dates
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
        } as User;
        setProfile(userProfile);
        setLoading(false);
      } else {
        // User is authenticated, but no profile exists. Let's create one.
        const userProfileData = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Anonymous',
          email: firebaseUser.email,
          role: 'admin',
          level: 1,
          walletBalance: 0,
          createdAt: serverTimestamp(),
          avatarUrl: firebaseUser.photoURL || `https://picsum.photos/seed/${firebaseUser.uid}/40/40`
        };

        try {
            await setDoc(userDocRef, userProfileData);
            // The snapshot listener will be re-triggered by this setDoc, 
            // which will then set the profile and loading state correctly.
        } catch(serverError) {
            const permissionError = new FirestorePermissionError({
              path: userDocRef.path,
              operation: 'create',
              requestResourceData: userProfileData,
            });
            errorEmitter.emit('permission-error', permissionError);
            setError(permissionError);
            setLoading(false);
        }
      }
    }, (err) => {
        setError(err);
        setLoading(false);
    });

    return () => unsubscribeSnapshot();
  }, [userDocRef, firebaseUser]);

  return { user: profile, firebaseUser, loading, error };
}
