import { Logger } from '../logging/logger';
import { RealtimeEventManager, RealtimeEventType } from '../events/realtime-event-manager';

export type WebSocketEvent =
  | 'claim.updated'
  | 'claim.denied'
  | 'claim.paid'
  | 'payment.received'
  | 'eligibility.completed'
  | 'notification.created'
  | 'report.completed'
  | 'export.completed';

export interface WebSocketEventPayload {
  event: WebSocketEvent;
  roomId?: string;
  data: Record<string, any>;
  timestamp: string;
}

export class SocketService {
  private static listeners = new Map<string, ((payload: WebSocketEventPayload) => void)[]>();

  static emitEvent(event: WebSocketEvent, data: Record<string, any>, roomId?: string): void {
    // 1. Broadcast via production Redis Pub/Sub & SSE stream engine
    try {
      RealtimeEventManager.broadcastEvent(event as RealtimeEventType, data, roomId);
    } catch (err) {
      Logger.error('[SSE_EMIT_ERROR]', err);
    }

    // 2. Dispatch to local listeners
    const payload: WebSocketEventPayload = {
      event,
      roomId,
      data: this.maskSensitiveData(data),
      timestamp: new Date().toISOString(),
    };

    const roomListeners = this.listeners.get(roomId || 'global') || [];
    roomListeners.forEach((listener) => {
      try {
        listener(payload);
      } catch (err) {
        Logger.error('[WEBSOCKET_EMIT_ERROR]', err);
      }
    });
  }

  static subscribe(roomId: string, callback: (payload: WebSocketEventPayload) => void): () => void {
    if (!this.listeners.has(roomId)) {
      this.listeners.set(roomId, []);
    }
    this.listeners.get(roomId)!.push(callback);

    return () => {
      const list = this.listeners.get(roomId) || [];
      this.listeners.set(roomId, list.filter((cb) => cb !== callback));
    };
  }

  private static maskSensitiveData(data: Record<string, any>): Record<string, any> {
    const masked = { ...data };
    if (masked.ssn) masked.ssn = '***-**-****';
    if (masked.cardNumber) masked.cardNumber = '****-****-****-' + String(masked.cardNumber).slice(-4);
    return masked;
  }
}
