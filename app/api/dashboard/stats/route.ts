import { NextRequest } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/server/http/response';
import { requireAuth } from '@/lib/server/auth/auth-guard';
import { DashboardAnalyticsService } from '@/lib/server/analytics/dashboard-analytics-service';

export async function GET(req: NextRequest) {
  try {
    await requireAuth(req);
    const metrics = await DashboardAnalyticsService.getDashboardMetrics();

    return apiResponse(metrics);
  } catch (error) {
    return handleApiError(error);
  }
}
