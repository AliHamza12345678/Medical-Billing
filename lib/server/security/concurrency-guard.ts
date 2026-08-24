import { RedisService } from '../redis/redis-client';
import { ApiError } from '../errors/api-error';
import { Logger } from '../logging/logger';
import crypto from 'crypto';

export class ConcurrencyGuard {
  /**
   * Executes an action under a distributed Redis lock using atomic SET ... NX EX.
   * Lock release uses an atomic Lua script comparing owner token to prevent lock theft.
   */
  static async executeWithLock<T>(
    lockKey: string,
    actionFn: () => Promise<T>,
    ttlSeconds = 30
  ): Promise<T> {
    const redisKey = `medibill:lock:${lockKey}`;
    const lockToken = crypto.randomUUID();

    let acquired = false;
    try {
      const redis = RedisService.getClient();
      const res = await redis.set(redisKey, lockToken, 'EX', ttlSeconds, 'NX');
      acquired = res === 'OK';
    } catch (err: any) {
      Logger.error(`[LOCK] Redis error acquiring lock '${lockKey}': ${err.message}`);
      // Fall back to simple check
      const current = await RedisService.get(redisKey);
      if (!current) {
        await RedisService.set(redisKey, lockToken, ttlSeconds);
        acquired = true;
      }
    }

    if (!acquired) {
      throw ApiError.conflict(
        `Concurrent transaction blocked. Operation '${lockKey}' is already processing on another node.`
      );
    }

    try {
      return await actionFn();
    } finally {
      // Safe release via atomic Lua script
      try {
        const redis = RedisService.getClient();
        const luaScript = `
          if redis.call("get", KEYS[1]) == ARGV[1] then
            return redis.call("del", KEYS[1])
          else
            return 0
          end
        `;
        await redis.eval(luaScript, 1, redisKey, lockToken);
      } catch {
        await RedisService.del(redisKey);
      }
    }
  }
}
