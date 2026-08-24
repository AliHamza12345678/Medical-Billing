import crypto from 'crypto';
import { env } from '@/lib/config/env';

export class PhiProtector {
  private static algorithm = 'aes-256-gcm';
  private static secretKey = crypto.scryptSync(
    env.ENCRYPTION_KEY,
    'medibill-salt',
    32
  );

  static encryptField(plaintext: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.secretKey, iv) as crypto.CipherGCM;
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  }

  static decryptField(ciphertext: string): string {
    try {
      const parts = ciphertext.split(':');
      if (parts.length !== 3) return ciphertext;
      const [ivHex, authTagHex, encryptedHex] = parts;
      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');
      const decipher = crypto.createDecipheriv(this.algorithm, this.secretKey, iv) as crypto.DecipherGCM;
      decipher.setAuthTag(authTag);
      let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch {
      return ciphertext;
    }
  }

  static redactPhiPayload(payload: Record<string, any>): Record<string, any> {
    const redacted = { ...payload };

    if (typeof redacted.ssn === 'string') {
      redacted.ssn = `***-**-${redacted.ssn.slice(-4)}`;
    }
    if (typeof redacted.cardNumber === 'string') {
      redacted.cardNumber = `****-****-****-${redacted.cardNumber.slice(-4)}`;
    }
    if (typeof redacted.cvv === 'string') {
      redacted.cvv = '***';
    }
    if (typeof redacted.dob === 'string') {
      redacted.dob = '★★/★★/★★★★';
    }

    return redacted;
  }
}
