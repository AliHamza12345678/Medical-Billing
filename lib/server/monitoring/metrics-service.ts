import { RedisService } from '../redis/redis-client';
import { Logger } from '../logging/logger';

export interface StructuredLogEntry {
  requestId: string;
  route: string;
  method: string;
  status: number;
  durationMs: number;
  errorCategory?: string;
  userId?: string;
  timestamp: string;
}

export class MetricsService {
  private static totalRequests = 0;
  private static totalErrors = 0;

  static logRequest(entry: StructuredLogEntry): void {
    this.totalRequests += 1;
    if (entry.status >= 400) {
      this.totalErrors += 1;
    }

    const message = `[HTTP] ${entry.method} ${entry.route} ${entry.status} - ${entry.durationMs}ms`;
    const metadata = {
      route: entry.route,
      method: entry.method,
      status: entry.status,
      durationMs: entry.durationMs,
      ...(entry.userId ? { userId: entry.userId } : {}),
      ...(entry.errorCategory ? { errorCategory: entry.errorCategory } : {}),
    };

    if (entry.status >= 500) {
      Logger.error(message, undefined, metadata, entry.requestId);
    } else if (entry.status >= 400) {
      Logger.warn(message, metadata, entry.requestId);
    } else {
      Logger.info(message, metadata, entry.requestId);
    }
  }

  static async getSystemMetrics(): Promise<{
    totalRequests: number;
    totalErrors: number;
    errorRatePercent: string;
    redisConnected: boolean;
  }> {
    const redisOk = await RedisService.ping();
    const errorRate = this.totalRequests > 0 ? ((this.totalErrors / this.totalRequests) * 100).toFixed(2) : '0.00';

    return {
      totalRequests: this.totalRequests,
      totalErrors: this.totalErrors,
      errorRatePercent: `${errorRate}%`,
      redisConnected: redisOk,
    };
  }
}
