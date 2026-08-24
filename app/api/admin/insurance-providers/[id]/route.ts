import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { apiResponse, handleApiError } from '@/lib/server/http/response';
import { requirePermission } from '@/lib/server/auth/auth-guard';
import { updateInsuranceProviderSchema } from '@/lib/validations/insurance';
import { ApiError } from '@/lib/server/errors/api-error';
import { AuditLogger } from '@/lib/server/audit/audit-logger';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requirePermission(req, 'insurance.view');
    const provider = await prisma.insuranceProvider.findUnique({ where: { id: params.id } });
    if (!provider || provider.isDeleted) {
      throw ApiError.notFound(`Insurance provider '${params.id}' not found`);
    }
    return apiResponse(provider);
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
    const provider = await prisma.insuranceProvider.findUnique({ where: { id: params.id } });
    if (!provider || provider.isDeleted) {
      throw ApiError.notFound(`Insurance provider '${params.id}' not found`);
    }

    const body = await req.json();
    const parsed = updateInsuranceProviderSchema.safeParse(body);
    if (!parsed.success) {
      throw ApiError.validation('Invalid update payload', parsed.error.flatten().fieldErrors);
    }

    const updatedProvider = await prisma.insuranceProvider.update({
      where: { id: params.id },
      data: parsed.data,
    });

    await AuditLogger.log({
      userId: session.id,
      userName: session.name,
      action: 'Update',
      module: 'Insurance',
      resource: `Payer: ${provider.payerId}`,
      details: `Updated details for insurance provider '${provider.name}'`,
    });

    return apiResponse(updatedProvider);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requirePermission(req, 'insurance.edit');
    const provider = await prisma.insuranceProvider.findUnique({ where: { id: params.id } });
    if (!provider || provider.isDeleted) {
      throw ApiError.notFound(`Insurance provider '${params.id}' not found`);
    }

    await prisma.insuranceProvider.update({
      where: { id: params.id },
      data: { isDeleted: true, status: 'Inactive', deletedAt: new Date() },
    });

    await AuditLogger.log({
      userId: session.id,
      userName: session.name,
      action: 'Delete',
      module: 'Insurance',
      resource: `Payer: ${provider.payerId}`,
      details: `Soft-deleted insurance provider '${provider.name}'`,
    });

    return apiResponse({ message: `Insurance provider '${provider.name}' deactivated` });
  } catch (error) {
    return handleApiError(error);
  }
}
