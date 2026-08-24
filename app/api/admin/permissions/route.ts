import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { permissionGroups } from '@/data/users';
import { apiResponse, handleApiError } from '@/lib/server/http/response';
import { requirePermission } from '@/lib/server/auth/auth-guard';

export async function GET(req: NextRequest) {
  try {
    await requirePermission(req, 'admin.roles');

    const dbPermissions = await prisma.permission.findMany({
      orderBy: { module: 'asc' },
    });

    if (dbPermissions.length === 0) {
      return apiResponse(permissionGroups);
    }

    const groupsMap: Record<string, string[]> = {};
    dbPermissions.forEach((p) => {
      if (!groupsMap[p.module]) groupsMap[p.module] = [];
      groupsMap[p.module].push(p.name);
    });

    const groups = Object.entries(groupsMap).map(([module, permissions]) => ({
      module,
      permissions,
    }));

    return apiResponse(groups);
  } catch (error) {
    return handleApiError(error);
  }
}
