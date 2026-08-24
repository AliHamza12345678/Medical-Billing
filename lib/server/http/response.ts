import { NextResponse } from 'next/server';
import { ApiError } from '../errors/api-error';
import { Logger } from '../logging/logger';

export interface ApiResponseMeta {
  version?: string;
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
  timestamp: string;
  requestId?: string;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: ApiResponseMeta;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
    requestId?: string;
  };
}

export function apiResponse<T>(
  data: T,
  meta?: Omit<ApiResponseMeta, 'timestamp'>,
  status = 200,
  headers?: Record<string, string>
): NextResponse<ApiSuccessResponse<T>> {
  const responseHeaders = new Headers(headers);

  return NextResponse.json(
    {
      success: true,
      data,
      meta: {
        ...meta,
        timestamp: new Date().toISOString(),
      },
    },
    {
      status,
      headers: responseHeaders,
    }
  );
}

export function handleApiError(
  error: unknown,
  correlationId?: string
): NextResponse<ApiErrorResponse> {
  if (error instanceof ApiError) {
    if (error.statusCode >= 500) {
      Logger.error(`API Error [${error.code}]`, error, { statusCode: error.statusCode }, correlationId);
    } else {
      Logger.warn(`API Client Warning [${error.code}]: ${error.message}`, { details: error.details }, correlationId);
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          ...(error.details ? { details: error.details } : {}),
          ...(correlationId ? { requestId: correlationId } : {}),
        },
      },
      { status: error.statusCode }
    );
  }

  // HIPAA & Production Safety: Log actual unhandled error on server, never return stack traces to client
  Logger.error('Unhandled Server Exception', error, undefined, correlationId);

  const errorMsg = error instanceof Error ? error.message : String(error);
  const isDbConnectError = errorMsg.includes("Can't reach database server") || errorMsg.includes('PrismaClientInitializationError');

  const clientMessage = isDbConnectError && process.env.NODE_ENV !== 'production'
    ? 'Database Connection Error: Unable to connect to PostgreSQL at localhost:5432. Please start the PostgreSQL database service.'
    : 'An unexpected internal server error occurred';

  return NextResponse.json(
    {
      success: false,
      error: {
        code: isDbConnectError ? 'DATABASE_CONNECTION_ERROR' : 'INTERNAL_ERROR',
        message: clientMessage,
        ...(correlationId ? { requestId: correlationId } : {}),
      },
    },
    { status: 500 }
  );
}
