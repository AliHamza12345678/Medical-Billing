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
        provider: true,
        patientId: true,
        status: true,
        billedAmount: true,
        paidAmount: true,
      },
    });

    const providerMap = new Map<string, {
      patients: Set<string>;
      claims: number;
      submitted: number;
      paid: number;
      denied: number;
      billed: number;
      revenue: number;
    }>();

    dbClaims.forEach((c) => {
      const pName = c.provider || 'Unspecified Provider';
      if (!providerMap.has(pName)) {
        providerMap.set(pName, {
          patients: new Set(),
          claims: 0,
          submitted: 0,
          paid: 0,
          denied: 0,
          billed: 0,
          revenue: 0,
        });
      }

      const entry = providerMap.get(pName)!;
      entry.patients.add(c.patientId);
      entry.claims += 1;
      entry.billed += Number(c.billedAmount);
      entry.revenue += Number(c.paidAmount);

      if (c.status === 'Submitted') entry.submitted += 1;
      else if (c.status === 'Paid') entry.paid += 1;
      else if (c.status === 'Denied' || c.status === 'Rejected') entry.denied += 1;
    });

    const formatted = Array.from(providerMap.entries()).map(([provider, data], idx) => {
      const collectionRate = data.billed > 0 ? Number(((data.revenue / data.billed) * 100).toFixed(1)) : 0;

      return {
        id: `prov-${idx + 1}`,
        provider,
        patients: data.patients.size,
        claims: data.claims,
        submitted: data.submitted,
        paid: data.paid,
        denied: data.denied,
        revenue: data.revenue,
        collectionRate,
      };
    });

    return apiResponse(formatted, {
      total: formatted.length,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
