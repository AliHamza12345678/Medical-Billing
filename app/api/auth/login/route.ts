import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { apiResponse, handleApiError } from '@/lib/server/http/response';
import { ApiError } from '@/lib/server/errors/api-error';
import { verifyPassword, hashPassword } from '@/lib/server/auth/password';
import { createSession, setSessionCookie } from '@/lib/server/auth/session';
import { AuditLogger } from '@/lib/server/audit/audit-logger';

import { enforceRateLimit } from '@/lib/server/security/rate-limit-middleware';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

export async function POST(req: NextRequest) {
  try {
    await enforceRateLimit(req, 'AUTH');
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      throw ApiError.validation('Invalid credentials format', parsed.error.flatten().fieldErrors);
    }

    const { email, password } = parsed.data;
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

    // User enumeration protection: return generic error message for invalid email or password
    if (!user || user.isDeleted || user.status !== 'Active') {
      throw ApiError.unauthorized('Invalid email address or password');
    }

    // Check account lockout status
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const minutesRemaining = Math.ceil((user.lockedUntil.getTime() - Date.now()) / (60 * 1000));
      throw ApiError.forbidden(
        `Account locked due to multiple failed login attempts. Please try again in ${minutesRemaining} minutes.`
      );
    }

    // Reject authentication immediately if user account has no valid passwordHash configured
    let isPasswordValid = false;
    if (user.passwordHash && user.passwordHash.trim() !== '') {
      isPasswordValid = await verifyPassword(password, user.passwordHash);
    }

    if (!isPasswordValid) {
      const failedAttempts = user.failedLoginAttempts + 1;
      let lockedUntil: Date | null = null;

      if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
        lockedUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000);
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: failedAttempts,
          lockedUntil,
        },
      });

      await AuditLogger.log({
        userId: user.id,
        userName: user.name,
        action: 'Login',
        module: 'Auth',
        resource: 'Session',
        details: `Failed login attempt (${failedAttempts}/${MAX_FAILED_ATTEMPTS})`,
      });

      throw ApiError.unauthorized('Invalid email address or password');
    }

    // Reset failed login count and update lastLogin
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLogin: new Date(),
      },
    });

    // Create persistent database session
    const { token, expiresAt } = await createSession(user.id, req);

    await AuditLogger.log({
      userId: user.id,
      userName: user.name,
      action: 'Login',
      module: 'Auth',
      resource: 'Session',
      details: 'User logged in successfully',
    });

    const response = apiResponse({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarColor: user.avatarColor,
        permissions: user.permissions,
      },
    });

    setSessionCookie(response, token, expiresAt);
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
