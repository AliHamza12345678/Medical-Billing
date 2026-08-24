import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { apiResponse, handleApiError } from '@/lib/server/http/response';
import { requirePermission } from '@/lib/server/auth/auth-guard';

export async function GET(req: NextRequest) {
  try {
    await requirePermission(req, 'reports.view');

    const [allClaims, allPayments] = await Promise.all([
      prisma.claim.findMany({
        where: { isDeleted: false },
        select: { billedAmount: true, paidAmount: true, status: true, submissionDate: true },
      }),
      prisma.payment.findMany({
        where: { isDeleted: false, status: 'Paid' },
        select: { amount: true, date: true },
      }),
    ]);

    const totalRevenue = allPayments.reduce((s, p) => s + Number(p.amount), 0);
    const totalClaims = allClaims.length;
    const totalPaid = allClaims.filter((c) => c.status === 'Paid').length;

    const now = new Date();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyMap: Record<string, { revenue: number; claims: number; paid: number }> = {};

    for (let i = 7; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mName = monthNames[d.getMonth()];
      monthlyMap[mName] = { revenue: 0, claims: 0, paid: 0 };
    }

    allPayments.forEach((p) => {
      const mName = monthNames[p.date.getMonth()];
      if (monthlyMap[mName]) {
        monthlyMap[mName].revenue += Number(p.amount);
      }
    });

    allClaims.forEach((c) => {
      const mName = monthNames[c.submissionDate.getMonth()];
      if (monthlyMap[mName]) {
        monthlyMap[mName].claims += 1;
        if (c.status === 'Paid') {
          monthlyMap[mName].paid += 1;
        }
      }
    });

    const months = Object.keys(monthlyMap);
    const avgMonthly = months.length > 0 ? totalRevenue / months.length : 0;

    const monthlyRevenue = Object.entries(monthlyMap).map(([month, data]) => ({
      month,
      revenue: Number(data.revenue.toFixed(2)),
      claims: data.claims,
      paid: data.paid,
    }));

    const revenueTrend = Object.entries(monthlyMap).map(([month, data]) => ({
      month,
      revenue: Number(data.revenue.toFixed(2)),
      target: Number((data.revenue * 1.1).toFixed(2)),
    }));

    return apiResponse({
      totalRevenue: Number(totalRevenue.toFixed(2)),
      avgMonthly: Number(avgMonthly.toFixed(2)),
      totalClaims,
      totalPaid,
      monthlyRevenue,
      revenueTrend,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
