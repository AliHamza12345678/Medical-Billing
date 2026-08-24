export type ApiErrorCode =
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'VALIDATION_ERROR'
  | 'BUSINESS_RULE_VIOLATION'
  | 'TOO_MANY_REQUESTS'
  | 'DATABASE_ERROR'
  | 'EXTERNAL_SERVICE_ERROR'
  | 'SERVICE_UNAVAILABLE'
  | 'INTERNAL_ERROR';

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: ApiErrorCode;
  public readonly details?: Record<string, string[]>;

  constructor(
    statusCode: number,
    code: ApiErrorCode,
    message: string,
    details?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  static badRequest(message: string, details?: Record<string, string[]>): ApiError {
    return new ApiError(400, 'BAD_REQUEST', message, details);
  }

  static unauthorized(message = 'Authentication required'): ApiError {
    return new ApiError(401, 'UNAUTHORIZED', message);
  }

  static forbidden(message = 'Access forbidden'): ApiError {
    return new ApiError(403, 'FORBIDDEN', message);
  }

  static notFound(message = 'Resource not found'): ApiError {
    return new ApiError(404, 'NOT_FOUND', message);
  }

  static conflict(message: string): ApiError {
    return new ApiError(409, 'CONFLICT', message);
  }

  static validation(message: string, details?: Record<string, string[]>): ApiError {
    return new ApiError(422, 'VALIDATION_ERROR', message, details);
  }

  static businessRuleViolation(message: string, details?: Record<string, string[]>): ApiError {
    return new ApiError(422, 'BUSINESS_RULE_VIOLATION', message, details);
  }

  static rateLimitExceeded(message = 'Too many requests, please try again later'): ApiError {
    return new ApiError(429, 'TOO_MANY_REQUESTS', message);
  }

  static database(message = 'A database error occurred'): ApiError {
    return new ApiError(500, 'DATABASE_ERROR', message);
  }

  static externalService(message = 'External healthcare integration service failed'): ApiError {
    return new ApiError(502, 'EXTERNAL_SERVICE_ERROR', message);
  }

  static serviceUnavailable(message = 'Service temporarily unavailable'): ApiError {
    return new ApiError(503, 'SERVICE_UNAVAILABLE', message);
  }

  static internal(message = 'An unexpected internal server error occurred'): ApiError {
    return new ApiError(500, 'INTERNAL_ERROR', message);
  }
}
