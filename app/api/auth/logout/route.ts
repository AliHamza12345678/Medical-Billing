import { NextRequest } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/server/http/response';
import {
  SESSION_COOKIE_NAME,
  revokeSessionToken,
  clearSessionCookie,
} from '@/lib/server/auth/session';
import { requireAuth } from '@/lib/server/auth/auth-guard';
import { AuditLogger } from '@/lib/server/audit/audit-logger';

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;

    if (token) {
      await revokeSessionToken(token);
    }

    await AuditLogger.log({
      userId: session.id,
      userName: session.name,
      action: 'Logout',
      module: 'Auth',
      resource: 'Session',
      details: 'User logged out',
    });

    const response = apiResponse({ message: 'Logged out successfully' });
    clearSessionCookie(response);
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
