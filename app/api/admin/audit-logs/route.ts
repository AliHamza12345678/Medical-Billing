import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { apiResponse, handleApiError } from '@/lib/server/http/response';
import { requirePermission } from '@/lib/server/auth/auth-guard';

export async function GET(req: NextRequest) {
  try {
    await requirePermission(req, 'admin.audit');
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');
    const search = searchParams.get('search')?.toLowerCase() || '';

    let logs = await prisma.auditLog.findMany({
      orderBy: { timestamp: 'desc' },
    });

    if (action && action !== 'all') {
      logs = logs.filter((l) => l.action.toLowerCase() === action.toLowerCase());
    }

    if (search) {
      logs = logs.filter(
        (l) =>
          l.user.toLowerCase().includes(search) ||
          l.details.toLowerCase().includes(search) ||
          l.module.toLowerCase().includes(search) ||
          l.resource.toLowerCase().includes(search)
      );
    }

    return apiResponse(logs, {
      total: logs.length,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
