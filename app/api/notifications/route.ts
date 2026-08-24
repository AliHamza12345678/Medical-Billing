import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { apiResponse, handleApiError } from '@/lib/server/http/response';
import { requireAuth } from '@/lib/server/auth/auth-guard';
import { createNotificationSchema } from '@/lib/validations/notification';
import { ApiError } from '@/lib/server/errors/api-error';
import { SocketService } from '@/lib/server/websocket/socket-manager';

export async function GET(req: NextRequest) {
  try {
    await requireAuth(req);
    const notifications = await prisma.appNotification.findMany({
      orderBy: { timestamp: 'desc' },
    });

    const formatted = notifications.map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      priority: n.priority,
      read: n.read,
      timestamp: n.timestamp.toISOString(),
      actionUrl: n.actionUrl,
    }));

    return apiResponse(formatted, { total: formatted.length });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const body = await req.json();

    const parsed = createNotificationSchema.safeParse(body);
    if (!parsed.success) {
      throw ApiError.validation('Invalid notification payload', parsed.error.flatten().fieldErrors);
    }

    const newNotif = await prisma.appNotification.create({
      data: {
        type: parsed.data.type,
        title: parsed.data.title,
        message: parsed.data.message,
        priority: parsed.data.priority,
        read: false,
        actionUrl: parsed.data.actionUrl,
      },
    });

    const formatted = {
      id: newNotif.id,
      type: newNotif.type,
      title: newNotif.title,
      message: newNotif.message,
      priority: newNotif.priority,
      read: newNotif.read,
      timestamp: newNotif.timestamp.toISOString(),
      actionUrl: newNotif.actionUrl,
    };

    // Emit real-time socket event
    SocketService.emitEvent('notification.created', formatted);

    return apiResponse(formatted, undefined, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
