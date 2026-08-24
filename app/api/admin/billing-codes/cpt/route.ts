import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { apiResponse, handleApiError } from '@/lib/server/http/response';
import { requirePermission } from '@/lib/server/auth/auth-guard';
import { createProcedureCodeSchema } from '@/lib/validations/billing-code';
import { ApiError } from '@/lib/server/errors/api-error';
import { AuditLogger } from '@/lib/server/audit/audit-logger';

export async function GET(req: NextRequest) {
  try {
    await requirePermission(req, 'charges.view');
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.toLowerCase() || '';

    let codes = await prisma.procedureCode.findMany({
      orderBy: { cptCode: 'asc' },
    });

    if (search) {
      codes = codes.filter(
        (c) =>
          c.cptCode.toLowerCase().includes(search) ||
          c.description.toLowerCase().includes(search) ||
          c.category.toLowerCase().includes(search)
      );
    }

    return apiResponse(codes, {
      total: codes.length,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requirePermission(req, 'charges.edit');
    const body = await req.json();

    const parsed = createProcedureCodeSchema.safeParse(body);
    if (!parsed.success) {
      throw ApiError.validation('Invalid CPT procedure code input', parsed.error.flatten().fieldErrors);
    }

    const { cptCode, description, category, standardCharge, medicareRate, rvu, status } = parsed.data;

    const existing = await prisma.procedureCode.findUnique({ where: { cptCode } });
    if (existing) {
      throw ApiError.conflict(`CPT procedure code '${cptCode}' already exists`);
    }

    const newCode = await prisma.procedureCode.create({
      data: {
        cptCode,
        description,
        category,
        standardCharge,
        medicareRate,
        rvu,
        status,
      },
    });

    await AuditLogger.log({
      userId: session.id,
      userName: session.name,
      action: 'Create',
      module: 'BillingCodes',
      resource: `CPT: ${newCode.cptCode}`,
      details: `Created CPT code '${newCode.cptCode}' (${newCode.description})`,
    });

    return apiResponse(newCode, undefined, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
