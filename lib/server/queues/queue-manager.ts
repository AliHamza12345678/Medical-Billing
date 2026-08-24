import { z } from 'zod';
import { Queue, QueueEvents } from 'bullmq';
import { RedisService } from '../redis/redis-client';
import { Logger } from '../logging/logger';
import crypto from 'crypto';
import { env } from '@/lib/config/env';

export type QueueName =
  | 'claims'
  | 'edi'
  | 'era'
  | 'reports'
  | 'exports'
  | 'notifications'
  | 'emails'
  | 'maintenance';

export const jobPayloadSchema = z.object({
  jobId: z.string(),
  queueName: z.enum(['claims', 'edi', 'era', 'reports', 'exports', 'notifications', 'emails', 'maintenance']),
  action: z.string(),
  payload: z.record(z.any()),
  idempotencyKey: z.string().optional(),
  attempts: z.number().default(0),
  maxRetries: z.number().default(3),
  createdAt: z.string().default(() => new Date().toISOString()),
});

export type JobPayload = z.infer<typeof jobPayloadSchema>;

export class QueueManager {
  private static queues: Map<QueueName, Queue> = new Map();

  /**
   * Returns a singleton BullMQ Queue instance for the requested queue name.
   */
  public static getQueue(queueName: QueueName): Queue {
    if (!this.queues.has(queueName)) {
      const redisConnection = RedisService.createDuplicateClient();
      const queue = new Queue(queueName, {
        connection: redisConnection,
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
          removeOnComplete: {
            age: 86400, // Keep completed jobs for 24 hours
            count: 1000,
          },
          removeOnFail: {
            age: 604800, // Keep failed jobs in DLQ state for 7 days
            count: 5000,
          },
        },
      });

      this.queues.set(queueName, queue);
    }
    return this.queues.get(queueName)!;
  }

  /**
   * Enqueues a job into BullMQ backed by Redis.
   * Uses native BullMQ jobId deduplication and custom idempotency key tracking in Redis.
   */
  static async enqueue(
    queueName: QueueName,
    action: string,
    payload: Record<string, any>,
    idempotencyKey?: string
  ): Promise<{ jobId: string; status: 'queued' | 'duplicate' }> {
    const key = idempotencyKey || `${queueName}:${action}:${crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex')}`;
    const idempotencyRedisKey = `medibill:idempotency:${key}`;

    // Atomic SET ... NX EX 86400 (24h TTL) in Redis
    let isNew = true;
    try {
      const redis = RedisService.getClient();
      const setRes = await redis.set(idempotencyRedisKey, '1', 'EX', 86400, 'NX');
      if (!setRes) {
        isNew = false;
      }
    } catch {
      // If Redis ping fails, fall back to check
      const cached = await RedisService.get(idempotencyRedisKey);
      if (cached) {
        isNew = false;
      } else {
        await RedisService.set(idempotencyRedisKey, '1', 86400);
      }
    }

    if (!isNew) {
      Logger.info(`[BULLMQ] Duplicate job submission rejected for key '${key}'`);
      return { jobId: key, status: 'duplicate' };
    }

    const jobId = `job-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    const jobData: JobPayload = {
      jobId,
      queueName,
      action,
      payload,
      idempotencyKey: key,
      attempts: 0,
      maxRetries: 3,
      createdAt: new Date().toISOString(),
    };

    jobPayloadSchema.parse(jobData);

    try {
      const queue = this.getQueue(queueName);
      await queue.add(action, jobData, {
        jobId, // Ensures BullMQ native deduplication
      });
      Logger.info(`[BULLMQ] Enqueued job '${jobId}' to queue '${queueName}' (${action})`);
    } catch (err: any) {
      Logger.error(`[BULLMQ] Failed to add job '${jobId}' to BullMQ queue '${queueName}': ${err.message}`, err);
    }

    return { jobId, status: 'queued' };
  }

  static async isDuplicate(idempotencyKey: string): Promise<boolean> {
    const val = await RedisService.get(`medibill:idempotency:${idempotencyKey}`);
    return val === '1';
  }

  /**
   * Graceful shutdown of all queue instances.
   */
  static async closeAll(): Promise<void> {
    for (const [name, queue] of Array.from(this.queues.entries())) {
      try {
        await queue.close();
        Logger.info(`[BULLMQ] Queue '${name}' closed cleanly.`);
      } catch (err: any) {
        Logger.error(`[BULLMQ] Error closing queue '${name}': ${err.message}`);
      }
    }
    this.queues.clear();
  }
}
