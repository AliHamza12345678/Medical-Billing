import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { apiResponse, handleApiError } from '@/lib/server/http/response';
import { requirePermission } from '@/lib/server/auth/auth-guard';
import { updateSettingSchema } from '@/lib/validations/settings';
import { ApiError } from '@/lib/server/errors/api-error';
import { AuditLogger } from '@/lib/server/audit/audit-logger';

export async function GET(req: NextRequest) {
  try {
    await requirePermission(req, 'admin.settings');
    let settings = await prisma.systemSetting.findMany({
      orderBy: { key: 'asc' },
    });

    if (settings.length === 0) {
      // Default initial non-secret settings
      settings = [
        { id: '1', key: 'general.practice_name', value: 'MediBill Healthcare Clinic', category: 'general', description: 'Practice display name', updatedBy: 'System', createdAt: new Date(), updatedAt: new Date() },
        { id: '2', key: 'billing.default_tax_rate', value: '0.00', category: 'billing', description: 'Default billing tax rate (%)', updatedBy: 'System', createdAt: new Date(), updatedAt: new Date() },
        { id: '3', key: 'claims.auto_submit_clean', value: 'true', category: 'claims', description: 'Automatically submit validated clean claims', updatedBy: 'System', createdAt: new Date(), updatedAt: new Date() },
        { id: '4', key: 'notifications.email_alerts', value: 'true', category: 'notifications', description: 'Send email notifications for claim rejections', updatedBy: 'System', createdAt: new Date(), updatedAt: new Date() },
      ];
    }

    return apiResponse(settings);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await requirePermission(req, 'admin.settings');
    const body = await req.json();

    const parsed = updateSettingSchema.safeParse(body);
    if (!parsed.success) {
      throw ApiError.validation('Invalid system setting payload', parsed.error.flatten().fieldErrors);
    }

    const { key, value, category, description } = parsed.data;

    const setting = await prisma.systemSetting.upsert({
      where: { key },
      update: {
        value,
        category,
        description,
        updatedBy: session.name,
      },
      create: {
        key,
        value,
        category,
        description,
        updatedBy: session.name,
      },
    });

    await AuditLogger.log({
      userId: session.id,
      userName: session.name,
      action: 'Update',
      module: 'Admin',
      resource: `Setting: ${key}`,
      details: `Updated system configuration parameter '${key}' to '${value}'`,
    });

    return apiResponse(setting);
  } catch (error) {
    return handleApiError(error);
  }
}
