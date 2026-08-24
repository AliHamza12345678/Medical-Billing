import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { apiResponse, handleApiError } from '@/lib/server/http/response';
import { ApiError } from '@/lib/server/errors/api-error';
import { hashPassword } from '@/lib/server/auth/password';
import { revokeAllUserSessions } from '@/lib/server/auth/session';
import { AuditLogger } from '@/lib/server/audit/audit-logger';

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters long'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = resetPasswordSchema.safeParse(body);

    if (!parsed.success) {
      throw ApiError.validation('Invalid request payload', parsed.error.flatten().fieldErrors);
    }

    const { token, newPassword } = parsed.data;
    const resetRecord = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (
      !resetRecord ||
      resetRecord.used ||
      resetRecord.expiresAt < new Date() ||
      resetRecord.user.isDeleted
    ) {
      throw ApiError.badRequest('Invalid or expired password reset token');
    }

    const newPasswordHash = await hashPassword(newPassword);

    // Single-use token invalidation & user password update in a single transaction
    await prisma.$transaction([
      prisma.passwordResetToken.update({
        where: { id: resetRecord.id },
        data: { used: true },
      }),
      prisma.user.update({
        where: { id: resetRecord.userId },
        data: {
          passwordHash: newPasswordHash,
          failedLoginAttempts: 0,
          lockedUntil: null,
        },
      }),
    ]);

    // Revoke all active sessions on password change
    await revokeAllUserSessions(resetRecord.userId);

    await AuditLogger.log({
      userId: resetRecord.user.id,
      userName: resetRecord.user.name,
      action: 'Update',
      module: 'Auth',
      resource: 'Password',
      details: 'Password reset successfully',
    });

    return apiResponse({
      message: 'Password has been reset successfully. Please log in with your new password.',
    });
  } catch (error) {
    return handleApiError(error);
  }
}
