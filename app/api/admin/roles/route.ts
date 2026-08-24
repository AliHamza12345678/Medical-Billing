import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { apiResponse, handleApiError } from '@/lib/server/http/response';
import { requirePermission } from '@/lib/server/auth/auth-guard';
import { createRoleSchema } from '@/lib/validations/role';
import { ApiError } from '@/lib/server/errors/api-error';
import { AuditLogger } from '@/lib/server/audit/audit-logger';

export async function GET(req: NextRequest) {
  try {
    await requirePermission(req, 'admin.roles');
    let dbRoles = await prisma.role.findMany({
      orderBy: { createdAt: 'asc' },
    });

    return apiResponse(dbRoles, {
      total: dbRoles.length,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requirePermission(req, 'admin.roles');
    const body = await req.json();

    const parsed = createRoleSchema.safeParse(body);
    if (!parsed.success) {
      throw ApiError.validation('Invalid role data', parsed.error.flatten().fieldErrors);
    }

    const { name, description, permissions } = parsed.data;
    const existing = await prisma.role.findUnique({ where: { name } });

    if (existing) {
      throw ApiError.conflict(`Role with name '${name}' already exists`);
    }

    const newRole = await prisma.role.create({
      data: {
        name,
        description,
        permissions,
        system: false,
        usersCount: 0,
      },
    });

    await AuditLogger.log({
      userId: session.id,
      userName: session.name,
      action: 'Create',
      module: 'Admin',
      resource: `Role: ${newRole.name}`,
      details: `Created custom role '${newRole.name}' with ${permissions.length} permissions`,
    });

    return apiResponse(newRole, undefined, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
