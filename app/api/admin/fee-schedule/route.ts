import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { apiResponse, handleApiError } from '@/lib/server/http/response';
import { requirePermission } from '@/lib/server/auth/auth-guard';
import { createFeeScheduleSchema } from '@/lib/validations/fee-schedule';
import { ApiError } from '@/lib/server/errors/api-error';
import { AuditLogger } from '@/lib/server/audit/audit-logger';

export async function GET(req: NextRequest) {
  try {
    await requirePermission(req, 'admin.settings');
    const { searchParams } = new URL(req.url);
    const provider = searchParams.get('provider');
    const search = searchParams.get('search')?.toLowerCase() || '';

    let items = await prisma.feeSchedule.findMany({
      orderBy: { cptCode: 'asc' },
    });

    if (provider && provider !== 'all') {
      items = items.filter((i) => i.provider === provider);
    }

    if (search) {
      items = items.filter(
        (i) =>
          i.cptCode.toLowerCase().includes(search) ||
          i.description.toLowerCase().includes(search) ||
          i.provider.toLowerCase().includes(search)
      );
    }

    return apiResponse(items, {
      total: items.length,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requirePermission(req, 'admin.settings');
    const body = await req.json();

    const parsed = createFeeScheduleSchema.safeParse(body);
    if (!parsed.success) {
      throw ApiError.validation('Invalid fee schedule input', parsed.error.flatten().fieldErrors);
    }

    const { cptCode, description, provider, standardRate, negotiatedRate, effectiveDate, status } = parsed.data;

    const newItem = await prisma.feeSchedule.create({
      data: {
        cptCode,
        description,
        provider,
        standardRate,
        negotiatedRate,
        effectiveDate: new Date(effectiveDate),
        status,
      },
    });

    await AuditLogger.log({
      userId: session.id,
      userName: session.name,
      action: 'Create',
      module: 'FeeSchedule',
      resource: `CPT: ${newItem.cptCode}`,
      details: `Created fee schedule rate for ${newItem.cptCode} (${newItem.provider}): $${newItem.negotiatedRate}`,
    });

    return apiResponse(newItem, undefined, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
