import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { apiResponse, handleApiError } from '@/lib/server/http/response';
import { requirePermission } from '@/lib/server/auth/auth-guard';
import { createChargeSchema } from '@/lib/validations/charge';
import { ApiError } from '@/lib/server/errors/api-error';
import { CodingValidationEngine } from '@/lib/server/coding/validation-engine';
import { AuditLogger } from '@/lib/server/audit/audit-logger';

export async function GET(req: NextRequest) {
  try {
    await requirePermission(req, 'charges.view');
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search')?.toLowerCase() || '';

    let dbCharges = await prisma.chargeEntry.findMany({
      where: { isDeleted: false },
      orderBy: { serviceDate: 'desc' },
    });

    if (status && status !== 'all') {
      dbCharges = dbCharges.filter((c) => c.status === status);
    }

    if (search) {
      dbCharges = dbCharges.filter(
        (c) =>
          c.patientName.toLowerCase().includes(search) ||
          c.cptCode.toLowerCase().includes(search) ||
          c.icd10Code.toLowerCase().includes(search) ||
          c.provider.toLowerCase().includes(search)
      );
    }

    const formatted = dbCharges.map((c) => ({
      ...c,
      serviceDate: c.serviceDate.toISOString().split('T')[0],
      unitCharge: Number(c.unitCharge),
      totalCharge: Number(c.totalCharge),
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
    const session = await requirePermission(req, 'charges.edit');
    const body = await req.json();

    const parsed = createChargeSchema.safeParse(body);
    if (!parsed.success) {
      throw ApiError.validation('Invalid charge entry payload', parsed.error.flatten().fieldErrors);
    }

    const {
      patientId,
      patientName,
      cptCode,
      cptDescription,
      icd10Code,
      icd10Description,
      quantity,
      unitCharge,
      provider,
      serviceDate,
      status,
    } = parsed.data;

    // Run Coding Validation Engine check (CPT/ICD-10 active status verification)
    const validation = await CodingValidationEngine.validateCharge({
      cptCode,
      icd10Code,
      quantity,
      unitCharge,
      serviceDate,
    });

    if (!validation.isValid) {
      throw ApiError.badRequest(`Coding validation failed: ${validation.errors.join('; ')}`);
    }

    // Server-side calculation of totalCharge (never trust frontend input)
    const totalCharge = quantity * unitCharge;

    const newCharge = await prisma.chargeEntry.create({
      data: {
        patientId,
        patientName,
        cptCode,
        cptDescription,
        icd10Code,
        icd10Description,
        quantity,
        unitCharge,
        totalCharge,
        provider,
        serviceDate: new Date(serviceDate),
        status,
      },
    });

    await AuditLogger.log({
      userId: session.id,
      userName: session.name,
      action: 'Create',
      module: 'Charges',
      resource: `Charge: ${newCharge.id}`,
      details: `Recorded charge entry for ${patientName} (${cptCode}): $${totalCharge.toFixed(2)} [Status: ${status}]`,
    });

    return apiResponse(newCharge, undefined, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
