'use client';

import { ArrowDown, ArrowUp } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit, Timestamp } from 'firebase/firestore';
import type { Deposit, Withdrawal } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';

// Mock data is now static, without random dates, to prevent hydration errors.
const mockActivities = [
  { type: 'deposit' as const, name: 'Alex J.', amount: '$50.00', avatar: 'https://picsum.photos/seed/wa1/40/40' },
  { type: 'withdraw' as const, name: 'Samantha B.', amount: '$25.50', avatar: 'https://picsum.photos/seed/wa2/40/40' },
  { type: 'deposit' as const, name: 'Abebe B.', amount: '3,000 ETB', avatar: 'https://picsum.photos/seed/et1/40/40' },
  { type: 'withdraw' as const, name: 'Liya K.', amount: '1,500 ETB', avatar: 'https://picsum.photos/seed/et2/40/40' },
  { type: 'deposit' as const, name: 'David L.', amount: '$20.00', avatar: 'https://picsum.photos/seed/wa5/40/40' },
  { type: 'deposit' as const, name: 'Dawit S.', amount: '5,000 ETB', avatar: 'https://picsum.photos/seed/et3/40/40' },
  { type: 'withdraw' as const, name: 'Tigist M.', amount: '800 ETB', avatar: 'https://picsum.photos/seed/et4/40/40' },
];

type Activity = {
    type: 'deposit' | 'withdraw';
    name: string;
    amount: string;
    avatar: string;
    date: Date;
}


export function WalletActivity() {
  const firestore = useFirestore();
  // State to hold the final, client-side randomized list.
  const [activities, setActivities] = useState<Activity[]>([]);

  const depositsQuery = useMemoFirebase(
    () => firestore ? query(collection(firestore, 'deposits'), orderBy('createdAt', 'desc'), limit(10)) : null,
    [firestore]
  );
  const { data: deposits, isLoading: depositsLoading } = useCollection<Deposit>(depositsQuery);

  const withdrawalsQuery = useMemoFirebase(
    () => firestore ? query(collection(firestore, 'withdrawals'), orderBy('requestedAt', 'desc'), limit(10)) : null,
    [firestore]
  );
  const { data: withdrawals, isLoading: withdrawalsLoading } = useCollection<Withdrawal>(withdrawalsQuery);
  
  const toDate = (ts: any) => {
    if (ts instanceof Timestamp) return ts.toDate();
    if (ts instanceof Date) return ts;
    // Handle Firestore's object representation of Timestamps after JSON serialization
    if (ts && typeof ts === 'object' && ts.seconds) {
      return new Timestamp(ts.seconds, ts.nanoseconds).toDate();
    }
    return new Date();
  }

  // This effect runs only on the client after hydration, preventing the mismatch.
  useEffect(() => {
    const depositActivities = (deposits || [])
      .filter(d => d.status === 'confirmed' && d.user)
      .map(d => ({
        type: 'deposit' as const,
        name: d.user?.name || 'Anonymous',
        amount: `${d.amount.toLocaleString()} ${d.currency}`,
        avatar: d.user?.avatarUrl || `https://picsum.photos/seed/${d.userId}/40/40`,
        date: toDate(d.createdAt),
      }));

    const withdrawalActivities = (withdrawals || [])
      .filter(w => w.status === 'approved' && w.user)
      .map(w => ({
        type: 'withdraw' as const,
        name: w.user?.name || 'Anonymous',
        amount: `${w.amount.toLocaleString()} ${w.currency}`,
        avatar: w.user?.avatarUrl || `https://picsum.photos/seed/${w.userId}/40/40`,
        date: toDate(w.requestedAt),
      }));
      
    // Add random dates to mock activities on the client side only
    const clientMockActivities = mockActivities.map(act => ({
        ...act,
        date: new Date(Date.now() - Math.random() * 86400000 * 2),
    }));

    // Combine real data with mock data
    const all = [...depositActivities, ...withdrawalActivities, ...clientMockActivities];
    
    // Shuffle the array randomly on the client
    const shuffled = [...all].sort(() => Math.random() - 0.5);

    setActivities(shuffled.slice(0, 20)); // Limit to 20 items

  }, [deposits, withdrawals]); // Rerun when the real data from Firestore changes

  const isLoading = depositsLoading || withdrawalsLoading;

  // Render a skeleton if fetching data OR if the client-side effect has not run yet.
  // This ensures the server-render and initial client-render match.
  if (isLoading || activities.length === 0) {
    return (
        <div className="w-full">
            <h3 className="font-headline text-lg font-semibold mb-4 px-1">Live Activity</h3>
            <div className="relative h-96 overflow-hidden rounded-lg border bg-card">
                <div className="flex flex-col gap-4 p-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-4">
                            <Skeleton className="h-9 w-9 rounded-full" />
                            <div className="flex-grow space-y-2">
                                <Skeleton className="h-4 w-3/4" />
                            </div>
                            <Skeleton className="h-4 w-1/4" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
  }

  return (
    <div className="w-full">
      <h3 className="font-headline text-lg font-semibold mb-4 px-1">Live Activity</h3>
      <div className="relative h-96 overflow-hidden rounded-lg border bg-card [mask-image:_linear-gradient(to_bottom,transparent_0,_black_32px,_black_calc(100%-32px),transparent_100%)]">
        <div className="absolute top-0 left-0 w-full flex flex-col gap-4 p-4 animate-vertical-scroll">
          {/* Duplicate activities for seamless loop */}
          {[...activities, ...activities].map((activity, index) => (
            <div
              key={`${activity.name}-${activity.amount}-${index}`} // Use a more stable key
              className="flex items-center gap-4 shrink-0"
            >
              <Avatar className="h-9 w-9">
                <AvatarImage src={activity.avatar} alt={activity.name} />
                <AvatarFallback>{activity.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-grow">
                <p className="text-sm font-medium">
                  {activity.name} just {activity.type === 'deposit' ? 'deposited' : 'withdrew'}
                </p>
              </div>
              <div
                className={cn(
                  'flex items-center text-sm font-semibold',
                  activity.type === 'deposit' ? 'text-green-500' : 'text-red-500'
                )}
              >
                {activity.type === 'deposit' ? <ArrowDown className="mr-1 h-4 w-4 text-green-500/80" /> : <ArrowUp className="mr-1 h-4 w-4 text-red-500/80" />}
                {activity.amount}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
