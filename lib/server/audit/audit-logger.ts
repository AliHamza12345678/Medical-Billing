import { AuditAction } from '@/types';
import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { Logger, sanitizeMetadata } from '../logging/logger';
import { ApiError } from '../errors/api-error';

export interface AuditLogParams {
  userId: string;
  userName: string;
  action: AuditAction;
  module: string;
  resource: string;
  details: string | Record<string, any>;
  ipAddress?: string;
  correlationId?: string;
}

export class AuditLogger {
  /**
   * Constructs a sanitized audit log entry payload.
   */
  private static constructEntry(params: AuditLogParams) {
    const sanitizedDetails = typeof params.details === 'string'
      ? params.details
      : JSON.stringify(sanitizeMetadata(params.details));

    return {
      timestamp: new Date(),
      user: params.userName || params.userId,
      action: params.action,
      module: params.module,
      resource: params.resource,
      details: sanitizedDetails,
      ipAddress: params.ipAddress || '127.0.0.1',
    };
  }

  /**
   * Persists an audit log entry synchronously/awaitably.
   * If persistence fails, throws ApiError.internal to abort compliance-mandatory operations.
   */
  static async log(params: AuditLogParams): Promise<void> {
    const entry = this.constructEntry(params);

    Logger.info(
      `[AUDIT_LOG] ${entry.action} on ${entry.module}:${entry.resource} by ${entry.user}`,
      {
        action: entry.action,
        module: entry.module,
        resource: entry.resource,
        user: entry.user,
        ipAddress: entry.ipAddress,
      },
      params.correlationId
    );

    try {
      await prisma.auditLog.create({
        data: entry,
      });
    } catch (err: any) {
      Logger.error('[AUDIT_LOG_PERSIST_FAILED]', err, undefined, params.correlationId);
      throw ApiError.internal('Mandatory audit log persistence failed. Transaction aborted for compliance integrity.');
    }
  }

  /**
   * Persists an audit log entry inside an active Prisma interactive transaction (tx).
   * Guarantees 100% atomicity: if the business transaction rolls back, the audit entry rolls back as well.
   */
  static async logTx(
    tx: Prisma.TransactionClient,
    params: AuditLogParams
  ): Promise<void> {
    const entry = this.constructEntry(params);

    Logger.info(
      `[AUDIT_LOG_TX] ${entry.action} on ${entry.module}:${entry.resource} by ${entry.user}`,
      {
        action: entry.action,
        module: entry.module,
        resource: entry.resource,
        user: entry.user,
        ipAddress: entry.ipAddress,
      },
      params.correlationId
    );

    await tx.auditLog.create({
      data: entry,
    });
  }
}
