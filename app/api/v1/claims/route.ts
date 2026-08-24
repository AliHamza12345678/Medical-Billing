import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { apiResponse, handleApiError } from '@/lib/server/http/response';
import { requirePermission } from '@/lib/server/auth/auth-guard';

export async function GET(req: NextRequest) {
  try {
    await requirePermission(req, 'claims.view');
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search')?.toLowerCase() || '';

    let dbClaims = await prisma.claim.findMany({
      where: { isDeleted: false },
      include: { lines: true, patient: true },
      orderBy: { serviceDate: 'desc' },
    });

    if (status && status !== 'all') {
      dbClaims = dbClaims.filter((c) => c.status === status);
    }

    if (search) {
      dbClaims = dbClaims.filter(
        (c) =>
          c.claimNumber.toLowerCase().includes(search) ||
          c.patientName.toLowerCase().includes(search) ||
          c.insuranceProvider.toLowerCase().includes(search)
      );
    }

    const formatted = dbClaims.map((c) => ({
      ...c,
      serviceDate: c.serviceDate.toISOString().split('T')[0],
      submissionDate: c.submissionDate.toISOString().split('T')[0],
      billedAmount: Number(c.billedAmount),
      paidAmount: Number(c.paidAmount),
    }));

    return apiResponse(formatted, {
      version: 'v1',
      total: formatted.length,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
