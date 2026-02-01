'use client';

import { ArrowDown, ArrowUp } from 'lucide-react';
import React from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

const mockActivities = [
  { type: 'deposit', name: 'Alex J.', amount: '$50.00', avatar: 'https://picsum.photos/seed/wa1/40/40' },
  { type: 'withdraw', name: 'Samantha B.', amount: '$25.50', avatar: 'https://picsum.photos/seed/wa2/40/40' },
  { type: 'deposit', name: 'Ken A.', amount: '$100.00', avatar: 'https://picsum.photos/seed/wa3/40/40' },
  { type: 'withdraw', name: 'Maria G.', amount: '$75.20', avatar: 'https://picsum.photos/seed/wa4/40/40' },
  { type: 'deposit', name: 'David L.', amount: '$20.00', avatar: 'https://picsum.photos/seed/wa5/40/40' },
  { type: 'withdraw', name: 'Sarah P.', amount: '$40.00', avatar: 'https://picsum.photos/seed/wa6/40/40' },
  { type: 'deposit', name: 'Michael C.', amount: '$250.00', avatar: 'https://picsum.photos/seed/wa7/40/40' },
  { type: 'withdraw', name: 'Linda H.', amount: '$15.00', avatar: 'https://picsum.photos/seed/wa8/40/40' },
  { type: 'deposit', name: 'Chris T.', amount: '$120.00', avatar: 'https://picsum.photos/seed/wa9/40/40' },
  { type: 'withdraw', name: 'Paula M.', amount: '$5.00', avatar: 'https://picsum.photos/seed/wa10/40/40' },
];

export function WalletActivity() {
  return (
    <div className="w-full">
      <h3 className="font-headline text-lg font-semibold mb-4 px-1">Live Activity</h3>
      <div className="relative h-96 overflow-hidden rounded-lg border bg-card [mask-image:_linear-gradient(to_bottom,transparent_0,_black_32px,_black_calc(100%-32px),transparent_100%)]">
        <div className="absolute top-0 left-0 w-full flex flex-col gap-4 p-4 animate-vertical-scroll">
          {/* Duplicate activities for seamless loop */}
          {[...mockActivities, ...mockActivities].map((activity, index) => (
            <div
              key={index}
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
