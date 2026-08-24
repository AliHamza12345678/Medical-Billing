import Redis from 'ioredis';
import { env } from '@/lib/config/env';
import { Logger } from '../logging/logger';

/**
 * Production Redis Service
 *
 * Provides a centralized, singleton Redis connection with:
 * - Automatic reconnection with exponential backoff
 * - Connection lifecycle logging
 * - Command and connection timeouts
 * - Graceful shutdown support
 * - No silent in-memory fallback — callers handle Redis unavailability explicitly
 */
export class RedisService {
  private static clientInstance: Redis | null = null;
  private static _isConnected = false;

  /**
   * Returns true if the Redis client is currently connected and ready.
   */
  static get isConnected(): boolean {
    return this._isConnected;
  }

  /**
   * Returns the singleton ioredis client instance.
   * Creates the connection on first call with production-grade settings.
   */
  public static getClient(): Redis {
    if (!this.clientInstance) {
      const redisUrl = env.REDIS_URL || 'redis://localhost:6379';

      this.clientInstance = new Redis(redisUrl, {
        maxRetriesPerRequest: null,     // Required by BullMQ
        enableReadyCheck: true,
        connectTimeout: 10000,          // 10s connection timeout
        commandTimeout: 5000,           // 5s per-command timeout
        retryStrategy(times: number) {
          const delay = Math.min(times * 200, 5000);
          Logger.warn(`[REDIS] Reconnecting attempt ${times}, next retry in ${delay}ms`);
          return delay;
        },
        reconnectOnError(err: Error) {
          const targetErrors = ['READONLY', 'ECONNRESET', 'ETIMEDOUT'];
          return targetErrors.some((e) => err.message.includes(e));
        },
      });

      this.clientInstance.on('connect', () => {
        Logger.info('[REDIS] Connection established');
      });

      this.clientInstance.on('ready', () => {
        this._isConnected = true;
        Logger.info('[REDIS] Client ready — accepting commands');
      });

      this.clientInstance.on('error', (err: Error) => {
        this._isConnected = false;
        Logger.error('[REDIS] Connection error', err);
      });

      this.clientInstance.on('close', () => {
        this._isConnected = false;
        Logger.warn('[REDIS] Connection closed');
      });

      this.clientInstance.on('reconnecting', () => {
        Logger.info('[REDIS] Reconnecting...');
      });
    }

    return this.clientInstance;
  }

  /**
   * Creates a separate ioredis connection for operations that require
   * a dedicated connection (e.g., BullMQ workers, BLPOP blocking calls).
   */
  public static createDuplicateClient(): Redis {
    const redisUrl = env.REDIS_URL || 'redis://localhost:6379';
    return new Redis(redisUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: true,
      connectTimeout: 10000,
      commandTimeout: 5000,
      retryStrategy(times: number) {
        return Math.min(times * 200, 5000);
      },
    });
  }

  /**
   * Safe GET — returns null on Redis failure instead of throwing.
   */
  static async get(key: string): Promise<string | null> {
    try {
      return await this.getClient().get(key);
    } catch (err) {
      Logger.error(`[REDIS] GET failed for key '${key}'`, err);
      return null;
    }
  }

  /**
   * Safe SET with TTL — silently logs on Redis failure.
   */
  static async set(key: string, value: string, ttlSeconds = 300): Promise<void> {
    try {
      if (ttlSeconds > 0) {
        await this.getClient().set(key, value, 'EX', ttlSeconds);
      } else {
        await this.getClient().set(key, value);
      }
    } catch (err) {
      Logger.error(`[REDIS] SET failed for key '${key}'`, err);
    }
  }

  /**
   * Safe DEL — silently logs on Redis failure.
   */
  static async del(key: string): Promise<void> {
    try {
      await this.getClient().del(key);
    } catch (err) {
      Logger.error(`[REDIS] DEL failed for key '${key}'`, err);
    }
  }

  /**
   * Health check — returns true if Redis responds to PING.
   */
  static async ping(): Promise<boolean> {
    try {
      const result = await this.getClient().ping();
      return result === 'PONG';
    } catch {
      return false;
    }
  }

  /**
   * Graceful shutdown — closes all Redis connections cleanly.
   */
  static async disconnect(): Promise<void> {
    if (this.clientInstance) {
      try {
        await this.clientInstance.quit();
        Logger.info('[REDIS] Disconnected gracefully');
      } catch {
        this.clientInstance.disconnect();
      }
      this.clientInstance = null;
      this._isConnected = false;
    }
  }
}
