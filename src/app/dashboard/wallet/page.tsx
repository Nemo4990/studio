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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import React, { useState, useMemo } from 'react';
import type { Agent, Deposit, Withdrawal } from '@/lib/types';
import { Banknote, Copy, Coins } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  useUser,
  useFirestore,
  useCollection,
  useMemoFirebase,
} from '@/firebase';
import {
  collection,
  doc,
  setDoc,
  serverTimestamp,
  query,
  orderBy,
  Timestamp,
  where,
  writeBatch,
} from 'firebase/firestore';
import Link from 'next/link';

const COIN_TO_USD_RATE = 0.01; // 100 Coins = $1

export default function WalletPage() {
  const { toast } = useToast();
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();

  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [depositAmount, setDepositAmount] = useState('');

  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');

  const [loading, setLoading] = useState(false);

  // Fetch agents from Firestore
  const agentsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'agents') : null, [firestore]);
  const { data: agents, isLoading: agentsLoading } = useCollection<Agent>(agentsQuery);

  const filteredAgents = useMemo(() => {
    if (!user?.country || !agents) {
        return [];
    }
    return agents.filter((agent) => agent.country === user.country);
  }, [agents, user?.country]);


  const maxWithdrawalAmount = user ? (user.level || 1) * 100 : 0;
  const userBalanceInUSD = (user?.walletBalance || 0) * COIN_TO_USD_RATE;


  // Query user-specific sub-collections for their history
  const depositsQuery = useMemoFirebase(
    () =>
      user && firestore
        ? query(
            collection(firestore, 'users', user.id, 'deposits'),
            orderBy('createdAt', 'desc')
          )
        : null,
    [user, firestore]
  );
  const { data: deposits, isLoading: depositsLoading } =
    useCollection<Deposit>(depositsQuery);

  const withdrawalsQuery = useMemoFirebase(
    () =>
      user && firestore
        ? query(
            collection(firestore, 'users', user.id, 'withdrawals'),
            orderBy('requestedAt', 'desc')
          )
        : null,
    [user, firestore]
  );
  const { data: withdrawals, isLoading: withdrawalsLoading } =
    useCollection<Withdrawal>(withdrawalsQuery);

  const isLoadingHistory = userLoading || depositsLoading || withdrawalsLoading;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied to clipboard!' });
  };
  
  const getCurrencyForCountry = (country: string) => {
    if (country === 'Nigeria') return 'NGN';
    if (country === 'Ethiopia') return 'ETB';
    return 'USD';
  };

  const handleDepositSubmit = async () => {
    if (!user || !user.country || !firestore || !selectedAgent || !depositAmount) {
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
    
    // Create a reference for the new document in BOTH collections
    const userDepositRef = doc(collection(firestore, 'users', user.id, 'deposits'));
    const topLevelDepositRef = doc(collection(firestore, 'deposits'), userDepositRef.id);

    const depositData = {
      id: userDepositRef.id,
      userId: user.id,
      agentId: selectedAgent.id,
      agentName: selectedAgent.name,
      amount: amount,
      currency: getCurrencyForCountry(user.country),
      status: 'pending' as const,
      proofOfPayment: 'https://example.com/placeholder-proof.png', // Placeholder proof
      createdAt: serverTimestamp(),
    };
    
    try {
      // Use a batch to write to both locations atomically
      const batch = writeBatch(firestore);
      batch.set(userDepositRef, depositData);
      batch.set(topLevelDepositRef, depositData);
      await batch.commit();

      toast({
        title: 'Deposit Request Submitted!',
        description: 'Your request is pending admin approval.',
      });
      setDepositAmount('');
      setSelectedAgent(null);
    } catch (error) {
       console.error("Deposit submission failed:", error);
       toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: 'There was a problem submitting your request. Please check security rules and try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawalSubmit = async () => {
    if (!user || !firestore || !withdrawalAmount || !bankName || !accountNumber || !accountName) {
      toast({ variant: 'destructive', title: 'Missing Information', description: 'Please fill out all fields.' });
      return;
    }
    setLoading(true);

    const amount = parseFloat(withdrawalAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({ variant: 'destructive', title: 'Invalid Amount' });
      setLoading(false);
      return;
    }
    if (amount > userBalanceInUSD) {
      toast({ variant: 'destructive', title: 'Insufficient Balance' });
      setLoading(false);
      return;
    }
    if (amount > maxWithdrawalAmount) {
      toast({ variant: 'destructive', title: 'Withdrawal Limit Exceeded' });
      setLoading(false);
      return;
    }

    const userWithdrawalRef = doc(collection(firestore, 'users', user.id, 'withdrawals'));
    const topLevelWithdrawalRef = doc(collection(firestore, 'withdrawals'), userWithdrawalRef.id);

    const withdrawalData = {
      id: userWithdrawalRef.id,
      userId: user.id,
      amount: amount,
      currency: 'USD',
      userBankInfo: { bankName, accountNumber, accountName },
      status: 'pending' as const,
      requestedAt: serverTimestamp(),
    };

    try {
      const batch = writeBatch(firestore);
      batch.set(userWithdrawalRef, withdrawalData);
      batch.set(topLevelWithdrawalRef, withdrawalData);
      await batch.commit();

      toast({
        title: 'Withdrawal Request Submitted!',
        description: 'Your request is pending admin approval.',
      });
      setWithdrawalAmount('');
      setBankName('');
      setAccountNumber('');
      setAccountName('');
    } catch (error) {
      console.error("Withdrawal submission failed:", error);
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: 'There was a problem submitting your request. Please check security rules and try again.',
      });
    } finally {
      setLoading(false);
    }
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
                Agents for your country are shown below. Approved deposits will be converted to Coins.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
               {user && !user.country ? (
                <Card className="border-dashed border-2 p-6 text-center bg-secondary">
                    <CardTitle className="text-xl font-headline">Please Set Your Country</CardTitle>
                    <CardDescription className="mt-2">To see available deposit agents, please add your country to your profile.</CardDescription>
                    <Button asChild className="mt-4">
                        <Link href="/dashboard/settings">Go to Settings</Link>
                    </Button>
                </Card>
              ) : (
                <>
                  {agentsLoading && <p>Loading agents...</p>}
                  {!agentsLoading && user?.country && (
                    <div>
                      <Label className="text-muted-foreground">Showing agents for:</Label>
                      <p className="font-bold text-lg">{user.country}</p>
                    </div>
                  )}

                  {!agentsLoading && filteredAgents.length > 0 && (
                    <div>
                      <Label>Available Agents</Label>
                      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredAgents.map((agent) => (
                          <Card
                            key={agent.id}
                            className={cn(
                              'cursor-pointer',
                              selectedAgent?.id === agent.id &&
                                'border-primary ring-2 ring-primary'
                            )}
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

                  {!agentsLoading && user?.country && filteredAgents.length === 0 && (
                    <div className="text-center text-muted-foreground p-4 border rounded-lg">
                      <p>No deposit agents are currently available for {user.country}.</p>
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
                            <p className="font-semibold font-mono">
                              {selectedAgent.accountNumber}
                            </p>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7"
                              onClick={() =>
                                handleCopy(selectedAgent.accountNumber)
                              }
                            >
                              <Copy className="size-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="deposit-amount">Amount ({getCurrencyForCountry(selectedAgent.country)})</Label>
                          <Input
                            id="deposit-amount"
                            type="number"
                            placeholder="Enter amount"
                            value={depositAmount}
                            onChange={(e) => setDepositAmount(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="proof">Proof of Payment</Label>
                          <Input id="proof" type="file" />
                        </div>
                        <Button
                          className="w-full"
                          onClick={handleDepositSubmit}
                          disabled={loading}
                        >
                          {loading ? 'Submitting...' : 'Submit Deposit Request'}
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="withdraw">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">
                Request Withdrawal
              </CardTitle>
              <CardDescription>
                Convert your Coins to local currency. Your maximum withdrawal amount is based on your current level.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {user && (
                <div className="flex justify-between rounded-lg border p-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Available Balance
                    </p>
                    <p className="text-lg font-bold flex items-center gap-2">
                      <Coins className="size-5 text-amber-500" />
                      {(user.walletBalance || 0).toLocaleString()} Coins
                      <span className="text-sm text-muted-foreground">
                        (${userBalanceInUSD.toFixed(2)})
                      </span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      Max Withdrawal
                    </p>
                    <p className="text-lg font-bold">
                      ${maxWithdrawalAmount.toFixed(2)}
                    </p>
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="withdraw-amount">Amount (USD)</Label>
                <Input
                  id="withdraw-amount"
                  type="number"
                  placeholder="100.00"
                  value={withdrawalAmount}
                  onChange={(e) => setWithdrawalAmount(e.target.value)}
                />
                 <p className="text-xs text-muted-foreground">
                    Conversion: 100 Coins = $1.00 USD
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bank-name">Bank Name</Label>
                <Input
                  id="bank-name"
                  placeholder="e.g., Chase Bank"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="account-number">Account Number</Label>
                <Input
                  id="account-number"
                  placeholder="Your account number"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="account-name">Account Name</Label>
                <Input
                  id="account-name"
                  placeholder="Name on the account"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                />
              </div>
              <Button
                className="w-full"
                onClick={handleWithdrawalSubmit}
                disabled={loading || !user}
              >
                {loading ? 'Submitting...' : 'Request Withdrawal'}
              </Button>
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
            <CardContent className="space-y-8">
              {isLoadingHistory ? (
                 <div className="h-24 text-center">Loading transaction history...</div>
              ) : (
                <>
                  <div>
                    <h3 className="mb-4 text-lg font-medium">Deposits</h3>
                    {deposits && deposits.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Agent</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {deposits.map((tx) => (
                            <TableRow key={`dep-${tx.id}`}>
                              <TableCell>
                                {tx.amount.toLocaleString()} {tx.currency}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    tx.status === 'confirmed'
                                      ? 'default'
                                      : tx.status === 'failed'
                                      ? 'destructive'
                                      : 'secondary'
                                  }
                                  className={cn(
                                    tx.status === 'confirmed' && 'bg-green-500/80'
                                  )}
                                >
                                  {tx.status}
                                </Badge>
                              </TableCell>
                              <TableCell>{(tx.createdAt as unknown as Timestamp)?.toDate().toLocaleDateString()}</TableCell>
                              <TableCell className="text-xs">
                                {tx.agentName}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">No deposits found.</p>
                    )}
                  </div>

                  <div>
                    <h3 className="mb-4 text-lg font-medium">Withdrawals</h3>
                    {withdrawals && withdrawals.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Bank</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {withdrawals.map((tx) => (
                            <TableRow key={`wd-${tx.id}`}>
                              <TableCell>
                                ${tx.amount.toLocaleString()} {tx.currency}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    tx.status === 'approved'
                                      ? 'default'
                                      : tx.status === 'rejected'
                                      ? 'destructive'
                                      : 'secondary'
                                  }
                                  className={cn(
                                    tx.status === 'approved' && 'bg-green-500/80'
                                  )}
                                >
                                  {tx.status}
                                </Badge>
                              </TableCell>
                              <TableCell>{(tx.requestedAt as unknown as Timestamp)?.toDate().toLocaleDateString()}</TableCell>
                              <TableCell className="font-mono text-xs">
                                {tx.userBankInfo.bankName} - ...
                                {tx.userBankInfo.accountNumber.slice(-4)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                       <p className="text-sm text-muted-foreground text-center py-4">No withdrawals found.</p>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
