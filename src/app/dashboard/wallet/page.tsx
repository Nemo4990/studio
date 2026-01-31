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
import { useUser } from '@/firebase/auth/use-user';
import { useFirestore } from '@/firebase/provider';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function WalletPage() {
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [depositAmount, setDepositAmount] = useState('');
  
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  
  const [loading, setLoading] = useState(false);

  const countries = [...new Set(mockAgents.map((agent) => agent.country))];
  const filteredAgents = mockAgents.filter(
    (agent) => agent.country === selectedCountry
  );
  
  const maxWithdrawalAmount = user ? user.level * 100 : 0;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied to clipboard!' });
  };

  const handleDepositSubmit = () => {
    if (!user || !firestore || !selectedAgent || !depositAmount) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please select an agent and enter a deposit amount.',
      });
      return;
    }
    setLoading(true);

    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
        toast({
            variant: 'destructive',
            title: 'Invalid Amount',
            description: 'Please enter a valid deposit amount.',
        });
        setLoading(false);
        return;
    }

    const depositData = {
      userId: user.id,
      agentId: selectedAgent.id,
      amount: amount,
      currency: selectedAgent.country === 'Nigeria' ? 'NGN' : 'USD', // Simple currency logic
      status: 'pending',
      proofOfPayment: 'https://example.com/placeholder-proof.png', // Placeholder proof
      createdAt: serverTimestamp(),
    };

    const depositsRef = collection(firestore, `users/${user.id}/deposits`);

    addDoc(depositsRef, depositData)
      .then(() => {
        toast({
          title: 'Deposit Request Submitted!',
          description: 'Your request is pending admin approval.',
        });
        setDepositAmount('');
        setSelectedAgent(null);
        setSelectedCountry('');
      })
      .catch((serverError) => {
        const permissionError = new FirestorePermissionError({
          path: depositsRef.path,
          operation: 'create',
          requestResourceData: depositData,
        });
        errorEmitter.emit('permission-error', permissionError);

        toast({
          variant: 'destructive',
          title: 'Submission Failed',
          description: 'There was a problem submitting your request. Please try again.',
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleWithdrawalSubmit = () => {
    if (!user || !firestore || !withdrawalAmount || !bankName || !accountNumber || !accountName) {
        toast({
            variant: 'destructive',
            title: 'Missing Information',
            description: 'Please fill out all fields for the withdrawal request.',
        });
        return;
    }
    setLoading(true);

    const amount = parseFloat(withdrawalAmount);

    if (isNaN(amount) || amount <= 0) {
        toast({
            variant: 'destructive',
            title: 'Invalid Amount',
            description: 'Please enter a valid withdrawal amount.',
        });
        setLoading(false);
        return;
    }

    if (amount > user.walletBalance) {
        toast({
            variant: 'destructive',
            title: 'Insufficient Balance',
            description: `Your wallet balance is only $${user.walletBalance.toFixed(2)}.`,
        });
        setLoading(false);
        return;
    }

    if (amount > maxWithdrawalAmount) {
        toast({
            variant: 'destructive',
            title: 'Withdrawal Limit Exceeded',
            description: `Your current level allows a maximum withdrawal of $${maxWithdrawalAmount.toFixed(2)}.`,
        });
        setLoading(false);
        return;
    }

    const withdrawalData = {
        userId: user.id,
        amount: amount,
        currency: 'USD', // Assuming USD as per the label
        userBankInfo: {
            bankName,
            accountNumber,
            accountName,
        },
        status: 'pending',
        requestedAt: serverTimestamp(),
    };

    const withdrawalsRef = collection(firestore, `users/${user.id}/withdrawals`);

    addDoc(withdrawalsRef, withdrawalData)
        .then(() => {
            toast({
                title: 'Withdrawal Request Submitted!',
                description: 'Your request is pending admin approval.',
            });
            // Reset fields
            setWithdrawalAmount('');
            setBankName('');
            setAccountNumber('');
            setAccountName('');
        })
        .catch((serverError) => {
            const permissionError = new FirestorePermissionError({
                path: withdrawalsRef.path,
                operation: 'create',
                requestResourceData: withdrawalData,
            });
            errorEmitter.emit('permission-error', permissionError);

            toast({
                variant: 'destructive',
                title: 'Submission Failed',
                description: 'There was a problem submitting your request. Please try again.',
            });
        })
        .finally(() => {
            setLoading(false);
        });
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
                      <Input id="deposit-amount" type="number" placeholder="Enter amount" value={depositAmount} onChange={e => setDepositAmount(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="proof">Proof of Payment</Label>
                      <Input id="proof" type="file" />
                    </div>
                    <Button className="w-full" onClick={handleDepositSubmit} disabled={loading}>{loading ? 'Submitting...' : 'Submit Deposit Request'}</Button>
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
                Enter your local bank details to request a withdrawal. Your maximum withdrawal amount is based on your current level.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {user && (
                <div className="flex justify-between rounded-lg border p-4">
                    <div>
                        <p className="text-sm text-muted-foreground">Available Balance</p>
                        <p className="text-lg font-bold">${user.walletBalance.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-muted-foreground">Max Withdrawal</p>
                        <p className="text-lg font-bold">${maxWithdrawalAmount.toFixed(2)}</p>
                    </div>
                </div>
              )}
               <div className="space-y-2">
                <Label htmlFor="withdraw-amount">Amount (USD)</Label>
                <Input id="withdraw-amount" type="number" placeholder="100.00" value={withdrawalAmount} onChange={e => setWithdrawalAmount(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bank-name">Bank Name</Label>
                <Input id="bank-name" placeholder="e.g., Chase Bank" value={bankName} onChange={e => setBankName(e.target.value)}/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="account-number">Account Number</Label>
                <Input id="account-number" placeholder="Your account number" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="account-name">Account Name</Label>
                <Input id="account-name" placeholder="Name on the account" value={accountName} onChange={e => setAccountName(e.target.value)} />
              </div>
              <Button className="w-full" onClick={handleWithdrawalSubmit} disabled={loading || !user}>{loading ? 'Submitting...' : 'Request Withdrawal'}</Button>
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
