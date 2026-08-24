import { NextRequest } from 'next/server';
import { getSanitizedConfig, isProduction } from '@/lib/config/env';
import { apiResponse, handleApiError } from '@/lib/server/http/response';
import { requirePermission } from '@/lib/server/auth/auth-guard';

export async function GET(req: NextRequest) {
  try {
    await requirePermission(req, 'admin.settings');
    const sanitizedConfig = getSanitizedConfig();

    return apiResponse({
      status: 'configured',
      environment: sanitizedConfig.NODE_ENV,
      isProduction: isProduction(),
      config: sanitizedConfig,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
