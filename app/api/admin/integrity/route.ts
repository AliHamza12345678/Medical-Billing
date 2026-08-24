import { NextRequest } from 'next/server';
import { runDatabaseIntegrityCheck } from '@/lib/db/integrity';
import { apiResponse, handleApiError } from '@/lib/server/http/response';
import { requirePermission } from '@/lib/server/auth/auth-guard';

export async function GET(req: NextRequest) {
  try {
    await requirePermission(req, 'admin.settings');
    const report = await runDatabaseIntegrityCheck();
    return apiResponse(report);
  } catch (error) {
    return handleApiError(error);
  }
}
