import { prisma } from '@/lib/db';

export class DashboardAnalyticsService {
  static async getDashboardMetrics() {
    const now = new Date();

    // 1. Fetch total counts from PostgreSQL
    const [
      totalPatients,
      totalClaims,
      paidClaims,
      deniedClaims,
      rejectedClaims,
      pendingClaims,
      allClaims,
      allPayments,
      recentAuditLogs,
    ] = await Promise.all([
      prisma.patient.count({ where: { isDeleted: false, status: 'Active' } }),
      prisma.claim.count({ where: { isDeleted: false } }),
      prisma.claim.count({ where: { isDeleted: false, status: 'Paid' } }),
      prisma.claim.count({ where: { isDeleted: false, status: 'Denied' } }),
      prisma.claim.count({ where: { isDeleted: false, status: 'Rejected' } }),
      prisma.claim.count({ where: { isDeleted: false, status: 'Pending' } }),
      prisma.claim.findMany({
        where: { isDeleted: false },
        select: {
          id: true,
          billedAmount: true,
          paidAmount: true,
          submissionDate: true,
          status: true,
        },
      }),
      prisma.payment.findMany({
        where: { isDeleted: false, status: 'Paid' },
        select: { amount: true, date: true },
      }),
      prisma.auditLog.findMany({
        take: 5,
        orderBy: { timestamp: 'desc' },
      }),
    ]);

    // 2. Financial Aggregations
    const totalBilled = allClaims.reduce((s, c) => s + Number(c.billedAmount), 0);
    const totalCollected = allPayments.reduce((s, p) => s + Number(p.amount), 0);
    const outstandingAR = totalBilled - totalCollected > 0 ? totalBilled - totalCollected : 0;

    const cleanClaimRate = totalClaims > 0 ? (((totalClaims - (deniedClaims + rejectedClaims)) / totalClaims) * 100).toFixed(1) : '0.0';
    const denialRate = totalClaims > 0 ? ((deniedClaims / totalClaims) * 100).toFixed(1) : '0.0';
    const collectionRate = totalBilled > 0 ? ((totalCollected / totalBilled) * 100).toFixed(1) : '0.0';

    // Average Days in AR
    const totalAgeDays = allClaims.reduce((s, c) => {
      const days = Math.floor((now.getTime() - c.submissionDate.getTime()) / (1000 * 60 * 60 * 24));
      return s + (days > 0 ? days : 0);
    }, 0);
    const avgDaysInAR = totalClaims > 0 ? Math.round(totalAgeDays / totalClaims) : 0;

    // 3. Stat Cards Output (matches frontend structure)
    const dashboardStats = [
      { id: '1', label: 'Total Patients', value: totalPatients.toString(), change: '0%', trend: 'neutral' as const, icon: 'Users', color: 'text-blue-500' },
      { id: '2', label: 'Total Revenue', value: `$${totalBilled.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, change: '0%', trend: 'neutral' as const, icon: 'DollarSign', color: 'text-emerald-500' },
      { id: '3', label: 'Outstanding A/R', value: `$${outstandingAR.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, change: '0%', trend: 'neutral' as const, icon: 'AlertCircle', color: 'text-amber-500' },
      { id: '4', label: 'Claim Volume', value: totalClaims.toString(), change: '0%', trend: 'neutral' as const, icon: 'FileText', color: 'text-indigo-500' },
      { id: '5', label: 'Paid Claims', value: paidClaims.toString(), change: '0%', trend: 'neutral' as const, icon: 'CheckCircle', color: 'text-emerald-500' },
      { id: '6', label: 'Pending Claims', value: pendingClaims.toString(), change: '0%', trend: 'neutral' as const, icon: 'Clock', color: 'text-amber-500' },
      { id: '7', label: 'Denied Claims', value: deniedClaims.toString(), change: '0%', trend: 'neutral' as const, icon: 'XCircle', color: 'text-rose-500' },
    ];

    // 4. Monthly Revenue & Claims Breakdown by actual Month (last 8 months)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyRevenueMap: Record<string, { revenue: number; claims: number; paid: number }> = {};

    for (let i = 7; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mName = monthNames[d.getMonth()];
      monthlyRevenueMap[mName] = { revenue: 0, claims: 0, paid: 0 };
    }

    allPayments.forEach((p) => {
      const mName = monthNames[p.date.getMonth()];
      if (monthlyRevenueMap[mName]) {
        monthlyRevenueMap[mName].revenue += Number(p.amount);
      }
    });

    allClaims.forEach((c) => {
      const mName = monthNames[c.submissionDate.getMonth()];
      if (monthlyRevenueMap[mName]) {
        monthlyRevenueMap[mName].claims += 1;
        if (c.status === 'Paid') {
          monthlyRevenueMap[mName].paid += 1;
        }
      }
    });

    const monthlyRevenue = Object.entries(monthlyRevenueMap).map(([month, data]) => ({
      month,
      revenue: Math.round(data.revenue),
      claims: data.claims,
      paid: data.paid,
    }));

    // 5. Claim Status Breakdown
    const claimStatusBreakdown = [
      { name: 'Paid', value: paidClaims, color: 'hsl(142, 76%, 36%)' },
      { name: 'Pending', value: pendingClaims, color: 'hsl(38, 92%, 50%)' },
      { name: 'Submitted', value: Math.max(0, totalClaims - paidClaims - pendingClaims - deniedClaims - rejectedClaims), color: 'hsl(217, 91%, 60%)' },
      { name: 'Denied', value: deniedClaims, color: 'hsl(0, 84%, 60%)' },
      { name: 'Rejected', value: rejectedClaims, color: 'hsl(280, 65%, 60%)' },
    ];

    // 6. Real Aging Buckets (0-30, 31-60, 61-90, 90+) calculated from claim submission dates
    let bucket0_30 = 0;
    let bucket31_60 = 0;
    let bucket61_90 = 0;
    let bucket90_plus = 0;

    allClaims.forEach((c) => {
      if (c.status !== 'Paid') {
        const balance = Number(c.billedAmount) - Number(c.paidAmount);
        const age = Math.floor((now.getTime() - c.submissionDate.getTime()) / (1000 * 60 * 60 * 24));
        if (age <= 30) bucket0_30 += balance;
        else if (age <= 60) bucket31_60 += balance;
        else if (age <= 90) bucket61_90 += balance;
        else bucket90_plus += balance;
      }
    });

    const outstandingBuckets = [
      { bucket: '0-30 days', amount: Math.round(bucket0_30) },
      { bucket: '31-60 days', amount: Math.round(bucket31_60) },
      { bucket: '61-90 days', amount: Math.round(bucket61_90) },
      { bucket: '90+ days', amount: Math.round(bucket90_plus) },
    ];

    // 7. Recent Activity Audit Log
    const recentActivity = recentAuditLogs.map((log) => ({
      id: log.id,
      title: `${log.action} ${log.module}`,
      description: log.details,
      actor: log.user,
      status: 'Paid',
      timestamp: log.timestamp.toISOString(),
    }));

    const revenueTrend = Object.entries(monthlyRevenueMap).map(([month, data]) => ({
      month,
      revenue: Number(data.revenue.toFixed(2)),
      target: Number((data.revenue * 1.1).toFixed(2)),
    }));

    return {
      dashboardStats,
      monthlyRevenue,
      revenueTrend,
      claimStatusBreakdown,
      outstandingBuckets,
      quickStats: {
        cleanClaimRate: `${cleanClaimRate}%`,
        denialRate: `${denialRate}%`,
        collectionRate: `${collectionRate}%`,
        avgDaysInAR: `${avgDaysInAR} days`,
      },
      recentActivity,
    };
  }
}
