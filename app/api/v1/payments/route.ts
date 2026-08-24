import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { apiResponse, handleApiError } from '@/lib/server/http/response';
import { requirePermission } from '@/lib/server/auth/auth-guard';

export async function GET(req: NextRequest) {
  try {
    await requirePermission(req, 'payments.view');
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search')?.toLowerCase() || '';

    let dbPayments = await prisma.payment.findMany({
      where: { isDeleted: false },
      include: { allocations: true },
      orderBy: { date: 'desc' },
    });

    if (status && status !== 'all') {
      dbPayments = dbPayments.filter((p) => p.status === status);
    }

    if (search) {
      dbPayments = dbPayments.filter(
        (p) =>
          p.paymentNumber.toLowerCase().includes(search) ||
          p.patientName.toLowerCase().includes(search)
      );
    }

    const formatted = dbPayments.map((p) => ({
      ...p,
      date: p.date.toISOString().split('T')[0],
      amount: Number(p.amount),
    }));

    return apiResponse(formatted, {
      version: 'v1',
      total: formatted.length,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
