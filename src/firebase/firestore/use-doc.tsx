'use client';

import { useState, useEffect } from 'react';
import { doc, onSnapshot, DocumentReference, DocumentData } from 'firebase/firestore';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

interface UseDocReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export function useDoc<T>(ref: DocumentReference<DocumentData> | null): UseDocReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!ref) {
      setLoading(false);
      setData(null);
      return;
    }
    
    setLoading(true);
    const unsubscribe = onSnapshot(ref, 
      (docSnap) => {
        if (docSnap.exists()) {
          const docData = docSnap.data();
          const item = {
            id: docSnap.id,
            ...docData,
            createdAt: docData.createdAt?.toDate ? docData.createdAt.toDate() : new Date(),
          } as T;
          setData(item);
        } else {
          setData(null);
        }
        setLoading(false);
      }, 
      (err) => {
        const permissionError = new FirestorePermissionError({
            path: ref.path,
            operation: 'get',
        });
        errorEmitter.emit('permission-error', permissionError);
        setError(permissionError);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [ref]);

  return { data, loading, error };
}
