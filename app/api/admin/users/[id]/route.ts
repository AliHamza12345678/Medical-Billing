import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { apiResponse, handleApiError } from '@/lib/server/http/response';
import { requirePermission } from '@/lib/server/auth/auth-guard';
import { updateUserSchema } from '@/lib/validations/user';
import { ApiError } from '@/lib/server/errors/api-error';
import { AuthorizationEngine } from '@/lib/server/auth/authorization-engine';
import { AuditLogger } from '@/lib/server/audit/audit-logger';
import { hashPassword } from '@/lib/server/auth/password';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requirePermission(req, 'admin.users');
    const user = await prisma.user.findUnique({ where: { id: params.id } });
    if (!user || user.isDeleted) {
      throw ApiError.notFound(`User '${params.id}' not found`);
    }
    return apiResponse(user);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requirePermission(req, 'admin.users');
    const user = await prisma.user.findUnique({ where: { id: params.id } });
    if (!user || user.isDeleted) {
      throw ApiError.notFound(`User '${params.id}' not found`);
    }

    const body = await req.json();
    const parsed = updateUserSchema.safeParse(body);
    if (!parsed.success) {
      throw ApiError.validation('Invalid user update payload', parsed.error.flatten().fieldErrors);
    }

    const { role, status, password } = parsed.data;

    // Self-lockout prevention check
    AuthorizationEngine.assertNotSelfLockout(session.id, user.id, status, role);

    // Privilege escalation check
    if (role) {
      AuthorizationEngine.assertCanAssignRole(session, role);
    }

    const updateData: Record<string, unknown> = {
      ...(parsed.data.name ? { name: parsed.data.name } : {}),
      ...(role ? { role: role.replace(' ', '') as any } : {}),
      ...(status ? { status } : {}),
    };

    if (password) {
      updateData.passwordHash = await hashPassword(password);
      updateData.failedLoginAttempts = 0;
      updateData.lockedUntil = null;
    }

    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
    });

    await AuditLogger.log({
      userId: session.id,
      userName: session.name,
      action: 'Update',
      module: 'Admin',
      resource: `User: ${user.name}`,
      details: `Updated user '${user.name}' (Role: ${role || user.role}, Status: ${status || user.status})`,
    });

    return apiResponse(updatedUser);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requirePermission(req, 'admin.users');
    const user = await prisma.user.findUnique({ where: { id: params.id } });
    if (!user || user.isDeleted) {
      throw ApiError.notFound(`User '${params.id}' not found`);
    }

    AuthorizationEngine.assertNotSelfLockout(session.id, user.id, 'Inactive');

    await prisma.user.update({
      where: { id: params.id },
      data: { isDeleted: true, status: 'Inactive', deletedAt: new Date() },
    });

    await AuditLogger.log({
      userId: session.id,
      userName: session.name,
      action: 'Delete',
      module: 'Admin',
      resource: `User: ${user.name}`,
      details: `Deactivated user account '${user.name}'`,
    });

    return apiResponse({ message: `User '${user.name}' deactivated successfully` });
  } catch (error) {
    return handleApiError(error);
  }
}
