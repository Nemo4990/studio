

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
import React, { useState, useMemo, useRef } from 'react';
import type { Agent, Deposit, Withdrawal } from '@/lib/types';
import { Banknote, Copy, Coins, QrCode } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  useUser,
  useFirestore,
  useCollection,
  useMemoFirebase,
  errorEmitter,
  FirestorePermissionError,
  useAuth,
  useDoc,
} from '@/firebase';
import {
  collection,
  doc,
  setDoc,
  serverTimestamp,
  query,
  orderBy,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import { sendEmailVerification } from 'firebase/auth';
import Link from 'next/link';
import { WalletActivity } from '@/components/dashboard/wallet-activity';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

const COIN_TO_USD_RATE = 0.01; // 100 Coins = $1
const USD_TO_NGN_RATE = 1500;
const USD_TO_ETB_RATE = 58;
const CRYPTO_WALLET_ID = 'crypto-wallet';

export default function WalletPage() {
  const { toast } = useToast();
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();
  const auth = useAuth();

  // Local Deposit State
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositProofFile, setDepositProofFile] = useState<File | null>(null);
  const depositProofInputRef = useRef<HTMLInputElement>(null);

  // Local Withdrawal State
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  
  // Crypto Withdrawal State
  const [cryptoWithdrawAmount, setCryptoWithdrawAmount] = useState('');
  const [cryptoWithdrawAddress, setCryptoWithdrawAddress] = useState('');

  const [loading, setLoading] = useState(false);
  const [isSendingVerification, setIsSendingVerification] = useState(false);
  
  const cryptoWalletDocRef = useMemoFirebase(
    () => (firestore ? doc(firestore, 'agents', CRYPTO_WALLET_ID) : null),
    [firestore]
  );
  const { data: cryptoWalletAgent, isLoading: cryptoWalletLoading } = useDoc<Agent>(cryptoWalletDocRef);
  
  const cryptoDepositAddress = cryptoWalletAgent?.accountNumber || 'No address configured';

  // Fetch agents from Firestore
  const agentsQuery = useMemoFirebase(
    () => (firestore && user ? collection(firestore, 'agents') : null),
    [firestore, user]
  );
  const { data: agents, isLoading: agentsLoading } =
    useCollection<Agent>(agentsQuery);

  const filteredAgents = useMemo(() => {
    if (!user?.country || !agents) {
      return [];
    }
    // Filter out the special crypto wallet agent
    return agents.filter((agent) => agent.id !== CRYPTO_WALLET_ID && agent.country === user.country);
  }, [agents, user?.country]);

  const uniqueBankNames = useMemo(() => {
    if (!user?.country || !agents) {
      return [];
    }
    const countryAgents = agents.filter(
      (agent) => agent.id !== CRYPTO_WALLET_ID && agent.country === user.country
    );
    const bankNames = countryAgents.map((agent) => agent.bankName);
    return [...new Set(bankNames)].sort();
  }, [agents, user?.country]);


  const getCurrencyForCountry = (country: string) => {
    if (country === 'Nigeria') return 'NGN';
    if (country === 'Ethiopia') return 'ETB';
    return 'USD';
  };

  const getUsdToLocalRate = (currency: string) => {
    if (currency === 'NGN') return USD_TO_NGN_RATE;
    if (currency === 'ETB') return USD_TO_ETB_RATE;
    return 1; // for USD
  };

  const localCurrency = user ? getCurrencyForCountry(user.country || '') : 'USD';
  const localRate = getUsdToLocalRate(localCurrency);

  const userBalanceInUSD = (user?.walletBalance || 0) * COIN_TO_USD_RATE;
  const userBalanceInLocalCurrency = userBalanceInUSD * localRate;

  const maxWithdrawalInUSD = user ? (user.level || 1) * 100 : 0;
  const maxWithdrawalAmountInLocal = maxWithdrawalInUSD * localRate;

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

  const isLoadingHistory = userLoading || depositsLoading || withdrawalsLoading || cryptoWalletLoading;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied to clipboard!' });
  };

  const handleDepositSubmit = () => {
    if (
      !user ||
      !user.country ||
      !firestore ||
      !selectedAgent ||
      !depositAmount
    ) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please select an agent and enter a deposit amount.',
      });
      return;
    }
    if (!depositProofFile) {
      toast({
        variant: 'destructive',
        title: 'Missing Proof',
        description: 'Please upload a proof of payment.',
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

    const reader = new FileReader();
    reader.readAsDataURL(depositProofFile);

    reader.onload = () => {
      const proofOfPaymentUrl = reader.result as string;

      const userDepositRef = doc(
        collection(firestore, 'users', user.id, 'deposits')
      );
      const topLevelDepositRef = doc(
        collection(firestore, 'deposits'),
        userDepositRef.id
      );

      const depositData: Deposit = {
        id: userDepositRef.id,
        userId: user.id,
        agentId: selectedAgent.id,
        agentName: selectedAgent.name,
        amount: amount,
        currency: getCurrencyForCountry(user.country!),
        status: 'pending' as const,
        proofOfPayment: proofOfPaymentUrl,
        createdAt: serverTimestamp() as any, // Cast for client-side representation
        user: {
          name: user.name || 'Anonymous',
          avatarUrl: user.avatarUrl || '',
        },
      };

      const { proofOfPayment, ...publicDepositData } = depositData;

      const batch = writeBatch(firestore);
      batch.set(userDepositRef, depositData);
      batch.set(topLevelDepositRef, publicDepositData);

      batch
        .commit()
        .then(() => {
          toast({
            title: 'Deposit Request Submitted!',
            description: 'Your request is pending admin approval.',
          });
          setDepositAmount('');
          setSelectedAgent(null);
          setDepositProofFile(null);
          if (depositProofInputRef.current) {
            depositProofInputRef.current.value = '';
          }
        })
        .catch((error) => {
          const permissionError = new FirestorePermissionError({
            path: topLevelDepositRef.path,
            operation: 'create',
            requestResourceData: publicDepositData,
          });
          errorEmitter.emit('permission-error', permissionError);
          toast({
            variant: 'destructive',
            title: 'Submission Failed',
            description:
              'There was a problem submitting your request. Please check permissions.',
          });
        })
        .finally(() => {
          setLoading(false);
        });
    };

    reader.onerror = (error) => {
      console.error('File reading error:', error);
      toast({
        variant: 'destructive',
        title: 'File Read Error',
        description:
          'There was a problem reading your file. Please try another.',
      });
      setLoading(false);
    };
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
        description: 'Please fill out all fields.',
      });
      return;
    }
    if (!user.emailVerified) {
      toast({
        variant: 'destructive',
        title: 'Email Not Verified',
        description: 'Please verify your email before withdrawing.',
      });
      return;
    }
    setLoading(true);

    const amount = parseFloat(withdrawalAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({ variant: 'destructive', title: 'Invalid Amount' });
      setLoading(false);
      return;
    }
    if (amount > userBalanceInLocalCurrency) {
      toast({ variant: 'destructive', title: 'Insufficient Balance' });
      setLoading(false);
      return;
    }
    if (amount > maxWithdrawalAmountInLocal) {
      toast({ variant: 'destructive', title: 'Withdrawal Limit Exceeded' });
      setLoading(false);
      return;
    }

    const userWithdrawalRef = doc(
      collection(firestore, 'users', user.id, 'withdrawals')
    );
    const topLevelWithdrawalRef = doc(
      collection(firestore, 'withdrawals'),
      userWithdrawalRef.id
    );

    const withdrawalData: Withdrawal = {
      id: userWithdrawalRef.id,
      userId: user.id,
      amount: amount,
      currency: localCurrency,
      userBankInfo: { bankName, accountNumber, accountName },
      status: 'pending' as const,
      requestedAt: serverTimestamp() as any, // Cast for client-side representation
      user: {
        name: user.name || 'Anonymous',
        avatarUrl: user.avatarUrl || '',
      },
    };

    const { userBankInfo, ...publicWithdrawalData } = withdrawalData;

    const batch = writeBatch(firestore);
    batch.set(userWithdrawalRef, withdrawalData);
    batch.set(topLevelWithdrawalRef, publicWithdrawalData);

    batch
      .commit()
      .then(() => {
        toast({
          title: 'Withdrawal Request Submitted!',
          description: 'Your request is pending admin approval.',
        });
        setWithdrawalAmount('');
        setBankName('');
        setAccountNumber('');
        setAccountName('');
      })
      .catch((error) => {
        const permissionError = new FirestorePermissionError({
          path: topLevelWithdrawalRef.path,
          operation: 'create',
          requestResourceData: publicWithdrawalData,
        });
        errorEmitter.emit('permission-error', permissionError);
        toast({
          variant: 'destructive',
          title: 'Submission Failed',
          description:
            'There was a problem submitting your request. Please check permissions.',
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleCryptoWithdrawalSubmit = () => {
    if (!cryptoWithdrawAddress || !cryptoWithdrawAmount) {
        toast({ variant: 'destructive', title: 'Missing Information', description: 'Please fill out all fields.' });
        return;
    }
    // Simulate submission
    setLoading(true);
    setTimeout(() => {
        toast({ title: 'Crypto Withdrawal Requested', description: 'Your request is being processed.' });
        setCryptoWithdrawAmount('');
        setCryptoWithdrawAddress('');
        setLoading(false);
    }, 1500);
  }

  const handleSendVerificationEmail = async () => {
    if (!auth.currentUser) return;
    setIsSendingVerification(true);
    try {
      await sendEmailVerification(auth.currentUser);
      toast({
        title: 'Verification Email Sent',
        description: 'Please check your inbox and follow the instructions.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error Sending Email',
        description: error.message || 'Could not send verification email.',
      });
    } finally {
      setIsSendingVerification(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Wallet"
        description="Manage your funds and view your transaction history."
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 order-2 lg:order-1">
          <Tabs defaultValue="crypto-deposit">
            <div className="flex flex-wrap items-center gap-4 mb-4">
               <div className="flex flex-col">
                  <span className="text-sm font-semibold text-muted-foreground mb-1">Crypto</span>
                  <TabsList>
                      <TabsTrigger value="crypto-deposit">Deposit</TabsTrigger>
                      <TabsTrigger value="crypto-withdraw">Withdraw</TabsTrigger>
                  </TabsList>
               </div>
               <div className="flex flex-col">
                  <span className="text-sm font-semibold text-muted-foreground mb-1">Local Currency</span>
                  <TabsList>
                      <TabsTrigger value="local-deposit">Deposit</TabsTrigger>
                      <TabsTrigger value="local-withdraw">Withdraw</TabsTrigger>
                  </TabsList>
               </div>
               <div className="flex flex-col">
                    <span className="text-sm font-semibold text-muted-foreground mb-1 invisible">History</span>
                    <TabsList>
                        <TabsTrigger value="history">History</TabsTrigger>
                    </TabsList>
               </div>
            </div>

            <TabsContent value="crypto-deposit">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Deposit Cryptocurrency</CardTitle>
                        <CardDescription>Send crypto directly to your TaskVerse wallet to upgrade your level.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                         <div className="space-y-2">
                            <Label htmlFor="crypto-select">Select Currency</Label>
                             <Select defaultValue="usdt-trc20">
                                <SelectTrigger id="crypto-select">
                                    <SelectValue placeholder="Select a currency" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="usdt-trc20">USDT (TRC20)</SelectItem>
                                    <SelectItem value="btc" disabled>Bitcoin (BTC)</SelectItem>
                                    <SelectItem value="eth" disabled>Ethereum (ETH)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {cryptoWalletLoading ? (
                          <div className="space-y-4">
                            <Skeleton className="h-4 w-1/3" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-44 w-full" />
                          </div>
                        ) : (
                          <>
                            <div className="space-y-2">
                                <Label>Your USDT (TRC20) Deposit Address</Label>
                                <div className="flex items-center gap-2">
                                    <Input readOnly value={cryptoDepositAddress} className="font-mono" />
                                    <Button variant="ghost" size="icon" onClick={() => handleCopy(cryptoDepositAddress)}>
                                        <Copy />
                                    </Button>
                                </div>
                            </div>
                            <div className="flex flex-col items-center gap-4 text-center p-4 rounded-lg bg-secondary">
                                 <img src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${cryptoDepositAddress}&bgcolor=292d3e&color=ffffff&qzone=1`} alt="QR Code" width="160" height="160" />
                                 <p className="text-sm text-muted-foreground">Scan QR code to deposit</p>
                            </div>
                          </>
                        )}
                        <Alert variant="destructive">
                            <QrCode className="h-4 w-4" />
                            <AlertTitle>Important: Read Before Depositing</AlertTitle>
                            <AlertDescription>
                                Only send USDT assets on the TRC20 (Tron) network to this address. Sending any other asset or using a different network will result in the permanent loss of your funds.
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="crypto-withdraw">
                 <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Withdraw Cryptocurrency</CardTitle>
                        <CardDescription>Withdraw your Coins as cryptocurrency to an external wallet.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {user && (
                            <div className="rounded-lg border p-4">
                                <p className="text-sm text-muted-foreground">Available Balance</p>
                                <p className="text-lg font-bold flex items-center gap-2">
                                <Coins className="size-5 text-amber-500" />
                                {(user.walletBalance || 0).toLocaleString()} Coins
                                <span className="text-sm text-muted-foreground">
                                    (≈ ${userBalanceInUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                                </span>
                                </p>
                            </div>
                        )}
                         <div className="space-y-2">
                            <Label>Withdraw As</Label>
                            <Select defaultValue="usdt-trc20">
                                <SelectTrigger>
                                    <SelectValue placeholder="Select crypto" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="usdt-trc20">USDT (TRC20)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="crypto-withdraw-amount">Amount to Withdraw (Coins)</Label>
                            <Input id="crypto-withdraw-amount" type="number" placeholder="e.g., 10000" value={cryptoWithdrawAmount} onChange={(e) => setCryptoWithdrawAmount(e.target.value)} />
                             <p className="text-xs text-muted-foreground">100 Coins = $1.00 USD. A network fee will be applied during processing.</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="crypto-withdraw-address">Destination Wallet Address</Label>
                            <Input id="crypto-withdraw-address" placeholder="Enter your USDT (TRC20) address" value={cryptoWithdrawAddress} onChange={(e) => setCryptoWithdrawAddress(e.target.value)} />
                        </div>
                        <Button className="w-full" onClick={handleCryptoWithdrawalSubmit} disabled={loading}>
                            {loading ? 'Submitting...' : 'Request Crypto Withdrawal'}
                        </Button>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="local-deposit">
              <Card>
                <CardHeader>
                  <CardTitle className="font-headline">Make a Local Deposit</CardTitle>
                  <CardDescription>
                    Making a deposit increases your user level, unlocking access
                    to more rewarding tasks. Your wallet balance (Coins) is
                    earned from completing tasks.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {user && !user.country ? (
                    <Card className="border-dashed border-2 p-6 text-center bg-secondary">
                      <CardTitle className="text-xl font-headline">
                        Please Set Your Country
                      </CardTitle>
                      <CardDescription className="mt-2">
                        To see available deposit agents, please add your country
                        to your profile.
                      </CardDescription>
                      <Button asChild className="mt-4">
                        <Link href="/dashboard/settings">Go to Settings</Link>
                      </Button>
                    </Card>
                  ) : (
                    <>
                      {agentsLoading && <p>Loading agents...</p>}
                      {!agentsLoading && user?.country && (
                        <div>
                          <Label className="text-muted-foreground">
                            Showing agents for: <span className="font-bold text-lg text-foreground">{user.country}</span>
                          </Label>
                        </div>
                      )}

                      {!agentsLoading && filteredAgents.length > 0 && (
                        <div>
                            <Label htmlFor="agent-select">Select a Deposit Agent</Label>
                            <Select
                                onValueChange={(agentId) => {
                                    const agent = agents?.find(a => a.id === agentId);
                                    setSelectedAgent(agent || null);
                                }}
                                value={selectedAgent?.id || ''}
                            >
                                <SelectTrigger id="agent-select">
                                    <SelectValue placeholder="Choose a verified agent" />
                                </SelectTrigger>
                                <SelectContent>
                                    {filteredAgents.map((agent) => (
                                    <SelectItem key={agent.id} value={agent.id}>
                                        <div className="flex items-center gap-3">
                                            <Banknote className="size-5 text-muted-foreground" />
                                            <div>
                                                <p>{agent.name}</p>
                                                <p className="text-xs text-muted-foreground">{agent.bankName}</p>
                                            </div>
                                        </div>
                                    </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                      )}

                      {!agentsLoading &&
                        user?.country &&
                        filteredAgents.length === 0 && (
                          <div className="text-center text-muted-foreground p-4 border rounded-lg">
                            <p>
                              No deposit agents are currently available for{' '}
                              {user.country}.
                            </p>
                          </div>
                        )}

                      {selectedAgent && (
                        <Card className="bg-secondary">
                          <CardHeader>
                            <CardTitle>
                              Deposit to {selectedAgent.name}
                            </CardTitle>
                            <CardDescription>
                              Make your deposit to the account below and upload
                              proof of payment.
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="space-y-1">
                              <Label>Bank Name</Label>
                              <p className="font-semibold">
                                {selectedAgent.bankName}
                              </p>
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
                              <Label htmlFor="deposit-amount">
                                Amount (
                                {getCurrencyForCountry(selectedAgent.country)})
                              </Label>
                              <Input
                                id="deposit-amount"
                                type="number"
                                placeholder="Enter amount"
                                value={depositAmount}
                                onChange={(e) =>
                                  setDepositAmount(e.target.value)
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="proof">Proof of Payment</Label>
                              <Input
                                id="proof"
                                type="file"
                                accept="image/*"
                                ref={depositProofInputRef}
                                onChange={(e) =>
                                  setDepositProofFile(
                                    e.target.files?.[0] || null
                                  )
                                }
                              />
                            </div>
                            <Button
                              className="w-full"
                              onClick={handleDepositSubmit}
                              disabled={loading}
                            >
                              {loading
                                ? 'Submitting...'
                                : 'Submit Deposit Request'}
                            </Button>
                          </CardContent>
                        </Card>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="local-withdraw">
              <Card>
                <CardHeader>
                  <CardTitle className="font-headline">
                    Request Local Withdrawal
                  </CardTitle>
                  <CardDescription>
                    Convert your Coins to local currency. Your maximum
                    withdrawal amount is based on your current level.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {user && !user.country ? (
                    <Card className="border-dashed border-2 p-6 text-center bg-secondary">
                      <CardTitle className="text-xl font-headline">
                        Please Set Your Country
                      </CardTitle>
                      <CardDescription className="mt-2">
                        To make a withdrawal, please add your country to your
                        profile.
                      </CardDescription>
                      <Button asChild className="mt-4">
                        <Link href="/dashboard/settings">Go to Settings</Link>
                      </Button>
                    </Card>
                  ) : user && !user.emailVerified ? (
                    <Card className="border-dashed border-2 p-6 text-center bg-destructive/10 border-destructive/20">
                      <CardTitle className="text-xl font-headline text-destructive">
                        Email Verification Required
                      </CardTitle>
                      <CardDescription className="mt-2 text-destructive/80">
                        You must verify your email address before you can request
                        a withdrawal. Please check your inbox for a verification
                        link.
                      </CardDescription>
                      <Button
                        className="mt-4"
                        onClick={handleSendVerificationEmail}
                        disabled={isSendingVerification}
                      >
                        {isSendingVerification
                          ? 'Sending...'
                          : 'Resend Verification Email'}
                      </Button>
                    </Card>
                  ) : (
                    <>
                      {user && (
                        <div className="flex justify-between rounded-lg border p-4">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Available Balance
                            </p>
                            <p className="text-lg font-bold flex items-center gap-2">
                              <Coins className="size-5 text-amber-500" />
                              {(user.walletBalance || 0).toLocaleString()}{' '}
                              Coins
                              <span className="text-sm text-muted-foreground">
                                (
                                {userBalanceInLocalCurrency.toLocaleString(
                                  undefined,
                                  {
                                    style: 'currency',
                                    currency: localCurrency,
                                    minimumFractionDigits: 2,
                                  }
                                )}
                                )
                              </span>
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">
                              Max Withdrawal
                            </p>
                            <p className="text-lg font-bold">
                              {maxWithdrawalAmountInLocal.toLocaleString(
                                undefined,
                                {
                                  style: 'currency',
                                  currency: localCurrency,
                                  minimumFractionDigits: 2,
                                }
                              )}
                            </p>
                          </div>
                        </div>
                      )}
                      <div className="space-y-2">
                        <Label htmlFor="withdraw-amount">
                          Amount ({localCurrency})
                        </Label>
                        <Input
                          id="withdraw-amount"
                          type="number"
                          placeholder="100.00"
                          value={withdrawalAmount}
                          onChange={(e) => setWithdrawalAmount(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                          Your balance will be converted from Coins to{' '}
                          {localCurrency} upon withdrawal.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bank-name">Bank Name</Label>
                        <Select
                          value={bankName}
                          onValueChange={setBankName}
                          disabled={uniqueBankNames.length === 0}
                        >
                          <SelectTrigger id="bank-name">
                            <SelectValue placeholder="Select a bank" />
                          </SelectTrigger>
                          <SelectContent>
                            {uniqueBankNames.map((name) => (
                              <SelectItem key={name} value={name}>
                                {name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {user?.country && uniqueBankNames.length === 0 && (
                          <p className="text-xs text-muted-foreground">
                            No banks available for your country at this time.
                          </p>
                        )}
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
                    </>
                  )}
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
                    <div className="h-24 text-center">
                      Loading transaction history...
                    </div>
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
                                        tx.status === 'confirmed' &&
                                          'bg-green-500/80'
                                      )}
                                    >
                                      {tx.status}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    {(
                                      tx.createdAt as unknown as Timestamp
                                    )?.toDate().toLocaleDateString()}
                                  </TableCell>
                                  <TableCell className="text-xs">
                                    {tx.agentName}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        ) : (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            No deposits found.
                          </p>
                        )}
                      </div>

                      <div>
                        <h3 className="mb-4 text-lg font-medium">
                          Withdrawals
                        </h3>
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
                                    {tx.amount.toLocaleString()} {tx.currency}
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
                                        tx.status === 'approved' &&
                                          'bg-green-500/80'
                                      )}
                                    >
                                      {tx.status}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    {(
                                      tx.requestedAt as unknown as Timestamp
                                    )?.toDate().toLocaleDateString()}
                                  </TableCell>
                                  <TableCell className="font-mono text-xs">
                                    {tx.userBankInfo?.bankName} - ...
                                    {tx.userBankInfo?.accountNumber.slice(-4)}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        ) : (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            No withdrawals found.
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        <aside className="w-full lg:order-2">
          <WalletActivity />
        </aside>
      </div>
    </>
  );
}
