import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { apiResponse, handleApiError } from '@/lib/server/http/response';
import { requirePermission } from '@/lib/server/auth/auth-guard';
import { createAuthorizationSchema } from '@/lib/validations/authorization';
import { ApiError } from '@/lib/server/errors/api-error';
import { AuditLogger } from '@/lib/server/audit/audit-logger';

export async function GET(req: NextRequest) {
  try {
    await requirePermission(req, 'insurance.view');
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search')?.toLowerCase() || '';

    let records = await prisma.authorization.findMany({
      orderBy: { validTo: 'asc' },
    });

    if (status && status !== 'all') {
      records = records.filter((r) => r.status === status);
    }

    if (search) {
      records = records.filter(
        (r) =>
          r.patientName.toLowerCase().includes(search) ||
          r.authorizationNumber.toLowerCase().includes(search) ||
          r.procedure.toLowerCase().includes(search) ||
          r.provider.toLowerCase().includes(search)
      );
    }

    const formatted = records.map((r) => ({
      ...r,
      requestedDate: r.requestedDate.toISOString().split('T')[0],
      approvedDate: r.approvedDate ? r.approvedDate.toISOString().split('T')[0] : null,
      validFrom: r.validFrom.toISOString().split('T')[0],
      validTo: r.validTo.toISOString().split('T')[0],
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

    const parsed = createAuthorizationSchema.safeParse(body);
    if (!parsed.success) {
      throw ApiError.validation('Invalid authorization payload', parsed.error.flatten().fieldErrors);
    }

    const {
      authorizationNumber,
      patientId,
      patientName,
      provider,
      procedure,
      status,
      requestedDate,
      approvedDate,
      validFrom,
      validTo,
      visitsApproved,
      visitsUsed,
    } = parsed.data;

    const existing = await prisma.authorization.findUnique({ where: { authorizationNumber } });
    if (existing) {
      throw ApiError.conflict(`Authorization with number '${authorizationNumber}' already exists`);
    }

    const newAuth = await prisma.authorization.create({
      data: {
        authorizationNumber,
        patientId,
        patientName,
        provider,
        procedure,
        status,
        requestedDate: new Date(requestedDate),
        approvedDate: approvedDate ? new Date(approvedDate) : null,
        validFrom: new Date(validFrom),
        validTo: new Date(validTo),
        visitsApproved,
        visitsUsed,
      },
    });

    await AuditLogger.log({
      userId: session.id,
      userName: session.name,
      action: 'Create',
      module: 'Insurance',
      resource: `Auth: ${newAuth.authorizationNumber}`,
      details: `Created authorization ${newAuth.authorizationNumber} for ${patientName} (${visitsApproved} visits approved)`,
    });

    return apiResponse(newAuth, undefined, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
