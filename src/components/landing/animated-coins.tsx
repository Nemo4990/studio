'use client';
import { cn } from '@/lib/utils';
import { Bitcoin, CircleDollarSign, Coins } from 'lucide-react';
import React, { useEffect, useState } from 'react';

const icons = [
    Bitcoin,
    CircleDollarSign,
    Coins
];

const AnimatedCoins = () => {
  const [coins, setCoins] = useState<any[]>([]);

  useEffect(() => {
    const generateCoins = () => {
      const newCoins = Array.from({ length: 15 }).map((_, i) => {
        const Icon = icons[i % icons.length];
        return {
          id: i,
          Icon,
          style: {
            left: `${Math.random() * 100}%`,
            animationDuration: `${Math.random() * 5 + 8}s`,
            animationDelay: `${Math.random() * 5}s`,
            transform: `scale(${Math.random() * 0.5 + 0.5})`,
          },
        };
      });
      setCoins(newCoins);
    };

    generateCoins();
  }, []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      {coins.map(coin => {
        const { Icon } = coin;
        return (
          <div key={coin.id} className="absolute bottom-0 coin" style={coin.style}>
            <Icon className="size-8 text-accent/20" />
          </div>
        );
      })}
    </div>
  );
};

export default AnimatedCoins;
