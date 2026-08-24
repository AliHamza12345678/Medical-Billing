import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { apiResponse, handleApiError } from '@/lib/server/http/response';
import { requirePermission } from '@/lib/server/auth/auth-guard';
import { createInsuranceProviderSchema } from '@/lib/validations/insurance';
import { ApiError } from '@/lib/server/errors/api-error';
import { AuditLogger } from '@/lib/server/audit/audit-logger';

export async function GET(req: NextRequest) {
  try {
    await requirePermission(req, 'insurance.view');
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.toLowerCase() || '';

    let providers = await prisma.insuranceProvider.findMany({
      where: { isDeleted: false },
      orderBy: { name: 'asc' },
    });

    if (search) {
      providers = providers.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          p.payerId.toLowerCase().includes(search) ||
          p.type.toLowerCase().includes(search)
      );
    }

    return apiResponse(providers, {
      total: providers.length,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requirePermission(req, 'insurance.edit');
    const body = await req.json();

    const parsed = createInsuranceProviderSchema.safeParse(body);
    if (!parsed.success) {
      throw ApiError.validation('Invalid insurance provider payload', parsed.error.flatten().fieldErrors);
    }

    const { name, payerId, type, phone, email, address, city, state, zip, status } = parsed.data;

    const existing = await prisma.insuranceProvider.findUnique({ where: { payerId } });
    if (existing) {
      throw ApiError.conflict(`Insurance provider with Payer ID '${payerId}' already exists`);
    }

    const newProvider = await prisma.insuranceProvider.create({
      data: {
        name,
        payerId,
        type,
        phone,
        email,
        address,
        city,
        state,
        zip,
        status,
      },
    });

    await AuditLogger.log({
      userId: session.id,
      userName: session.name,
      action: 'Create',
      module: 'Insurance',
      resource: `Payer: ${newProvider.payerId}`,
      details: `Created insurance provider '${newProvider.name}' (Payer ID: ${newProvider.payerId})`,
    });

    return apiResponse(newProvider, undefined, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
