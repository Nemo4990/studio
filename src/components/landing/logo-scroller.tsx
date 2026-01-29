'use client';

import React from 'react';
import { cn } from '@/lib/utils';

type LogoScrollerProps = {
  items: { name: string; logo: React.ReactNode }[];
  speed?: 'normal' | 'slow' | 'fast';
};

export function LogoScroller({ items, speed = 'normal' }: LogoScrollerProps) {
  return (
    <div
      className="w-full inline-flex flex-nowrap overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-200px),transparent_100%)]"
    >
      <ul
        className={cn(
            "flex items-center justify-center md:justify-start [&_li]:mx-8 animate-infinite-scroll",
            speed === 'fast' && '[animation-duration:_20s]',
            speed === 'normal' && '[animation-duration:_40s]',
            speed === 'slow' && '[animation-duration:_80s]',
        )}
      >
        {items.map((item, index) => (
          <li
            key={`${item.name}-${index}`}
            className="flex-shrink-0 h-20 flex items-center justify-center text-foreground/80"
            title={item.name}
          >
            {item.logo}
          </li>
        ))}
      </ul>
      <ul
        className={cn(
            "flex items-center justify-center md:justify-start [&_li]:mx-8 animate-infinite-scroll",
            speed === 'fast' && '[animation-duration:_20s]',
            speed === 'normal' && '[animation-duration:_40s]',
            speed === 'slow' && '[animation-duration:_80s]',
        )}
        aria-hidden="true"
      >
        {items.map((item, index) => (
          <li
            key={`${item.name}-${index}-clone`}
            className="flex-shrink-0 h-20 flex items-center justify-center text-foreground/80"
            title={item.name}
          >
            {item.logo}
          </li>
        ))}
      </ul>
    </div>
  );
}
