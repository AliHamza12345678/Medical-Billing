import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { apiResponse, handleApiError } from '@/lib/server/http/response';
import { requirePermission } from '@/lib/server/auth/auth-guard';
import { updateAuthorizationSchema } from '@/lib/validations/authorization';
import { ApiError } from '@/lib/server/errors/api-error';
import { AuditLogger } from '@/lib/server/audit/audit-logger';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requirePermission(req, 'insurance.view');
    const auth = await prisma.authorization.findUnique({ where: { id: params.id } });
    if (!auth) {
      throw ApiError.notFound(`Authorization record '${params.id}' not found`);
    }

    return apiResponse({
      ...auth,
      requestedDate: auth.requestedDate.toISOString().split('T')[0],
      approvedDate: auth.approvedDate ? auth.approvedDate.toISOString().split('T')[0] : null,
      validFrom: auth.validFrom.toISOString().split('T')[0],
      validTo: auth.validTo.toISOString().split('T')[0],
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requirePermission(req, 'insurance.edit');
    const auth = await prisma.authorization.findUnique({ where: { id: params.id } });
    if (!auth) {
      throw ApiError.notFound(`Authorization record '${params.id}' not found`);
    }

    const body = await req.json();
    const parsed = updateAuthorizationSchema.safeParse(body);
    if (!parsed.success) {
      throw ApiError.validation('Invalid update payload', parsed.error.flatten().fieldErrors);
    }

    const { status, visitsUsed, validTo } = parsed.data;

    // Prevent exceeding approved visits limit
    if (visitsUsed !== undefined && visitsUsed > auth.visitsApproved) {
      throw ApiError.badRequest(
        `Visits used (${visitsUsed}) cannot exceed approved visits limit (${auth.visitsApproved})`
      );
    }

    const updatedAuth = await prisma.authorization.update({
      where: { id: params.id },
      data: {
        ...(status ? { status } : {}),
        ...(visitsUsed !== undefined ? { visitsUsed } : {}),
        ...(validTo ? { validTo: new Date(validTo) } : {}),
      },
    });

    await AuditLogger.log({
      userId: session.id,
      userName: session.name,
      action: 'Update',
      module: 'Insurance',
      resource: `Auth: ${auth.authorizationNumber}`,
      details: `Updated authorization ${auth.authorizationNumber} (Visits: ${updatedAuth.visitsUsed}/${updatedAuth.visitsApproved}, Status: ${updatedAuth.status})`,
    });

    return apiResponse(updatedAuth);
  } catch (error) {
    return handleApiError(error);
  }
}
