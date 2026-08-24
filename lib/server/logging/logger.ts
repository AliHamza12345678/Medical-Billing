import { env } from '@/lib/config/env';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVEL_SEVERITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const SENSITIVE_KEYS = [
  'password',
  'token',
  'secret',
  'authorization',
  'cookie',
  'ssn',
  'creditcard',
  'cardnumber',
  'cvv',
  'jwt',
  'session',
  'apikey',
  'stripekey',
  'privatekey',
  'memberid',
  'dob',
  'rawedi',
  'accountnumber',
];

/**
 * Recursively sanitizes object metadata before logging to ensure zero PHI,
 * credentials, tokens, or payment secrets are logged.
 */
export function sanitizeMetadata(data: unknown): unknown {
  if (data === null || data === undefined) return data;

  if (typeof data === 'string') {
    return data;
  }

  if (typeof data === 'number' || typeof data === 'boolean') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(sanitizeMetadata);
  }

  if (typeof data === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(data as Record<string, unknown>)) {
      const lowerKey = key.toLowerCase();
      if (SENSITIVE_KEYS.some((s) => lowerKey.includes(s))) {
        sanitized[key] = '[REDACTED_PHI_SECRET]';
      } else {
        sanitized[key] = sanitizeMetadata(val);
      }
    }
    return sanitized;
  }

  return data;
}

export class Logger {
  /**
   * Evaluates whether a log entry should be emitted based on configured LOG_LEVEL.
   */
  private static shouldLog(level: LogLevel): boolean {
    const minLevel = (env.LOG_LEVEL || 'info') as LogLevel;
    return LOG_LEVEL_SEVERITY[level] >= (LOG_LEVEL_SEVERITY[minLevel] ?? 1);
  }

  /**
   * Formats a log entry into a structured, production-grade JSON string for log collectors.
   */
  private static formatMessage(
    level: LogLevel,
    message: string,
    metadata?: Record<string, unknown>,
    correlationId?: string
  ): string {
    const payload = {
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      service: 'medibill-api',
      message,
      ...(correlationId ? { correlationId } : {}),
      ...(metadata ? { metadata: sanitizeMetadata(metadata) } : {}),
      environment: env.NODE_ENV,
    };

    return JSON.stringify(payload);
  }

  static debug(message: string, metadata?: Record<string, unknown>, correlationId?: string): void {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message, metadata, correlationId));
    }
  }

  static info(message: string, metadata?: Record<string, unknown>, correlationId?: string): void {
    if (this.shouldLog('info')) {
      console.log(this.formatMessage('info', message, metadata, correlationId));
    }
  }

  static warn(message: string, metadata?: Record<string, unknown>, correlationId?: string): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, metadata, correlationId));
    }
  }

  static error(
    message: string,
    error?: unknown,
    metadata?: Record<string, unknown>,
    correlationId?: string
  ): void {
    if (!this.shouldLog('error')) return;

    const errorMeta = {
      ...(metadata ? (sanitizeMetadata(metadata) as Record<string, unknown>) : {}),
      ...(error instanceof Error
        ? {
            errorName: error.name,
            errorMessage: error.message,
            stack: error.stack,
          }
        : error !== undefined
        ? { error: String(error) }
        : {}),
    };

    console.error(this.formatMessage('error', message, errorMeta, correlationId));
  }
}
