import { RedisService } from '../redis/redis-client';

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export class PerformanceEngine {
  static getPagination(params: PaginationParams) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 20)); // Cap limit at 100 max records
    const skip = (page - 1) * limit;

    return { page, limit, skip };
  }

  static async getOrSetCache<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttlSeconds = 300
  ): Promise<T> {
    const cached = await RedisService.get(key);
    if (cached) {
      try {
        return JSON.parse(cached) as T;
      } catch {
        // Fallback to fetch on parse error
      }
    }

    const freshData = await fetchFn();
    await RedisService.set(key, JSON.stringify(freshData), ttlSeconds);
    return freshData;
  }
}
