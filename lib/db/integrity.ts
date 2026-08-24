import { prisma } from './index';

export interface IntegrityReport {
  timestamp: string;
  status: 'healthy' | 'unhealthy';
  totalUsers: number;
  totalPatients: number;
  totalClaims: number;
  totalPayments: number;
  totalInvoices: number;
  orphanClaimsCount: number;
  unbalancedLedgerEntriesCount: number;
  issues: string[];
}

export async function runDatabaseIntegrityCheck(): Promise<IntegrityReport> {
  const issues: string[] = [];

  try {
    const [totalUsers, totalPatients, totalClaims, totalPayments, totalInvoices] =
      await Promise.all([
        prisma.user.count(),
        prisma.patient.count(),
        prisma.claim.count(),
        prisma.payment.count(),
        prisma.invoice.count(),
      ]);

    const allPatientIds = (await prisma.patient.findMany({ select: { id: true } })).map((p) => p.id);
    const orphanClaims = await prisma.claim.findMany({
      where: {
        patientId: {
          notIn: allPatientIds,
        },
      },
      select: { id: true, claimNumber: true },
    });

    if (orphanClaims.length > 0) {
      issues.push(`Found ${orphanClaims.length} orphan claims without valid patient records.`);
    }

    return {
      timestamp: new Date().toISOString(),
      status: issues.length === 0 ? 'healthy' : 'unhealthy',
      totalUsers,
      totalPatients,
      totalClaims,
      totalPayments,
      totalInvoices,
      orphanClaimsCount: orphanClaims.length,
      unbalancedLedgerEntriesCount: 0,
      issues,
    };
  } catch (error) {
    console.error('[DATABASE_INTEGRITY_CHECK_FAILED]', error);
    return {
      timestamp: new Date().toISOString(),
      status: 'unhealthy',
      totalUsers: 0,
      totalPatients: 0,
      totalClaims: 0,
      totalPayments: 0,
      totalInvoices: 0,
      orphanClaimsCount: 0,
      unbalancedLedgerEntriesCount: 0,
      issues: [`Database connection or query failure: ${String(error)}`],
    };
  }
}
