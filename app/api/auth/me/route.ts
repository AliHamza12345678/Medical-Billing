import { NextRequest } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/server/http/response';
import { requireAuth } from '@/lib/server/auth/auth-guard';

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    return apiResponse({ user: session });
  } catch (error) {
    return handleApiError(error);
  }
}
