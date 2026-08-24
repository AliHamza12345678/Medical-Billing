import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { apiResponse, handleApiError } from '@/lib/server/http/response';
import { requirePermission } from '@/lib/server/auth/auth-guard';
import { createUserSchema } from '@/lib/validations/user';
import { hashPassword } from '@/lib/server/auth/password';
import { ApiError } from '@/lib/server/errors/api-error';
import { AuthorizationEngine } from '@/lib/server/auth/authorization-engine';
import { AuditLogger } from '@/lib/server/audit/audit-logger';

export async function GET(req: NextRequest) {
  try {
    await requirePermission(req, 'admin.users');
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.toLowerCase() || '';

    let dbUsers = await prisma.user.findMany({
      where: { isDeleted: false },
      orderBy: { createdAt: 'desc' },
    });

    if (search) {
      dbUsers = dbUsers.filter(
        (u) => u.name.toLowerCase().includes(search) || u.email.toLowerCase().includes(search)
      );
    }

    return apiResponse(dbUsers, {
      total: dbUsers.length,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requirePermission(req, 'admin.users');
    const body = await req.json();

    const parsed = createUserSchema.safeParse(body);
    if (!parsed.success) {
      throw ApiError.validation('Invalid user creation input', parsed.error.flatten().fieldErrors);
    }

    const { name, email, password, role, status } = parsed.data;

    // Prevent non-admin users from escalating privileges to Administrator
    AuthorizationEngine.assertCanAssignRole(session, role);

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      throw ApiError.conflict('User with this email address already exists');
    }

    const passwordHash = await hashPassword(password);
    const newUser = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash,
        role: role.replace(' ', '') as any,
        status,
        permissions: ['claims.view', 'patients.view'],
      },
    });

    await AuditLogger.log({
      userId: session.id,
      userName: session.name,
      action: 'Create',
      module: 'Admin',
      resource: `User: ${newUser.name}`,
      details: `Created user '${newUser.name}' with role '${newUser.role}'`,
    });

    return apiResponse(newUser, undefined, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
