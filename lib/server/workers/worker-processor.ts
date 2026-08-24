import '@/lib/config/env';
import { Worker, Job } from 'bullmq';
import { JobPayload, QueueName, jobPayloadSchema, QueueManager } from '../queues/queue-manager';
import { Edi837Generator } from '../edi/edi-837-generator';
import { Era835Processor } from '../edi/era-835-processor';
import { ReportExportEngine } from '../export/export-engine';
import { AuditLogger } from '../audit/audit-logger';
import { EmailService } from '../email/email-service';
import { RedisService } from '../redis/redis-client';
import { Logger } from '../logging/logger';
import { ClaimScrubber } from '../scrubbing/claim-scrubber';
import { clearinghouseService } from '../integrations/clearinghouse/clearinghouse-service';
import { RealtimeEventManager } from '../events/realtime-event-manager';
import { prisma } from '@/lib/db';

export class WorkerProcessor {
  private static workers: Map<QueueName, Worker> = new Map();
  private static isShuttingDown = false;
  private static activeWorkerId = `worker-${process.pid}-${Math.floor(Math.random() * 1000)}`;

  /**
   * Sanitizes job payload before writing to log files to prevent PHI or secret disclosure.
   */
  public static sanitizePayloadForLogging(payload: Record<string, any>): Record<string, any> {
    const sensitiveKeys = ['password', 'token', 'ssn', 'dob', 'cardNumber', 'cvv', 'rawEdi', 'secret'];
    const sanitized: Record<string, any> = {};

    for (const [key, value] of Object.entries(payload || {})) {
      if (sensitiveKeys.some((s) => key.toLowerCase().includes(s))) {
        sanitized[key] = '[REDACTED_PHI_SECRET]';
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }

  /**
   * Core Job Processing Logic
   */
  static async processJob(job: JobPayload): Promise<{ success: boolean; result?: any; error?: string }> {
    try {
      switch (job.queueName) {
        case 'claims':
        case 'edi':
          if ((job.action === 'submit-claim-837' || job.action === 'generate-837') && job.payload.claimId) {
            const claimId = job.payload.claimId;
            const claim = await prisma.claim.findUnique({
              where: { id: claimId },
              include: { lines: true, patient: true },
            });

            if (!claim || claim.isDeleted) {
              throw new Error(`Claim '${claimId}' not found for 837 processing`);
            }

            // 1. Pre-Submission Claim Scrubbing Validation
            const scrubResult = await ClaimScrubber.scrubClaim(claimId);
            if (scrubResult.status === 'ERRORS') {
              const errorMessage = `Claim scrubbing failed: ${scrubResult.errors.join('; ')}`;
              await prisma.$transaction(async (tx) => {
                await tx.claim.update({
                  where: { id: claimId },
                  data: { status: 'Rejected' },
                });

                await tx.claimTimelineEvent.create({
                  data: {
                    claimId,
                    date: new Date(),
                    event: 'Claim Scrubbing Failed',
                    description: errorMessage,
                    actor: job.payload.userName || 'System Worker',
                    type: 'denial',
                  },
                });

                await AuditLogger.logTx(tx, {
                  userId: job.payload.userId || 'system-worker',
                  userName: job.payload.userName || 'System Worker',
                  action: 'Update',
                  module: 'Claims',
                  resource: `Claim: ${claim.claimNumber}`,
                  details: errorMessage,
                });
              });

              return { success: false, error: errorMessage };
            }

            // 2. Generate ASC X12 837P Transaction Payload
            const ediResult = await Edi837Generator.generate837Transaction(claimId);

            // 3. Transmit 837 Payload to Healthcare Clearinghouse API
            const transmissionResult = await clearinghouseService.submit837ClaimEDI({
              claimId: claim.id,
              claimNumber: claim.claimNumber,
              controlNumber: ediResult.controlNumber,
              edi837Payload: ediResult.payload,
            });

            const newStatus = transmissionResult.status === 'ACCEPTED' ? 'Submitted' : 'Rejected';

            // 4. Update Database Atomically
            await prisma.$transaction(async (tx) => {
              await tx.claim.update({
                where: { id: claimId },
                data: {
                  status: newStatus,
                  submissionDate: new Date(),
                },
              });

              await tx.claimTimelineEvent.create({
                data: {
                  claimId,
                  date: new Date(),
                  event: transmissionResult.status === 'ACCEPTED' ? 'Claim Submitted to Clearinghouse' : 'Claim Rejected by Clearinghouse',
                  description: `Electronic 837P claim submitted to ${claim.insuranceProvider} (Control: ${ediResult.controlNumber}, AckRef: ${transmissionResult.clearinghouseControlNumber})`,
                  actor: job.payload.userName || 'System Worker',
                  type: transmissionResult.status === 'ACCEPTED' ? 'submission' : 'denial',
                },
              });

              await AuditLogger.logTx(tx, {
                userId: job.payload.userId || 'system-worker',
                userName: job.payload.userName || 'System Worker',
                action: 'Update',
                module: 'Claims',
                resource: `Claim: ${claim.claimNumber}`,
                details: `EDI 837 claim processed with status ${transmissionResult.status} (Control: ${ediResult.controlNumber}, ClearinghouseRef: ${transmissionResult.clearinghouseControlNumber})`,
              });
            });

            // 5. Broadcast real-time event
            RealtimeEventManager.broadcastEvent('claim.updated', {
              claimId: claim.id,
              claimNumber: claim.claimNumber,
              status: newStatus,
            });

            return {
              success: transmissionResult.status === 'ACCEPTED',
              result: {
                claimId,
                transactionId: ediResult.transactionId,
                controlNumber: ediResult.controlNumber,
                clearinghouseRef: transmissionResult.clearinghouseControlNumber,
                status: transmissionResult.status,
              },
            };
          }
          break;

        case 'era':
          if (job.action === 'process-835' && job.payload.rawEdi) {
            const eraResult = await Era835Processor.processAndPost835ERA(
              job.payload.rawEdi,
              job.payload.userId || 'system-worker',
              job.payload.userName || 'ERA Processing Worker'
            );
            return { success: true, result: eraResult };
          }
          break;

        case 'exports':
          if (job.action === 'export-report') {
            const exportResult = await ReportExportEngine.generateExport({
              reportType: job.payload.reportType || 'revenue',
              format: job.payload.format || 'csv',
              userId: job.payload.userId || 'system-worker',
              userName: job.payload.userName || 'Background Worker',
            });
            return { success: true, result: { filename: exportResult.filename } };
          }
          break;

        case 'emails':
          if (job.action === 'send-email' && job.payload.to && job.payload.template) {
            const emailResult = await EmailService.deliverEmail({
              to: job.payload.to,
              template: job.payload.template,
              subject: job.payload.subject || 'Notification from MediBills',
              data: job.payload.data || {},
            });
            return { success: true, result: emailResult };
          }
          break;

        case 'notifications':
          await AuditLogger.log({
            userId: job.payload.userId || 'system-worker',
            userName: job.payload.userName || 'Background Worker',
            action: 'Create',
            module: 'Notifications',
            resource: `Job: ${job.jobId}`,
            details: `Dispatched ${job.queueName} notification to ${job.payload.recipient || 'system user'}`,
          });
          return { success: true, result: { delivered: true } };

        default:
          return { success: true, result: { processed: true } };
      }

      return { success: true, result: { processed: true } };
    } catch (err: any) {
      return { success: false, error: err.message || 'Worker processing error' };
    }
  }

  /**
   * Initializes BullMQ Workers across all queue channels.
   */
  static async startWorkerLoop(): Promise<void> {
    Logger.info(`[BULLMQ_WORKER] Starting persistent background worker instance (${this.activeWorkerId})...`);

    this.setupGracefulShutdown();

    const queueNames: QueueName[] = [
      'claims',
      'edi',
      'era',
      'reports',
      'exports',
      'emails',
      'notifications',
      'maintenance',
    ];

    for (const queueName of queueNames) {
      if (RedisService.isConnected) {
        const worker = new Worker(
          queueName,
          async (job: Job) => {
            const parsed = jobPayloadSchema.safeParse(job.data);
            if (!parsed.success) {
              Logger.error(`[BULLMQ_WORKER] Invalid payload on queue '${queueName}':`, parsed.error);
              throw new Error('Invalid job payload schema');
            }

            const sanitizedLog = this.sanitizePayloadForLogging(parsed.data.payload);
            Logger.info(
              `[BULLMQ_WORKER] Processing job '${job.id}' (${parsed.data.action}) on queue '${queueName}'`,
              sanitizedLog
            );

            const result = await this.processJob(parsed.data);
            if (!result.success) {
              throw new Error(result.error || 'Job execution failed');
            }

            return result.result;
          },
          {
            connection: RedisService.createDuplicateClient(),
            concurrency: 5,
            limiter: {
              max: 100,
              duration: 1000,
            },
          }
        );

        worker.on('completed', (job) => {
          Logger.info(`[BULLMQ_WORKER] Job '${job.id}' on queue '${queueName}' COMPLETED.`);
        });

        worker.on('failed', async (job, err) => {
          Logger.error(
            `[BULLMQ_WORKER] Job '${job?.id}' on queue '${queueName}' FAILED (Attempt ${job?.attemptsMade}): ${err.message}`
          );

          if (job && job.attemptsMade >= (job.opts.attempts || 3)) {
            Logger.warn(`[BULLMQ_WORKER] Job '${job.id}' exceeded max retries.`);
          }
        });

        this.workers.set(queueName, worker);
      } else {
        Logger.warn(`[BULLMQ_WORKER] Redis offline. Background queue '${queueName}' listening in fallback mode.`);
      }
    }
  }

  private static setupGracefulShutdown(): void {
    if (require.main !== module) return;

    const shutdownHandler = async (signal: string) => {
      if (this.isShuttingDown) return;
      this.isShuttingDown = true;

      Logger.info(`[BULLMQ_WORKER] ${signal} received. Initiating graceful shutdown of background workers...`);

      const workerList = Array.from(this.workers.values());
      for (const worker of workerList) {
        try {
          await worker.close();
        } catch (err) {
          Logger.error(`[BULLMQ_WORKER] Error closing worker:`, err);
        }
      }

      await RedisService.disconnect();
      Logger.info('[BULLMQ_WORKER] Graceful shutdown complete. Exiting process.');
      process.exit(0);
    };

    process.on('SIGTERM', () => shutdownHandler('SIGTERM'));
    process.on('SIGINT', () => shutdownHandler('SIGINT'));
  }
}

// Auto-start worker when run directly CLI / Docker CMD
if (require.main === module) {
  WorkerProcessor.startWorkerLoop().catch((err) => {
    Logger.error('Fatal BullMQ Worker Processor Failure', err);
    process.exit(1);
  });
}
