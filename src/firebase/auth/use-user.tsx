'use client';

import { useFirebase } from '../provider'; // Use the main provider hook
import { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { useFirestore, useMemoFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';
import type { User } from '@/lib/types';

interface UseUserReturn {
  user: User | null;
  loading: boolean;
  error: Error | null;
}

export function useUser(): UseUserReturn {
  // 1. Get the basic Firebase Auth user and loading state from the provider
  const { user: firebaseUser, isUserLoading: isAuthLoading, userError: authError } = useFirebase();
  const firestore = useFirestore();

  // 2. State for the rich user profile from Firestore
  const [profile, setProfile] = useState<User | null>(null);
  const [isProfileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<Error | null>(null);

  // 3. Memoize the document reference
  const userDocRef = useMemoFirebase(
    () => (firestore && firebaseUser ? doc(firestore, 'users', firebaseUser.uid) : null),
    [firestore, firebaseUser]
  );
  
  // 4. Effect to listen to the user's profile document in Firestore
  useEffect(() => {
    // If we have no authenticated user from the provider, we're done.
    if (!firebaseUser) {
      setProfile(null);
      // isAuthLoading will be false here if the auth state has been determined as "logged out"
      setProfileLoading(false);
      return;
    }

    // If we don't have the doc ref yet, wait.
    if (!userDocRef) {
        return;
    }

    setProfileLoading(true);
    const unsubscribeSnapshot = onSnapshot(userDocRef, async (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const userProfile: User = {
            id: docSnap.id,
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
        } as User;
        setProfile(userProfile);
        setProfileError(null);
        setProfileLoading(false);
      } else {
        // This is a critical state: authenticated user, but no profile doc.
        // This can happen on first sign-up. We'll create the document.
        const userProfileData = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Anonymous',
          email: firebaseUser.email,
          role: 'admin', // Default new users to admin as per previous requests
          level: 1,
          walletBalance: 0,
          createdAt: serverTimestamp(),
          avatarUrl: firebaseUser.photoURL || `https://picsum.photos/seed/${firebaseUser.uid}/40/40`
        };

        try {
            await setDoc(userDocRef, userProfileData);
            // The onSnapshot listener will then pick up the newly created document,
            // update the 'profile' state, and set loading to false.
        } catch(serverError) {
            const permissionError = new FirestorePermissionError({
              path: userDocRef.path,
              operation: 'create',
              requestResourceData: userProfileData,
            });
            errorEmitter.emit('permission-error', permissionError);
            setProfileError(permissionError);
            setProfileLoading(false);
        }
      }
    }, (err) => {
        // Handle errors from the onSnapshot listener itself (e.g., permissions)
        const permissionError = new FirestorePermissionError({
          path: userDocRef.path,
          operation: 'get',
        });
        errorEmitter.emit('permission-error', permissionError);
        setProfileError(permissionError);
        setProfile(null);
        setProfileLoading(false);
    });

    return () => unsubscribeSnapshot();
  }, [userDocRef, firebaseUser]); // This effect depends on the doc ref changing

  // 5. Combine loading states and errors
  return { 
    user: profile, 
    loading: isAuthLoading || isProfileLoading, 
    error: authError || profileError 
  };
}
