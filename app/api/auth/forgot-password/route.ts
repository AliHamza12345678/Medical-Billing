import { NextRequest } from 'next/server';
import { z } from 'zod';
import crypto from 'crypto';
import { prisma } from '@/lib/db';
import { apiResponse, handleApiError } from '@/lib/server/http/response';
import { ApiError } from '@/lib/server/errors/api-error';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      throw ApiError.validation('Invalid email address', parsed.error.flatten().fieldErrors);
    }

    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email.toLowerCase() },
    });

    if (user && !user.isDeleted) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour token expiry

      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          token: resetToken,
          expiresAt,
        },
      });

      console.log(`[PASSWORD_RESET_TOKEN_GENERATED] Email: ${user.email} | Token: ${resetToken}`);
    }

    // User enumeration protection: Always return success response regardless of email existence
    return apiResponse({
      message: 'If an account exists for this email address, a password reset link has been dispatched.',
    });
  } catch (error) {
    return handleApiError(error);
  }
}
