'use client';

import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

export type RealtimeEventHandler = (event: { event: string; data: any; timestamp: string }) => void;

export function useRealtimeEvents(onEvent?: RealtimeEventHandler, roomId?: string) {
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const sseUrl = roomId ? `/api/events/sse?roomId=${encodeURIComponent(roomId)}` : '/api/events/sse';
    const es = new EventSource(sseUrl);
    eventSourceRef.current = es;

    es.onopen = () => {
      console.log('[SSE_CLIENT] Connected to real-time event stream');
    };

    es.addEventListener('claim.updated', (e) => {
      try {
        const payload = JSON.parse(e.data);
        toast.info('Claim Status Updated', {
          description: `Claim ${payload.data?.claimNumber || ''} status is now ${payload.data?.status || 'updated'}.`,
        });
        if (onEvent) onEvent(payload);
      } catch (err) {
        console.error('[SSE_PARSER_ERROR]', err);
      }
    });

    es.addEventListener('payment.received', (e) => {
      try {
        const payload = JSON.parse(e.data);
        toast.success('Payment Received', {
          description: `Payment ${payload.data?.paymentNumber || ''} of $${payload.data?.amount || 0} recorded.`,
        });
        if (onEvent) onEvent(payload);
      } catch (err) {
        console.error('[SSE_PARSER_ERROR]', err);
      }
    });

    es.addEventListener('notification.created', (e) => {
      try {
        const payload = JSON.parse(e.data);
        toast.info('Notification', {
          description: payload.data?.message || 'New system notification',
        });
        if (onEvent) onEvent(payload);
      } catch (err) {
        console.error('[SSE_PARSER_ERROR]', err);
      }
    });

    es.onerror = (err) => {
      console.warn('[SSE_CLIENT_ERROR] EventSource connection error', err);
    };

    return () => {
      es.close();
      console.log('[SSE_CLIENT] Connection closed');
    };
  }, [roomId, onEvent]);

  return {
    disconnect: () => eventSourceRef.current?.close(),
  };
}
