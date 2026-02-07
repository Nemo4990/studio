'use client';

import { ArrowDown, ArrowUp } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Skeleton } from '../ui/skeleton';

// Static mock data.
const mockActivities = [
  { type: 'deposit' as const, name: 'Alex J.', amount: '$50.00', avatar: 'https://picsum.photos/seed/wa1/40/40' },
  { type: 'withdraw' as const, name: 'Samantha B.', amount: '$25.50', avatar: 'https://picsum.photos/seed/wa2/40/40' },
  { type: 'deposit' as const, name: 'Abebe B.', amount: '3,000 ETB', avatar: 'https://picsum.photos/seed/et1/40/40' },
  { type: 'withdraw' as const, name: 'Liya K.', amount: '1,500 ETB', avatar: 'https://picsum.photos/seed/et2/40/40' },
  { type: 'deposit' as const, name: 'David L.', amount: '$20.00', avatar: 'https://picsum.photos/seed/wa5/40/40' },
  { type: 'deposit' as const, name: 'Dawit S.', amount: '5,000 ETB', avatar: 'https://picsum.photos/seed/et3/40/40' },
  { type: 'withdraw' as const, name: 'Tigist M.', amount: '800 ETB', avatar: 'https://picsum.photos/seed/et4/40/40' },
  { type: 'deposit' as const, name: 'Chioma A.', amount: '75,000 NGN', avatar: 'https://picsum.photos/seed/ng1/40/40' },
  { type: 'withdraw' as const, name: 'Ben O.', amount: '30,000 NGN', avatar: 'https://picsum.photos/seed/ng2/40/40' },
];

type Activity = {
    type: 'deposit' | 'withdraw';
    name: string;
    amount: string;
    avatar: string;
}

export function WalletActivity() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // This effect runs only on the client after hydration, preventing any server/client mismatch.
  useEffect(() => {
    // Shuffle the mock activities on the client-side.
    const shuffled = [...mockActivities].sort(() => Math.random() - 0.5);
    setActivities(shuffled);
    setIsLoading(false);
  }, []);

  // Render a skeleton if the client-side effect has not run yet. This prevents hydration errors.
  if (isLoading) {
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

  // Duplicate the array for a seamless scrolling animation
  const displayActivities = [...activities, ...activities];

  return (
    <div className="w-full">
      <h3 className="font-headline text-lg font-semibold mb-4 px-1">Live Activity</h3>
      <div className="relative h-96 overflow-hidden rounded-lg border bg-card [mask-image:_linear-gradient(to_bottom,transparent_0,_black_32px,_black_calc(100%-32px),transparent_100%)]">
        <div className="absolute top-0 left-0 w-full flex flex-col gap-4 p-4 animate-vertical-scroll">
          {displayActivities.map((activity, index) => (
            <div
              key={`${activity.name}-${activity.amount}-${index}`}
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
