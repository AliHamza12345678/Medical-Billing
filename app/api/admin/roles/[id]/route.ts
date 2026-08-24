import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { apiResponse, handleApiError } from '@/lib/server/http/response';
import { requirePermission } from '@/lib/server/auth/auth-guard';
import { updateRoleSchema } from '@/lib/validations/role';
import { ApiError } from '@/lib/server/errors/api-error';
import { AuditLogger } from '@/lib/server/audit/audit-logger';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requirePermission(req, 'admin.roles');
    const role = await prisma.role.findUnique({ where: { id: params.id } });
    if (!role) {
      throw ApiError.notFound(`Role with ID '${params.id}' not found`);
    }
    return apiResponse(role);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requirePermission(req, 'admin.roles');
    const role = await prisma.role.findUnique({ where: { id: params.id } });
    if (!role) {
      throw ApiError.notFound(`Role '${params.id}' not found`);
    }

    const body = await req.json();
    const parsed = updateRoleSchema.safeParse(body);
    if (!parsed.success) {
      throw ApiError.validation('Invalid role update payload', parsed.error.flatten().fieldErrors);
    }

    const updatedRole = await prisma.role.update({
      where: { id: params.id },
      data: parsed.data,
    });

    await AuditLogger.log({
      userId: session.id,
      userName: session.name,
      action: 'Update',
      module: 'Admin',
      resource: `Role: ${role.name}`,
      details: `Updated permissions/description for role '${role.name}'`,
    });

    return apiResponse(updatedRole);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requirePermission(req, 'admin.roles');
    const role = await prisma.role.findUnique({ where: { id: params.id } });
    if (!role) {
      throw ApiError.notFound(`Role '${params.id}' not found`);
    }

    if (role.system) {
      throw ApiError.forbidden(`System-critical role '${role.name}' cannot be deleted`);
    }

    await prisma.role.delete({ where: { id: params.id } });

    await AuditLogger.log({
      userId: session.id,
      userName: session.name,
      action: 'Delete',
      module: 'Admin',
      resource: `Role: ${role.name}`,
      details: `Deleted custom role '${role.name}'`,
    });

    return apiResponse({ message: `Role '${role.name}' deleted successfully` });
  } catch (error) {
    return handleApiError(error);
  }
}
