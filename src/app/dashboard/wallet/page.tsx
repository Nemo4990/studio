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
  errorEmitter,
  FirestorePermissionError,
} from '@/firebase';
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  Timestamp,
} from 'firebase/firestore';

type Transaction = (
  | ({ type: 'deposit' } & Deposit)
  | ({ type: 'withdrawal' } & Withdrawal)
) & { date: Date };

const COIN_TO_USD_RATE = 0.01; // 100 Coins = $1

export default function WalletPage() {
  const { toast } = useToast();
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();

  const [selectedCountry, setSelectedCountry] = useState('');
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

  const countries = useMemo(() => agents ? [...new Set(agents.map((agent) => agent.country))] : [], [agents]);
  const filteredAgents = useMemo(() => agents?.filter(
    (agent) => agent.country === selectedCountry
  ) || [], [agents, selectedCountry]);

  const maxWithdrawalAmount = user ? (user.level || 1) * 100 : 0;
  const userBalanceInUSD = (user?.walletBalance || 0) * COIN_TO_USD_RATE;


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

  const transactionHistory: Transaction[] = useMemo(() => {
    if (!deposits || !withdrawals) return [];

    const combined: Transaction[] = [];

    deposits.forEach((d) => {
      const date = (d.createdAt as unknown as Timestamp)?.toDate
        ? (d.createdAt as unknown as Timestamp).toDate()
        : new Date();
      combined.push({ ...d, type: 'deposit', date });
    });

    withdrawals.forEach((w) => {
      const date = (w.requestedAt as unknown as Timestamp)?.toDate
        ? (w.requestedAt as unknown as Timestamp).toDate()
        : new Date();
      combined.push({ ...w, type: 'withdrawal', date });
    });

    return combined.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [deposits, withdrawals]);

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
      agentName: selectedAgent.name,
      amount: amount,
      currency: getCurrencyForCountry(selectedAgent.country),
      status: 'pending',
      proofOfPayment: 'https://example.com/placeholder-proof.png', // Placeholder proof
      createdAt: serverTimestamp(),
    };

    const depositsRef = collection(firestore, 'users', user.id, 'deposits');

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
          description:
            'There was a problem submitting your request. Please try again.',
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleWithdrawalSubmit = () => {
    if (
      !user ||
      !firestore ||
      !withdrawalAmount ||
      !bankName ||
      !accountNumber ||
      !accountName
    ) {
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

    if (amount > userBalanceInUSD) {
      toast({
        variant: 'destructive',
        title: 'Insufficient Balance',
        description: `Your wallet balance is only $${userBalanceInUSD.toFixed(2)}.`,
      });
      setLoading(false);
      return;
    }

    if (amount > maxWithdrawalAmount) {
      toast({
        variant: 'destructive',
        title: 'Withdrawal Limit Exceeded',
        description: `Your current level allows a maximum withdrawal of $${maxWithdrawalAmount.toFixed(
          2
        )}.`,
      });
      setLoading(false);
      return;
    }

    const withdrawalData = {
      userId: user.id,
      amount: amount,
      currency: 'USD',
      userBankInfo: {
        bankName,
        accountNumber,
        accountName,
      },
      status: 'pending',
      requestedAt: serverTimestamp(),
    };

    const withdrawalsRef = collection(
      firestore,
      'users',
      user.id,
      'withdrawals'
    );

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
          description:
            'There was a problem submitting your request. Please try again.',
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
                Select your country to see available local agents for deposits. Approved deposits will be converted to Coins.
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
                  disabled={agentsLoading}
                >
                  <SelectTrigger id="country">
                    <SelectValue placeholder={agentsLoading ? "Loading countries..." : "Select a country"} />
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
                A log of your recent deposits and withdrawals. Rewards for tasks appear after admin approval.
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
                  {isLoadingHistory && (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        Loading transaction history...
                      </TableCell>
                    </TableRow>
                  )}
                  {!isLoadingHistory && transactionHistory.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        No transactions found.
                      </TableCell>
                    </TableRow>
                  )}
                  {!isLoadingHistory &&
                    transactionHistory.map((tx) =>
                      tx.type === 'deposit' ? (
                        <TableRow key={`dep-${tx.id}`}>
                          <TableCell>Deposit</TableCell>
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
                          <TableCell>{tx.date.toLocaleDateString()}</TableCell>
                          <TableCell className="text-xs">
                            via {tx.agentName}
                          </TableCell>
                        </TableRow>
                      ) : (
                        <TableRow key={`wd-${tx.id}`}>
                          <TableCell>Withdrawal</TableCell>
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
                          <TableCell>{tx.date.toLocaleDateString()}</TableCell>
                          <TableCell className="font-mono text-xs">
                            {tx.userBankInfo.bankName} - ...
                            {tx.userBankInfo.accountNumber.slice(-4)}
                          </TableCell>
                        </TableRow>
                      )
                    )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
