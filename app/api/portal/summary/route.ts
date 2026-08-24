import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { apiResponse, handleApiError } from '@/lib/server/http/response';
import { requireAuth } from '@/lib/server/auth/auth-guard';
import { AuthorizationEngine } from '@/lib/server/auth/authorization-engine';

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth(req);

    // Resolve patient matching authenticated portal user
    let patientId: string | undefined;
    try {
      const patient = await AuthorizationEngine.resolveAndAssertPatientAccess(session);
      patientId = patient.id;
    } catch {
      patientId = session.id;
    }

    // Fetch patient invoices and balance from PostgreSQL scoped to patient
    const dbInvoices = await prisma.invoice.findMany({
      where: {
        ...(patientId ? { patientId } : {}),
        isDeleted: false,
      },
      take: 10,
      orderBy: { issueDate: 'desc' },
    });

    const totalBalance = dbInvoices.reduce((s, i) => s + Number(i.balance), 0);
    const paidCount = dbInvoices.filter((i) => i.status === 'Paid').length;
    const nextDueDateInvoice = dbInvoices.find((i) => Number(i.balance) > 0 && i.dueDate >= new Date());

    const portalStats = [
      { id: '1', label: 'Outstanding Balance', value: `$${totalBalance.toFixed(2)}`, change: totalBalance > 0 ? 'Due soon' : 'No balance due', trend: 'neutral' as const, icon: 'Wallet', color: 'text-amber-500' },
      { id: '2', label: 'Paid Invoices', value: paidCount.toString(), change: 'This year', trend: 'up' as const, icon: 'CheckCircle', color: 'text-emerald-500' },
      { id: '3', label: 'Total Invoices', value: dbInvoices.length.toString(), change: 'All time', trend: 'neutral' as const, icon: 'FileText', color: 'text-blue-500' },
      { id: '4', label: 'Next Due Date', value: nextDueDateInvoice ? nextDueDateInvoice.dueDate.toISOString().split('T')[0] : 'None', change: 'Upcoming', trend: 'neutral' as const, icon: 'CalendarClock', color: 'text-indigo-500' },
    ];

    const portalInvoices = dbInvoices.map((inv) => ({
      id: inv.id,
      number: inv.invoiceNumber,
      date: inv.issueDate.toISOString().split('T')[0],
      dueDate: inv.dueDate.toISOString().split('T')[0],
      amount: Number(inv.amount),
      paidAmount: Number(inv.paidAmount),
      balance: Number(inv.balance),
      status: inv.status,
    }));

    return apiResponse({
      portalStats,
      portalInvoices,
      outstandingBalance: totalBalance,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
