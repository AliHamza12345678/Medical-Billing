import { NextRequest } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/server/http/response';
import { requireAuth } from '@/lib/server/auth/auth-guard';

export async function POST(req: NextRequest) {
  try {
    await requireAuth(req);
    return apiResponse({ message: 'All notifications marked as read' });
  } catch (error) {
    return handleApiError(error);
  }
}
