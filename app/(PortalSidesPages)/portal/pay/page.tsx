'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { CreditCard, Lock, ShieldCheck, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { PortalLayout } from '@/components/layout/portal-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/lib/format';

const schema = z.object({
  cardName: z.string().min(1, 'Name on card is required'),
  cardNumber: z.string().min(15, 'Enter a valid card number'),
  expiry: z.string().min(5, 'MM/YY format required'),
  cvv: z.string().min(3, '3-digit CVV'),
  amount: z.coerce.number().min(1, 'Enter an amount'),
});

type FormValues = z.infer<typeof schema>;

export default function PortalPayPage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [balance, setBalance] = React.useState(180);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { amount: 180 },
  });

  const amount = watch('amount');

  React.useEffect(() => {
    fetch('/api/portal/summary')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.outstandingBalance !== undefined) {
          setBalance(data.data.outstandingBalance);
        }
      })
      .catch((err) => console.error('[FETCH_PORTAL_BAL_ERROR]', err));
  }, []);

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      const res = await fetch('/api/portal/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Payment processing failed');
      }

      toast.success('Payment successful', {
        description: `${formatCurrency(Number(values.amount))} payment [${data.data.paymentNumber}] has been processed.`,
      });
      router.push('/portal');
    } catch (err: any) {
      toast.error('Payment Error', { description: err.message || 'Unable to process card payment.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PortalLayout>
      <button onClick={() => router.push('/portal')} className="mb-4 flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to dashboard
      </button>

      <div className="mx-auto max-w-2xl">
        <Card className="mb-6 bg-primary text-primary-foreground">
          <CardContent className="flex items-center justify-between py-5">
            <div>
              <p className="text-sm text-primary-foreground/70">Outstanding Balance</p>
              <p className="text-3xl font-bold">{formatCurrency(balance)}</p>
            </div>
            <CreditCard className="h-10 w-10 opacity-50" />
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Payment Details</CardTitle>
              <CardDescription>Enter your payment information below</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Payment Amount ($)</Label>
                <Input type="number" step="0.01" {...register('amount')} />
                {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
              </div>
              <Separator />
              <div className="space-y-1.5">
                <Label>Name on Card</Label>
                <Input {...register('cardName')} placeholder="James Smith" />
                {errors.cardName && <p className="text-xs text-destructive">{errors.cardName.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Card Number</Label>
                <div className="relative">
                  <CreditCard className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input className="pl-9" {...register('cardNumber')} placeholder="1234 5678 9012 3456" />
                </div>
                {errors.cardNumber && <p className="text-xs text-destructive">{errors.cardNumber.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Expiry</Label>
                  <Input {...register('expiry')} placeholder="MM/YY" />
                  {errors.expiry && <p className="text-xs text-destructive">{errors.expiry.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>CVV</Label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input className="pl-9" {...register('cvv')} placeholder="123" />
                  </div>
                  {errors.cvv && <p className="text-xs text-destructive">{errors.cvv.message}</p>}
                </div>
              </div>

              <div className="rounded-lg bg-muted/40 p-3 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Payment Amount</span><span className="font-medium">{formatCurrency(Number(amount) || 0)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Processing Fee</span><span className="font-medium">$0.00</span></div>
                <Separator className="my-2" />
                <div className="flex justify-between text-base"><span className="font-semibold">Total</span><span className="font-bold">{formatCurrency(Number(amount) || 0)}</span></div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Processing...' : <>Pay {formatCurrency(Number(amount) || 0)}</>}
              </Button>

              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5" />
                Secured with 256-bit SSL encryption
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </PortalLayout>
  );
}
