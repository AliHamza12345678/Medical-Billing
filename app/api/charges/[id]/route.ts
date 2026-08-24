import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { apiResponse, handleApiError } from '@/lib/server/http/response';
import { requirePermission } from '@/lib/server/auth/auth-guard';
import { updateChargeSchema } from '@/lib/validations/charge';
import { ApiError } from '@/lib/server/errors/api-error';
import { CodingValidationEngine } from '@/lib/server/coding/validation-engine';
import { AuditLogger } from '@/lib/server/audit/audit-logger';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requirePermission(req, 'charges.view');
    const charge = await prisma.chargeEntry.findUnique({ where: { id: params.id } });
    if (!charge || charge.isDeleted) {
      throw ApiError.notFound(`Charge entry '${params.id}' not found`);
    }

    return apiResponse({
      ...charge,
      serviceDate: charge.serviceDate.toISOString().split('T')[0],
      unitCharge: Number(charge.unitCharge),
      totalCharge: Number(charge.totalCharge),
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
    const session = await requirePermission(req, 'charges.edit');
    const charge = await prisma.chargeEntry.findUnique({ where: { id: params.id } });
    if (!charge || charge.isDeleted) {
      throw ApiError.notFound(`Charge entry '${params.id}' not found`);
    }

    const body = await req.json();
    const parsed = updateChargeSchema.safeParse(body);
    if (!parsed.success) {
      throw ApiError.validation('Invalid charge update payload', parsed.error.flatten().fieldErrors);
    }

    const quantity = parsed.data.quantity ?? charge.quantity;
    const unitCharge = parsed.data.unitCharge ?? Number(charge.unitCharge);
    const cptCode = parsed.data.cptCode ?? charge.cptCode;
    const icd10Code = parsed.data.icd10Code ?? charge.icd10Code;
    const serviceDate = parsed.data.serviceDate ? new Date(parsed.data.serviceDate) : charge.serviceDate;

    // Run Coding Validation Engine check
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

    // Recalculate total server-side
    const totalCharge = quantity * unitCharge;

    const updatedCharge = await prisma.chargeEntry.update({
      where: { id: params.id },
      data: {
        ...parsed.data,
        quantity,
        unitCharge,
        totalCharge,
        serviceDate,
      },
    });

    await AuditLogger.log({
      userId: session.id,
      userName: session.name,
      action: 'Update',
      module: 'Charges',
      resource: `Charge: ${charge.id}`,
      details: `Updated charge entry for ${charge.patientName} (${cptCode}) — Total: $${totalCharge.toFixed(2)} [Status: ${updatedCharge.status}]`,
    });

    return apiResponse(updatedCharge);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requirePermission(req, 'charges.edit');
    const charge = await prisma.chargeEntry.findUnique({ where: { id: params.id } });
    if (!charge || charge.isDeleted) {
      throw ApiError.notFound(`Charge entry '${params.id}' not found`);
    }

    await prisma.chargeEntry.update({
      where: { id: params.id },
      data: { isDeleted: true, status: 'Voided', deletedAt: new Date() },
    });

    await AuditLogger.log({
      userId: session.id,
      userName: session.name,
      action: 'Delete',
      module: 'Charges',
      resource: `Charge: ${charge.id}`,
      details: `Voided charge entry for ${charge.patientName} (${charge.cptCode})`,
    });

    return apiResponse({ message: `Charge entry voided successfully` });
  } catch (error) {
    return handleApiError(error);
  }
}
