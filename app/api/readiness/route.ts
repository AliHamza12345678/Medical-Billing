import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { RedisService } from '@/lib/server/redis/redis-client';
import { MetricsService } from '@/lib/server/monitoring/metrics-service';

export async function GET() {
  let dbOk = false;
  let redisOk = false;

  try {
    await prisma.$queryRaw`SELECT 1`;
    dbOk = true;
  } catch (err) {
    dbOk = false;
  }

  try {
    redisOk = await RedisService.ping();
  } catch (err) {
    redisOk = false;
  }

  const systemMetrics = await MetricsService.getSystemMetrics();

  const isReady = dbOk;

  return NextResponse.json(
    {
      status: isReady ? 'ready' : 'unhealthy',
      checks: {
        database: dbOk ? 'healthy' : 'unhealthy',
        redis: redisOk ? 'healthy' : 'unhealthy',
      },
      metrics: systemMetrics,
      timestamp: new Date().toISOString(),
    },
    { status: isReady ? 200 : 503 }
  );
}
