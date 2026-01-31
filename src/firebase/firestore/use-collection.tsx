'use client';

import { useState, useEffect } from 'react';
import { onSnapshot, query, Query, collection, DocumentData, QuerySnapshot } from 'firebase/firestore';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

interface UseCollectionReturn<T> {
  data: T[] | null;
  loading: boolean;
  error: Error | null;
}

export function useCollection<T>(q: Query | null): UseCollectionReturn<T> {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!q) {
        setLoading(false);
        setData([]);
        return;
    }

    setLoading(true);
    
    const unsubscribe = onSnapshot(q, 
      (querySnapshot: QuerySnapshot<DocumentData>) => {
        const documents = querySnapshot.docs.map(doc => {
            const docData = doc.data();
            return { 
                id: doc.id,
                 ...docData,
                 createdAt: docData.createdAt?.toDate ? docData.createdAt.toDate() : new Date(),
            } as T
        });
        setData(documents);
        setLoading(false);
      }, 
      (err) => {
        const permissionError = new FirestorePermissionError({
            path: (q as any)._path?.toString() || 'unknown collection',
            operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        setError(permissionError);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [q]);

  return { data, loading, error };
}
