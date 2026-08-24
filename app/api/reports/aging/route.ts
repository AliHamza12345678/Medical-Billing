import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { apiResponse, handleApiError } from '@/lib/server/http/response';
import { requirePermission } from '@/lib/server/auth/auth-guard';

export async function GET(req: NextRequest) {
  try {
    await requirePermission(req, 'reports.view');
    const now = new Date();

    const unpaidClaims = await prisma.claim.findMany({
      where: {
        isDeleted: false,
        status: { in: ['Submitted', 'Pending', 'Denied', 'Rejected'] },
      },
      select: {
        billedAmount: true,
        paidAmount: true,
        submissionDate: true,
      },
    });

    let b0_30 = { count: 0, amount: 0 };
    let b31_60 = { count: 0, amount: 0 };
    let b61_90 = { count: 0, amount: 0 };
    let b90_plus = { count: 0, amount: 0 };

    unpaidClaims.forEach((c) => {
      const balance = Number(c.billedAmount) - Number(c.paidAmount);
      const days = Math.floor((now.getTime() - c.submissionDate.getTime()) / (1000 * 60 * 60 * 24));

      if (days <= 30) {
        b0_30.count += 1;
        b0_30.amount += balance;
      } else if (days <= 60) {
        b31_60.count += 1;
        b31_60.amount += balance;
      } else if (days <= 90) {
        b61_90.count += 1;
        b61_90.amount += balance;
      } else {
        b90_plus.count += 1;
        b90_plus.amount += balance;
      }
    });

    const totalAmount = b0_30.amount + b31_60.amount + b61_90.amount + b90_plus.amount;

    const outstandingBuckets = [
      { bucket: '0-30 days', amount: Math.round(b0_30.amount) },
      { bucket: '31-60 days', amount: Math.round(b31_60.amount) },
      { bucket: '61-90 days', amount: Math.round(b61_90.amount) },
      { bucket: '90+ days', amount: Math.round(b90_plus.amount) },
    ];

    const agingReport = [
      { bucket: '0-30 days', claims: b0_30.count, amount: Math.round(b0_30.amount), percent: totalAmount > 0 ? Number(((b0_30.amount / totalAmount) * 100).toFixed(1)) : 0 },
      { bucket: '31-60 days', claims: b31_60.count, amount: Math.round(b31_60.amount), percent: totalAmount > 0 ? Number(((b31_60.amount / totalAmount) * 100).toFixed(1)) : 0 },
      { bucket: '61-90 days', claims: b61_90.count, amount: Math.round(b61_90.amount), percent: totalAmount > 0 ? Number(((b61_90.amount / totalAmount) * 100).toFixed(1)) : 0 },
      { bucket: '90+ days', claims: b90_plus.count, amount: Math.round(b90_plus.amount), percent: totalAmount > 0 ? Number(((b90_plus.amount / totalAmount) * 100).toFixed(1)) : 0 },
    ];

    return apiResponse({
      outstandingBuckets,
      agingReport,
      totalAmount,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
