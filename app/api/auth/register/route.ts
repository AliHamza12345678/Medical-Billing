import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { apiResponse, handleApiError } from '@/lib/server/http/response';
import { ApiError } from '@/lib/server/errors/api-error';
import { hashPassword } from '@/lib/server/auth/password';
import { createSession, setSessionCookie } from '@/lib/server/auth/session';
import { AuditLogger } from '@/lib/server/audit/audit-logger';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  phone: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      throw ApiError.validation('Invalid registration input', parsed.error.flatten().fieldErrors);
    }

    const { fullName, email, password } = parsed.data;
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      throw ApiError.conflict('An account with this email address already exists');
    }

    const passwordHash = await hashPassword(password);
    const avatarColors = ['bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-amber-500'];
    const randomAvatar = avatarColors[Math.floor(Math.random() * avatarColors.length)];

    const newUser = await prisma.user.create({
      data: {
        name: fullName,
        email: email.toLowerCase(),
        passwordHash,
        role: 'BillingManager',
        status: 'Active',
        avatarColor: randomAvatar,
        permissions: ['claims.view', 'claims.edit', 'payments.view', 'patients.view'],
      },
    });

    const { token, expiresAt } = await createSession(newUser.id, req);

    await AuditLogger.log({
      userId: newUser.id,
      userName: newUser.name,
      action: 'Create',
      module: 'Auth',
      resource: 'User',
      details: 'Registered new user account',
    });

    const response = apiResponse(
      {
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          avatarColor: newUser.avatarColor,
          permissions: newUser.permissions,
        },
      },
      undefined,
      201
    );

    setSessionCookie(response, token, expiresAt);
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
