'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Printer, Mail, Download, FileText } from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/features/page-header';
import { StatusChip } from '@/components/features/status-chip';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { getInvoiceById } from '@/data/payments';
import { formatCurrency, formatDate } from '@/lib/format';
import type { Invoice } from '@/types';

export default function InvoiceDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice | null>(() => getInvoiceById(params.id) || null);
  const [loading, setLoading] = useState(true);

  const fetchInvoiceDetails = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/payments/invoices/${params.id}`);
      const data = await res.json();
      if (res.ok && data.success && data.data) {
        setInvoice(data.data);
      }
    } catch (err) {
      console.error('[FETCH_INVOICE_DETAILS_ERROR]', err);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchInvoiceDetails();
  }, [fetchInvoiceDetails]);

  if (!invoice && !loading) {
    return (
      <DashboardShell>
        <PageHeader title="Invoice Not Found" breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Payments', href: '/payments' }, { label: 'Invoices', href: '/payments/invoices' }]} />
        <p className="text-muted-foreground">This invoice does not exist.</p>
      </DashboardShell>
    );
  }

  if (!invoice) return null;

  return (
    <DashboardShell>
      <PageHeader
        title={invoice.invoiceNumber}
        description={`${invoice.patientName} · Issued ${formatDate(String(invoice.issueDate))}`}
        breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Payments', href: '/payments' }, { label: 'Invoices', href: '/payments/invoices' }, { label: invoice.invoiceNumber }]}
        actions={
          <>
            <Button variant="outline" onClick={() => router.push('/payments/invoices')}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
            <Button variant="outline"><Printer className="mr-2 h-4 w-4" /> Print</Button>
            <Button variant="outline"><Mail className="mr-2 h-4 w-4" /> Email</Button>
            <Button><Download className="mr-2 h-4 w-4" /> PDF</Button>
          </>
        }
      />

      <div className="mx-auto max-w-3xl">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Invoice {invoice.invoiceNumber}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Issued {formatDate(String(invoice.issueDate))} · Due {formatDate(String(invoice.dueDate))}
                </p>
              </div>
            </div>
            <StatusChip status={invoice.status} />
          </CardHeader>
          <CardContent>
            <div className="mb-6 grid grid-cols-2 gap-4 rounded-lg bg-muted/40 p-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Bill To</p>
                <p className="font-medium">{invoice.patientName}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">From</p>
                <p className="font-medium">MediBill Medical Center</p>
              </div>
            </div>

            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase text-muted-foreground">
                  <th className="pb-2 font-semibold">Description</th>
                  <th className="pb-2 font-semibold">CPT</th>
                  <th className="pb-2 text-center font-semibold">Qty</th>
                  <th className="pb-2 text-right font-semibold">Unit Price</th>
                  <th className="pb-2 text-right font-semibold">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {invoice.items?.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3">{item.description}</td>
                    <td className="py-3 font-mono text-xs">{item.cptCode}</td>
                    <td className="py-3 text-center">{item.quantity}</td>
                    <td className="py-3 text-right">{formatCurrency(Number(item.unitPrice))}</td>
                    <td className="py-3 text-right font-medium">{formatCurrency(Number(item.total))}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <Separator className="my-4" />

            <div className="ml-auto max-w-xs space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatCurrency(Number(invoice.amount))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Paid</span>
                <span className="font-medium text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(Number(invoice.paidAmount))}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between text-base">
                <span className="font-semibold">Balance Due</span>
                <span className="font-bold text-primary">{formatCurrency(Number(invoice.balance))}</span>
              </div>
            </div>

            <div className="mt-8 rounded-lg bg-muted/30 p-4 text-center text-sm text-muted-foreground">
              {invoice.notes}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
