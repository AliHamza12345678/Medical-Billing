import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/db';
import { env, isProduction } from '@/lib/config/env';
import { ApiError } from '../errors/api-error';

export const SESSION_COOKIE_NAME = 'medibill_session';
export const SESSION_EXPIRY_DAYS = 7;

export interface ActiveSessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  avatarColor: string;
}

/**
 * Computes a SHA-256 cryptographic hash digest of a raw session token string.
 * Ensures raw tokens are never saved in database records.
 */
export function hashSessionToken(rawToken: string): string {
  if (!rawToken || typeof rawToken !== 'string' || rawToken.trim() === '') {
    return '';
  }
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

export async function createSession(
  userId: string,
  req?: NextRequest
): Promise<{ token: string; expiresAt: Date }> {
  // Generate 256-bit cryptographically random raw session token
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenDigest = hashSessionToken(rawToken);
  const expiresAt = new Date(Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  const ipAddress = req?.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
  const userAgent = req?.headers.get('user-agent') || 'Unknown';

  // Store ONLY the SHA-256 digest in PostgreSQL
  await prisma.session.create({
    data: {
      userId,
      token: tokenDigest,
      ipAddress,
      userAgent,
      expiresAt,
    },
  });

  // Return rawToken ONLY for client-side HTTP-only cookie setting
  return { token: rawToken, expiresAt };
}

export function setSessionCookie(response: NextResponse, token: string, expiresAt: Date): void {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: isProduction(),
    sameSite: 'strict',
    path: '/',
    expires: expiresAt,
  });
}

export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: isProduction(),
    sameSite: 'strict',
    path: '/',
    expires: new Date(0),
  });
}

export async function validateSessionToken(rawToken: string): Promise<ActiveSessionUser | null> {
  if (!rawToken || typeof rawToken !== 'string' || rawToken.trim() === '') {
    return null;
  }

  const tokenDigest = hashSessionToken(rawToken);

  // Look up session using SHA-256 digest
  let session = await prisma.session.findUnique({
    where: { token: tokenDigest },
    include: { user: true },
  });

  // Legacy Migration Fallback: If session not found by digest, check for unhashed legacy session
  if (!session) {
    session = await prisma.session.findUnique({
      where: { token: rawToken },
      include: { user: true },
    });

    // Automatically upgrade legacy plaintext session token to SHA-256 digest
    if (session) {
      prisma.session
        .update({
          where: { id: session.id },
          data: { token: tokenDigest },
        })
        .catch(() => {});
    }
  }

  if (!session || session.revoked || session.expiresAt < new Date()) {
    return null;
  }

  if (session.user.status !== 'Active' || session.user.isDeleted) {
    return null;
  }

  // Update lastUsedAt timestamp asynchronously
  prisma.session
    .update({
      where: { id: session.id },
      data: { lastUsedAt: new Date() },
    })
    .catch(() => {});

  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    role: session.user.role,
    permissions: session.user.permissions,
    avatarColor: session.user.avatarColor,
  };
}

export async function revokeSessionToken(rawToken: string): Promise<void> {
  if (!rawToken || typeof rawToken !== 'string' || rawToken.trim() === '') {
    return;
  }

  const tokenDigest = hashSessionToken(rawToken);

  // Revoke session matching SHA-256 digest or legacy raw token
  await prisma.session.updateMany({
    where: {
      OR: [
        { token: tokenDigest },
        { token: rawToken },
      ],
    },
    data: { revoked: true },
  });
}

export async function revokeAllUserSessions(userId: string): Promise<void> {
  await prisma.session.updateMany({
    where: { userId },
    data: { revoked: true },
  });
}
