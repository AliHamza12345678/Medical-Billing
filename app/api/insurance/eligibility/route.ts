import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { apiResponse, handleApiError } from '@/lib/server/http/response';
import { requirePermission } from '@/lib/server/auth/auth-guard';
import { createEligibilitySchema } from '@/lib/validations/eligibility';
import { ApiError } from '@/lib/server/errors/api-error';
import { eligibilityAdapter } from '@/lib/server/integrations/clearinghouse/eligibility-adapter';
import { AuditLogger } from '@/lib/server/audit/audit-logger';

export async function GET(req: NextRequest) {
  try {
    await requirePermission(req, 'insurance.view');
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search')?.toLowerCase() || '';

    let records = await prisma.eligibilityVerification.findMany({
      orderBy: { verificationDate: 'desc' },
    });

    if (status && status !== 'all') {
      records = records.filter((r) => r.status === status);
    }

    if (search) {
      records = records.filter(
        (r) =>
          r.patientName.toLowerCase().includes(search) ||
          r.provider.toLowerCase().includes(search) ||
          r.memberId.toLowerCase().includes(search)
      );
    }

    const formatted = records.map((r) => ({
      ...r,
      verificationDate: r.verificationDate.toISOString().split('T')[0],
      copay: Number(r.copay),
      deductibleRemaining: Number(r.deductibleRemaining),
      coveragePercent: Number(r.coveragePercent),
    }));

    return apiResponse(formatted, {
      total: formatted.length,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requirePermission(req, 'insurance.edit');
    const body = await req.json();

    const parsed = createEligibilitySchema.safeParse(body);
    if (!parsed.success) {
      throw ApiError.validation('Invalid eligibility request payload', parsed.error.flatten().fieldErrors);
    }

    const { patientId, patientName, provider, memberId, planName } = parsed.data;

    // Idempotency check: prevent duplicate simultaneous verification requests within 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recentCheck = await prisma.eligibilityVerification.findFirst({
      where: {
        patientId,
        provider,
        memberId,
        verificationDate: { gte: fiveMinutesAgo },
      },
    });

    if (recentCheck) {
      throw ApiError.conflict(
        `An eligibility check for patient ${patientName} with ${provider} was already performed recently.`
      );
    }

    // Execute clearinghouse verification adapter check
    const verificationResult = await eligibilityAdapter.verify({
      patientId,
      patientName,
      provider,
      memberId,
      planName,
    });

    const newRecord = await prisma.eligibilityVerification.create({
      data: {
        patientId,
        patientName,
        provider,
        memberId,
        status: verificationResult.status,
        copay: verificationResult.copay,
        deductibleRemaining: verificationResult.deductibleRemaining,
        coveragePercent: verificationResult.coveragePercent,
        planName,
        verificationDate: verificationResult.responseTimestamp,
      },
    });

    await AuditLogger.log({
      userId: session.id,
      userName: session.name,
      action: 'Create',
      module: 'Insurance',
      resource: `Eligibility: ${newRecord.id}`,
      details: `Performed 270/271 eligibility verification for ${patientName} (${provider}) — Status: ${newRecord.status}`,
    });

    return apiResponse(newRecord, undefined, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
