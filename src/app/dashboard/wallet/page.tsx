'use client';

import PageHeader from '@/components/dashboard/page-header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { deposits, withdrawals, mockAgents } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import React, { useState } from 'react';
import type { Agent } from '@/lib/types';
import { Banknote, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function WalletPage() {
  const { toast } = useToast();
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  const countries = [...new Set(mockAgents.map((agent) => agent.country))];
  const filteredAgents = mockAgents.filter(
    (agent) => agent.country === selectedCountry
  );

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied to clipboard!' });
  };

  return (
    <>
      <PageHeader
        title="Wallet"
        description="Manage your funds and view your transaction history."
      />
      <Tabs defaultValue="deposit">
        <TabsList className="grid w-full grid-cols-3 md:w-[400px]">
          <TabsTrigger value="deposit">Deposit</TabsTrigger>
          <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        <TabsContent value="deposit">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Make a Deposit</CardTitle>
              <CardDescription>
                Select your country to see available local agents for deposits.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Select
                  onValueChange={(value) => {
                    setSelectedCountry(value);
                    setSelectedAgent(null);
                  }}
                  value={selectedCountry}
                >
                  <SelectTrigger id="country">
                    <SelectValue placeholder="Select a country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedCountry && (
                <div>
                  <Label>Available Agents</Label>
                  <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredAgents.map((agent) => (
                      <Card
                        key={agent.id}
                        className={cn('cursor-pointer', selectedAgent?.id === agent.id && 'border-primary ring-2 ring-primary')}
                        onClick={() => setSelectedAgent(agent)}
                      >
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <Banknote className="size-5" /> {agent.name}
                          </CardTitle>
                          <CardDescription>{agent.country}</CardDescription>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {selectedAgent && (
                <Card className="bg-secondary">
                  <CardHeader>
                    <CardTitle>Deposit to {selectedAgent.name}</CardTitle>
                    <CardDescription>
                      Make your deposit to the account below and upload proof of
                      payment.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1">
                      <Label>Bank Name</Label>
                      <p className="font-semibold">{selectedAgent.bankName}</p>
                    </div>
                    <div className="space-y-1">
                      <Label>Account Number</Label>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold font-mono">{selectedAgent.accountNumber}</p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7"
                          onClick={() => handleCopy(selectedAgent.accountNumber)}
                        >
                          <Copy className="size-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="deposit-amount">Amount</Label>
                      <Input id="deposit-amount" type="number" placeholder="Enter amount" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="proof">Proof of Payment</Label>
                      <Input id="proof" type="file" />
                    </div>
                    <Button className="w-full">Submit Deposit Request</Button>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="withdraw">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Request Withdrawal</CardTitle>
              <CardDescription>
                Enter your local bank details to request a withdrawal.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="space-y-2">
                <Label htmlFor="withdraw-amount">Amount (USD)</Label>
                <Input id="withdraw-amount" type="number" placeholder="100.00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bank-name">Bank Name</Label>
                <Input id="bank-name" placeholder="e.g., Chase Bank" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="account-number">Account Number</Label>
                <Input id="account-number" placeholder="Your account number" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="account-name">Account Name</Label>
                <Input id="account-name" placeholder="Name on the account" />
              </div>
              <Button className="w-full">Request Withdrawal</Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">
                Transaction History
              </CardTitle>
              <CardDescription>
                A log of your recent deposits and withdrawals.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deposits.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell>Deposit</TableCell>
                      <TableCell>
                        {d.amount.toLocaleString()} {d.currency}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            d.status === 'confirmed'
                              ? 'default'
                              : d.status === 'failed'
                              ? 'destructive'
                              : 'secondary'
                          }
                          className={cn(d.status === 'confirmed' && 'bg-green-500/80')}
                        >
                          {d.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{d.createdAt.toLocaleDateString()}</TableCell>
                      <TableCell className="text-xs">
                        via {d.agentName}
                      </TableCell>
                    </TableRow>
                  ))}
                  {withdrawals.map((w) => (
                    <TableRow key={w.id}>
                      <TableCell>Withdrawal</TableCell>
                      <TableCell>
                        {w.amount.toLocaleString()} {w.currency}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            w.status === 'approved'
                              ? 'default'
                              : w.status === 'rejected'
                              ? 'destructive'
                              : 'secondary'
                          }
                           className={cn(w.status === 'approved' && 'bg-green-500/80')}
                        >
                          {w.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {w.requestedAt.toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{w.userBankInfo.bankName} - ...{w.userBankInfo.accountNumber.slice(-4)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
