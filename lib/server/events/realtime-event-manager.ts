import { RedisService } from '../redis/redis-client';
import { Logger } from '../logging/logger';
import Redis from 'ioredis';

export type RealtimeEventType =
  | 'claim.created'
  | 'claim.updated'
  | 'claim.denied'
  | 'claim.paid'
  | 'payment.received'
  | 'eligibility.completed'
  | 'notification.created'
  | 'report.completed'
  | 'export.completed'
  | 'system.alert';

export interface RealtimeEventPayload {
  event: RealtimeEventType;
  roomId?: string;
  data: Record<string, any>;
  timestamp: string;
}

type ClientController = {
  id: string;
  controller: ReadableStreamDefaultController;
  roomId?: string;
};

export class RealtimeEventManager {
  private static clients: Set<ClientController> = new Set();
  private static subscriberClient: Redis | null = null;
  private static isSubscribed = false;
  private static readonly REDIS_CHANNEL = 'medibill:events';

  /**
   * Initializes Redis Pub/Sub subscriber connection if available.
   */
  private static initSubscriber() {
    if (this.subscriberClient || this.isSubscribed) return;

    try {
      this.subscriberClient = RedisService.createDuplicateClient();
      this.subscriberClient.subscribe(this.REDIS_CHANNEL, (err) => {
        if (err) {
          Logger.error('[SSE_REDIS_SUBSCRIBE_ERROR]', err);
        } else {
          this.isSubscribed = true;
          Logger.info(`[SSE_REDIS] Subscribed to channel '${this.REDIS_CHANNEL}'`);
        }
      });

      this.subscriberClient.on('message', (channel, message) => {
        if (channel === this.REDIS_CHANNEL) {
          try {
            const payload: RealtimeEventPayload = JSON.parse(message);
            this.broadcastToLocalClients(payload);
          } catch (err: any) {
            Logger.error('[SSE_MESSAGE_PARSE_ERROR]', err);
          }
        }
      });
    } catch (err: any) {
      Logger.warn('[SSE_REDIS] Could not initialize Redis subscriber, falling back to local pool', { error: String(err) });
    }
  }

  /**
   * Registers a connected SSE client stream controller.
   */
  public static addClient(id: string, controller: ReadableStreamDefaultController, roomId?: string): () => void {
    this.initSubscriber();

    const client: ClientController = { id, controller, roomId };
    this.clients.add(client);
    Logger.info(`[SSE] Client '${id}' connected (Active clients: ${this.clients.size})`);

    // Return cleanup function
    return () => {
      this.clients.delete(client);
      Logger.info(`[SSE] Client '${id}' disconnected (Active clients: ${this.clients.size})`);
    };
  }

  /**
   * Broadcasts a real-time event via Redis Pub/Sub and local SSE streams.
   */
  public static broadcastEvent(event: RealtimeEventType, data: Record<string, any>, roomId?: string): void {
    const payload: RealtimeEventPayload = {
      event,
      roomId,
      data: this.maskSensitiveData(data),
      timestamp: new Date().toISOString(),
    };

    // 1. Publish to Redis Pub/Sub for multi-instance distribution
    try {
      if (RedisService.isConnected) {
        const redis = RedisService.getClient();
        redis.publish(this.REDIS_CHANNEL, JSON.stringify(payload));
      } else {
        // Fallback to local clients if Redis offline
        this.broadcastToLocalClients(payload);
      }
    } catch (err: any) {
      Logger.error('[SSE_BROADCAST_ERROR]', err);
      this.broadcastToLocalClients(payload);
    }
  }

  /**
   * Pushes formatted SSE message to active local client controllers.
   */
  private static broadcastToLocalClients(payload: RealtimeEventPayload): void {
    const encoder = new TextEncoder();
    const formattedMessage = `event: ${payload.event}\ndata: ${JSON.stringify(payload)}\n\n`;
    const encoded = encoder.encode(formattedMessage);

    for (const client of Array.from(this.clients)) {
      if (payload.roomId && client.roomId && client.roomId !== payload.roomId) {
        continue;
      }

      try {
        client.controller.enqueue(encoded);
      } catch (err: any) {
        Logger.warn(`[SSE] Error sending to client '${client.id}', removing from pool`, { error: String(err) });
        this.clients.delete(client);
      }
    }
  }

  /**
   * Returns active connected client count.
   */
  public static getActiveClientCount(): number {
    return this.clients.size;
  }

  private static maskSensitiveData(data: Record<string, any>): Record<string, any> {
    const masked = { ...data };
    if (masked.ssn) masked.ssn = '***-**-****';
    if (masked.cardNumber) masked.cardNumber = '****-****-****-' + String(masked.cardNumber).slice(-4);
    return masked;
  }
}
