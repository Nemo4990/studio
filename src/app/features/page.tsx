'use client';

import PublicFooter from '@/components/landing/public-footer';
import PublicHeader from '@/components/landing/public-header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { Bitcoin, ArrowUp, ArrowDown } from 'lucide-react';
import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { LogoScroller } from '@/components/landing/logo-scroller';

// --- LOGO COMPONENTS ---
const BitcoinLogo = () => (
  <a href="https://bitcoin.org/" target="_blank" rel="noopener noreferrer" aria-label="Bitcoin">
    <Bitcoin className="h-12 w-auto text-yellow-500 transition-transform hover:scale-110" />
  </a>
);

const BinanceLogo = () => (
  <a href="https://www.binance.com/" target="_blank" rel="noopener noreferrer" aria-label="Binance">
    <svg role="img" className="h-12 w-auto transition-transform hover:scale-110" viewBox="0 0 96 96" fill="#F0B90B" xmlns="http://www.w3.org/2000/svg">
      <path d="M48 3.75l-7.25 7.25-7.25-7.25-7.25 7.25L19 3.75 3.75 19l7.25 7.25-7.25 7.25 7.25 7.25-7.25 7.25L19 62l-7.25 7.25 7.25 7.25 7.25-7.25 7.25 7.25L48 92.25l7.25-7.25 7.25 7.25 7.25-7.25 7.25 7.25L92.25 77l-7.25-7.25 7.25-7.25-7.25-7.25 7.25-7.25L77 19l-7.25-7.25 7.25-7.25-7.25-7.25-7.25 7.25L48 3.75zM48 31.5l-9.25-9.25-6 6L42 37.5l-9.25 9.25 6 6L48 43.5l9.25 9.25 6-6L54 37.5l9.25-9.25-6-6L48 31.5z" />
    </svg>
  </a>
);

const EthereumLogo = () => (
  <a href="https://ethereum.org/" target="_blank" rel="noopener noreferrer" aria-label="Ethereum">
    <svg role="img" className="h-12 w-auto text-foreground/90 transition-transform hover:scale-110" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 1.75l-6.25 10.5 6.25 4.25 6.25-4.25L12 1.75zM12 17.5l-6.25-3.5L12 22.25l6.25-8.25-6.25 3.5z"/>
    </svg>
  </a>
);

const PolygonLogo = () => (
  <a href="https://polygon.technology/" target="_blank" rel="noopener noreferrer" aria-label="Polygon">
    <svg role="img" className="h-10 w-auto transition-transform hover:scale-110" viewBox="0 0 24 24" fill="#8247E5" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.23 3.322L6.81 6.447v6.25l5.42-3.125V3.322zm-.015 7.2l-5.42 3.13 5.42 3.124v-6.254zM12 2.19l5.405 3.125-2.703 1.56-2.702-1.56v.001zm5.435 7.332L12 12.647v6.25l5.435-3.125v-6.25z"/>
    </svg>
  </a>
);

const SolanaLogo = () => (
    <a href="https://solana.com/" target="_blank" rel="noopener noreferrer" aria-label="Solana">
        <svg role="img" className="h-8 w-auto transition-transform hover:scale-110" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="sol-gradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#9945FF" />
                    <stop offset="100%" stopColor="#14F195" />
                </linearGradient>
            </defs>
            <path d="M3 4.5h18" stroke="url(#sol-gradient)" strokeWidth="3"/>
            <path d="M3 10.5h18" stroke="url(#sol-gradient)" strokeWidth="3"/>
            <path d="M3 16.5h18" stroke="url(#sol-gradient)" strokeWidth="3"/>
        </svg>
    </a>
);

const CardanoLogo = () => (
  <a href="https://cardano.org/" target="_blank" rel="noopener noreferrer" aria-label="Cardano">
    <svg role="img" className="h-12 w-auto transition-transform hover:scale-110" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" fill="#0D1E40"/>
      <circle cx="12" cy="12" r="6" stroke="#0033AD" strokeWidth="2" fill="white"/>
      <path d="M12 4v2m0 12v2m-6-8H4m14 0h-2m-7.07-4.93l-1.42-1.42M18.36 18.36l-1.42-1.42m-9.9 0l1.42-1.42m8.48-8.48l1.42-1.42" stroke="#0033AD" strokeWidth="2"/>
    </svg>
  </a>
);

const ChainlinkLogo = () => (
    <a href="https://chain.link/" target="_blank" rel="noopener noreferrer" aria-label="Chainlink">
      <svg role="img" className="h-10 w-auto transition-transform hover:scale-110" fill="#375BD2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M9.48 11.23a2.49 2.49 0 100-4.98 2.49 2.49 0 000 4.98zm5.04-5.04a2.49 2.49 0 100-4.98 2.49 2.49 0 000 4.98zM9.48 17.77a2.49 2.49 0 100-4.98 2.49 2.49 0 000 4.98zm5.04-5.04a2.49 2.49 0 100-4.98 2.49 2.49 0 000 4.98z"/>
          <path d="M13.46 9.75l-2.92-2.92.94-.94 2.92 2.92-.94.94zm-2.92 6.5l-2.92-2.92.94-.94 2.92 2.92-.94.94z"/>
      </svg>
    </a>
);

const blockchainPartners = [
  { name: 'Bitcoin', logo: <BitcoinLogo /> },
  { name: 'Ethereum', logo: <EthereumLogo /> },
  { name: 'Binance', logo: <BinanceLogo /> },
  { name: 'Solana', logo: <SolanaLogo /> },
  { name: 'Cardano', logo: <CardanoLogo /> },
  { name: 'Polygon', logo: <PolygonLogo /> },
  { name: 'Chainlink', logo: <ChainlinkLogo /> },
];

// --- MOCK DATA ---
const generateSeries = (start: number, count: number, variance: number) => {
    let current = start;
    return Array.from({ length: count }, (_, i) => {
        current += (Math.random() - 0.5) * variance * (i / count);
        return { name: `Day ${i + 1}`, price: Math.max(0, current) };
    });
};

const chartData = {
    BTC: generateSeries(65000, 30, 5000),
    ETH: generateSeries(3500, 30, 500),
    SOL: generateSeries(150, 30, 40),
};

const marketData = [
    { symbol: 'BTC', name: 'Bitcoin', price: 65123.45, change: 2.5, marketCap: '1.2T', logo: <Bitcoin className="size-6 text-yellow-500"/> },
    { symbol: 'ETH', name: 'Ethereum', price: 3501.23, change: -1.2, marketCap: '420B', logo: <div className="size-6 bg-slate-400 rounded-full"/> },
    { symbol: 'SOL', name: 'Solana', price: 152.89, change: 5.8, marketCap: '70B', logo: <div className="size-6 bg-purple-500 rounded-full"/> },
    { symbol: 'ADA', name: 'Cardano', price: 0.45, change: 1.1, marketCap: '16B', logo: <div className="size-6 bg-blue-700 rounded-full"/> },
    { symbol: 'DOGE', name: 'Dogecoin', price: 0.15, change: -3.4, marketCap: '22B', logo: <div className="size-6 bg-yellow-400 rounded-full"/> },
];

type Coin = 'BTC' | 'ETH' | 'SOL';

// --- PAGE COMPONENTS ---
function LiveCryptoChart() {
    const [activeCoin, setActiveCoin] = useState<Coin>('BTC');
    const data = chartData[activeCoin];
    const latestPrice = data[data.length - 1].price;

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
            <div className="rounded-lg border bg-background/90 p-2 shadow-sm backdrop-blur-sm">
                <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col space-y-1">
                    <span className="text-[0.70rem] uppercase text-muted-foreground">{label}</span>
                    <span className="font-bold text-muted-foreground">${payload[0].value.toLocaleString()}</span>
                </div>
                </div>
            </div>
            );
        }
        return null;
    };
    
    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <CardTitle className="font-headline">{activeCoin} Price Chart</CardTitle>
                        <CardDescription>Live price data for the last 30 days.</CardDescription>
                    </div>
                    <div className="mt-4 sm:mt-0 flex flex-wrap justify-center sm:justify-start gap-2">
                        {(['BTC', 'ETH', 'SOL'] as Coin[]).map(coin => (
                            <Button key={coin} variant={activeCoin === coin ? 'default' : 'outline'} onClick={() => setActiveCoin(coin)}>{coin}</Button>
                        ))}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold text-foreground mb-2">${latestPrice.toLocaleString()}</div>
                 <div className="h-[300px] w-full">
                    <ResponsiveContainer>
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.5)" />
                            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value/1000}k`} />
                            <Tooltip content={<CustomTooltip />} />
                            <Line type="monotone" dataKey="price" strokeWidth={2} stroke="hsl(var(--primary))" dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}

function MarketDataTable() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Live Market</CardTitle>
                <CardDescription>Real-time data for top cryptocurrencies.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Asset</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead className="hidden sm:table-cell">24h Change</TableHead>
                            <TableHead className="hidden sm:table-cell">Market Cap</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {marketData.map(coin => (
                            <TableRow key={coin.symbol}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        {coin.logo}
                                        <div>
                                            <div className="font-medium">{coin.name}</div>
                                            <div className="text-muted-foreground text-sm">{coin.symbol}</div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>${coin.price.toLocaleString()}</TableCell>
                                <TableCell className={cn(coin.change > 0 ? 'text-green-500' : 'text-red-500', "hidden sm:table-cell items-center gap-1")}>
                                    <div className="flex items-center">
                                        {coin.change > 0 ? <ArrowUp className="size-4" /> : <ArrowDown className="size-4" />}
                                        {Math.abs(coin.change)}%
                                    </div>
                                </TableCell>
                                <TableCell className="hidden sm:table-cell">{coin.marketCap}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}


export default function MarketPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicHeader />
      <main className="flex-1">
        <section className="bg-secondary py-20 text-center md:py-32">
          <div className="container">
            <div className="mx-auto max-w-3xl">
              <h1 className="font-headline text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                Explore the Crypto Market
              </h1>
              <p className="mt-6 text-lg leading-8 text-foreground/70">
                Stay ahead of the curve with live data, charts, and insights on your favorite cryptocurrencies.
              </p>
            </div>
          </div>
        </section>

        <section id="live-chart" className="py-20 md:py-24">
            <div className="container">
                <LiveCryptoChart />
            </div>
        </section>
        
        <section id="market-table" className="py-20 md:py-24 bg-secondary">
            <div className="container">
                <MarketDataTable />
            </div>
        </section>

        <section id="collaborations" className="py-20 md:py-32">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Integrated With Top Blockchains
              </h2>
              <p className="mt-6 text-lg leading-8 text-foreground/70">
                We partner with cutting-edge blockchain projects to bring you
                the best opportunities.
              </p>
            </div>
            <div className="mt-16">
                <LogoScroller items={blockchainPartners} speed="normal" />
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
