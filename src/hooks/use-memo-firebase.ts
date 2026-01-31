'use client';
import { useMemo, type DependencyList } from 'react';

// Custom hook to memoize Firebase queries
export const useMemoFirebase = <T>(
  factory: () => T,
  deps: DependencyList | undefined,
) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(factory, deps);
};
