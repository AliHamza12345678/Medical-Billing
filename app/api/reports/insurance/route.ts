import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { apiResponse, handleApiError } from '@/lib/server/http/response';
import { requirePermission } from '@/lib/server/auth/auth-guard';

export async function GET(req: NextRequest) {
  try {
    await requirePermission(req, 'reports.view');

    const dbClaims = await prisma.claim.findMany({
      where: { isDeleted: false },
      select: {
        insuranceProvider: true,
        status: true,
        billedAmount: true,
        paidAmount: true,
        submissionDate: true,
      },
    });

    const now = Date.now();
    const payerMap = new Map<string, {
      claims: number;
      paid: number;
      denied: number;
      revenue: number;
      totalDays: number;
    }>();

    dbClaims.forEach((c) => {
      const payer = c.insuranceProvider || 'Unknown Payer';
      if (!payerMap.has(payer)) {
        payerMap.set(payer, {
          claims: 0,
          paid: 0,
          denied: 0,
          revenue: 0,
          totalDays: 0,
        });
      }

      const entry = payerMap.get(payer)!;
      entry.claims += 1;
      entry.revenue += Number(c.paidAmount);

      const days = Math.floor((now - c.submissionDate.getTime()) / (1000 * 60 * 60 * 24));
      entry.totalDays += days > 0 ? days : 0;

      if (c.status === 'Paid') entry.paid += 1;
      else if (c.status === 'Denied' || c.status === 'Rejected') entry.denied += 1;
    });

    const formatted = Array.from(payerMap.entries()).map(([provider, data], idx) => {
      const denialRate = data.claims > 0 ? Number(((data.denied / data.claims) * 100).toFixed(1)) : 0;
      const avgDays = data.claims > 0 ? Math.round(data.totalDays / data.claims) : 0;

      return {
        id: `ins-rep-${idx + 1}`,
        provider,
        claims: data.claims,
        paid: data.paid,
        denied: data.denied,
        revenue: data.revenue,
        avgDays,
        denialRate,
      };
    });

    return apiResponse(formatted, {
      total: formatted.length,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
