import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/server/auth/auth-guard';
import { RealtimeEventManager } from '@/lib/server/events/realtime-event-manager';
import { Logger } from '@/lib/server/logging/logger';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // Authenticate SSE connection
    await requireAuth(req);

    const clientId = `sse-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get('roomId') || undefined;

    let cleanupClient: (() => void) | null = null;
    let heartbeatInterval: NodeJS.Timeout | null = null;

    const stream = new ReadableStream({
      start(controller) {
        // Send initial connection event
        const encoder = new TextEncoder();
        const initialPayload = {
          event: 'system.connected',
          data: { status: 'connected', clientId },
          timestamp: new Date().toISOString(),
        };
        controller.enqueue(encoder.encode(`event: system.connected\ndata: ${JSON.stringify(initialPayload)}\n\n`));

        // Register client controller with manager
        cleanupClient = RealtimeEventManager.addClient(clientId, controller, roomId);

        // Heartbeat ping every 15s to keep connection alive
        heartbeatInterval = setInterval(() => {
          try {
            controller.enqueue(encoder.encode(': ping\n\n'));
          } catch {
            if (heartbeatInterval) clearInterval(heartbeatInterval);
          }
        }, 15000);

        // Handle client connection abort / disconnect
        req.signal.addEventListener('abort', () => {
          Logger.info(`[SSE] Client '${clientId}' aborted connection.`);
          if (heartbeatInterval) clearInterval(heartbeatInterval);
          if (cleanupClient) cleanupClient();
        });
      },
      cancel() {
        Logger.info(`[SSE] Stream cancelled for client '${clientId}'`);
        if (heartbeatInterval) clearInterval(heartbeatInterval);
        if (cleanupClient) cleanupClient();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform, no-store',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (error: any) {
    Logger.error('[SSE_ROUTE_ERROR]', error);
    return new Response(JSON.stringify({ success: false, error: 'Unauthorized SSE connection' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
