import { ApiError } from '../errors/api-error';

export class SessionSecurity {
  private static failedAttempts = new Map<string, { count: number; lockUntil: number }>();

  static checkLoginAttempts(ipAddress: string): void {
    const record = this.failedAttempts.get(ipAddress);
    const now = Date.now();

    if (record) {
      if (now < record.lockUntil) {
        throw ApiError.rateLimitExceeded(
          'Too many failed login attempts. Your IP has been temporarily locked for 15 minutes.'
        );
      } else if (now >= record.lockUntil && record.count >= 5) {
        this.failedAttempts.delete(ipAddress);
      }
    }
  }

  static recordFailedAttempt(ipAddress: string): void {
    const record = this.failedAttempts.get(ipAddress) || { count: 0, lockUntil: 0 };
    record.count += 1;
    if (record.count >= 5) {
      record.lockUntil = Date.now() + 15 * 60 * 1000; // 15 minute lock
    }
    this.failedAttempts.set(ipAddress, record);
  }

  static resetLoginAttempts(ipAddress: string): void {
    this.failedAttempts.delete(ipAddress);
  }

  static getProductionCookieConfig() {
    const isProd = process.env.NODE_ENV === 'production';
    return {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 24 * 60 * 60, // 24 hours
    };
  }
}
