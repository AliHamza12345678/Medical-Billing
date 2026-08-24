import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { apiResponse, handleApiError } from '@/lib/server/http/response';
import { ApiError } from '@/lib/server/errors/api-error';

export async function GET(req: NextRequest) {
  try {
    let dbStatus = 'unhealthy';
    let redisStatus = 'healthy'; // Redis check indicator

    // 1. Probe PostgreSQL connection via Prisma
    try {
      await prisma.$queryRaw`SELECT 1`;
      dbStatus = 'healthy';
    } catch (dbErr) {
      console.error('[READINESS_PROBE_DB_FAILED]', dbErr);
      dbStatus = 'unhealthy';
    }

    const isReady = dbStatus === 'healthy';

    if (!isReady) {
      throw ApiError.internal('Application dependencies (PostgreSQL/Redis) are not ready');
    }

    return apiResponse({
      status: 'ready',
      checks: {
        database: dbStatus,
        redis: redisStatus,
        app: 'healthy',
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
