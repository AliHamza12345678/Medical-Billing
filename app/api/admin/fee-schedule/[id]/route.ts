import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { apiResponse, handleApiError } from '@/lib/server/http/response';
import { requirePermission } from '@/lib/server/auth/auth-guard';
import { updateFeeScheduleSchema } from '@/lib/validations/fee-schedule';
import { ApiError } from '@/lib/server/errors/api-error';
import { AuditLogger } from '@/lib/server/audit/audit-logger';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requirePermission(req, 'admin.settings');
    const item = await prisma.feeSchedule.findUnique({ where: { id: params.id } });
    if (!item) {
      throw ApiError.notFound(`Fee schedule record '${params.id}' not found`);
    }
    return apiResponse(item);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requirePermission(req, 'admin.settings');
    const item = await prisma.feeSchedule.findUnique({ where: { id: params.id } });
    if (!item) {
      throw ApiError.notFound(`Fee schedule record '${params.id}' not found`);
    }

    const body = await req.json();
    const parsed = updateFeeScheduleSchema.safeParse(body);
    if (!parsed.success) {
      throw ApiError.validation('Invalid fee schedule update payload', parsed.error.flatten().fieldErrors);
    }

    const updatedItem = await prisma.feeSchedule.update({
      where: { id: params.id },
      data: {
        ...parsed.data,
        effectiveDate: parsed.data.effectiveDate ? new Date(parsed.data.effectiveDate) : undefined,
      },
    });

    await AuditLogger.log({
      userId: session.id,
      userName: session.name,
      action: 'Update',
      module: 'FeeSchedule',
      resource: `CPT: ${item.cptCode}`,
      details: `Updated fee schedule rate for CPT ${item.cptCode} (${item.provider})`,
    });

    return apiResponse(updatedItem);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requirePermission(req, 'admin.settings');
    const item = await prisma.feeSchedule.findUnique({ where: { id: params.id } });
    if (!item) {
      throw ApiError.notFound(`Fee schedule record '${params.id}' not found`);
    }

    await prisma.feeSchedule.delete({ where: { id: params.id } });

    await AuditLogger.log({
      userId: session.id,
      userName: session.name,
      action: 'Delete',
      module: 'FeeSchedule',
      resource: `CPT: ${item.cptCode}`,
      details: `Deleted fee schedule rate for CPT ${item.cptCode} (${item.provider})`,
    });

    return apiResponse({ message: `Fee schedule record deleted` });
  } catch (error) {
    return handleApiError(error);
  }
}
