import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { apiResponse, handleApiError } from '@/lib/server/http/response';
import { requirePermission } from '@/lib/server/auth/auth-guard';
import { createDiagnosisCodeSchema } from '@/lib/validations/billing-code';
import { ApiError } from '@/lib/server/errors/api-error';
import { AuditLogger } from '@/lib/server/audit/audit-logger';

export async function GET(req: NextRequest) {
  try {
    await requirePermission(req, 'charges.view');
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.toLowerCase() || '';

    let codes = await prisma.diagnosisCode.findMany({
      orderBy: { icd10Code: 'asc' },
    });

    if (search) {
      codes = codes.filter(
        (c) =>
          c.icd10Code.toLowerCase().includes(search) ||
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

    const parsed = createDiagnosisCodeSchema.safeParse(body);
    if (!parsed.success) {
      throw ApiError.validation('Invalid ICD-10 diagnosis code input', parsed.error.flatten().fieldErrors);
    }

    const { icd10Code, description, category, status } = parsed.data;

    const existing = await prisma.diagnosisCode.findUnique({ where: { icd10Code } });
    if (existing) {
      throw ApiError.conflict(`ICD-10 code '${icd10Code}' already exists`);
    }

    const newCode = await prisma.diagnosisCode.create({
      data: {
        icd10Code,
        description,
        category,
        status,
      },
    });

    await AuditLogger.log({
      userId: session.id,
      userName: session.name,
      action: 'Create',
      module: 'BillingCodes',
      resource: `ICD10: ${newCode.icd10Code}`,
      details: `Created ICD-10 code '${newCode.icd10Code}' (${newCode.description})`,
    });

    return apiResponse(newCode, undefined, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
