import PageHeader from '@/components/dashboard/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { deposits, withdrawals } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function WalletPage() {
  return (
    <>
      <PageHeader title="Wallet" description="Manage your funds and view your transaction history." />
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
              <CardDescription>Select a cryptocurrency to generate a deposit address.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="crypto">Cryptocurrency</Label>
                <Select>
                  <SelectTrigger id="crypto">
                    <SelectValue placeholder="Select a currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="btc">Bitcoin (BTC)</SelectItem>
                    <SelectItem value="eth">Ethereum (ETH)</SelectItem>
                    <SelectItem value="usdt">Tether (USDT)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button>Generate Deposit Address</Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="withdraw">
        <Card>
            <CardHeader>
              <CardTitle className="font-headline">Request Withdrawal</CardTitle>
              <CardDescription>Enter the amount and your wallet address to request a withdrawal.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (USDT)</Label>
                <Input id="amount" type="number" placeholder="100.00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Your USDT Wallet Address</Label>
                <Input id="address" placeholder="0x..." />
              </div>
              <Button>Request Withdrawal</Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="history">
        <Card>
            <CardHeader>
              <CardTitle className="font-headline">Transaction History</CardTitle>
              <CardDescription>A log of your recent deposits and withdrawals.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Tx Hash / Address</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deposits.map(d => (
                    <TableRow key={d.id}>
                      <TableCell>Deposit</TableCell>
                      <TableCell>{d.amount} {d.currency}</TableCell>
                      <TableCell>
                        <Badge variant={d.status === 'confirmed' ? 'default' : d.status === 'failed' ? 'destructive' : 'secondary'} className={cn(d.status === 'confirmed' && 'bg-green-500/80')}>{d.status}</Badge>
                      </TableCell>
                      <TableCell>{d.timestamp.toLocaleDateString()}</TableCell>
                      <TableCell className="font-mono text-xs">{d.txHash}</TableCell>
                    </TableRow>
                  ))}
                  {withdrawals.map(w => (
                    <TableRow key={w.id}>
                      <TableCell>Withdrawal</TableCell>
                      <TableCell>{w.amount} {w.currency}</TableCell>
                      <TableCell>
                      <Badge variant={w.status === 'approved' ? 'default' : w.status === 'rejected' ? 'destructive' : 'secondary'} className={cn(w.status === 'approved' && 'bg-green-500/80')}>{w.status}</Badge>
                      </TableCell>
                      <TableCell>{w.timestamp.toLocaleDateString()}</TableCell>
                      <TableCell className="font-mono text-xs">{w.walletAddress}</TableCell>
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
