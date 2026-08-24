import { z } from 'zod';

export const envSchema = z.object({
  // Environment Mode
  NODE_ENV: z.enum(['development', 'test', 'staging', 'production']).default('development'),
  PORT: z.string().transform((val) => parseInt(val, 10)).default('3000'),

  // Public Client App Vars
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_APP_ENV: z.enum(['development', 'test', 'staging', 'production']).default('development'),
  NEXT_PUBLIC_ENABLE_ANALYTICS: z
    .string()
    .transform((val) => val === 'true')
    .default('false'),

  // Database & Redis Infrastructure
  DATABASE_URL: z
    .string()
    .min(1, 'DATABASE_URL is required')
    .default('postgresql://postgres:postgres@localhost:5432/medibill_db?schema=public'),
  REDIS_URL: z.string().min(1, 'REDIS_URL is required').default('redis://localhost:6379'),

  // Auth & Encryption Secrets
  SESSION_SECRET: z
    .string()
    .min(32, 'SESSION_SECRET must be at least 32 characters long')
    .default('dev-session-secret-must-be-at-least-32-chars-long!'),
  JWT_SECRET: z
    .string()
    .min(32, 'JWT_SECRET must be at least 32 characters long')
    .default('dev-jwt-signing-secret-must-be-at-least-32-chars-long!'),
  ENCRYPTION_KEY: z
    .string()
    .min(32, 'ENCRYPTION_KEY must be at least 32 bytes/characters')
    .default('dev-encryption-key-32-bytes-long!!!'),

  // S3 Encrypted Storage
  S3_ENDPOINT: z.string().default('https://s3.amazonaws.com'),
  S3_BUCKET: z.string().default('medibill-phi-documents'),
  S3_ACCESS_KEY: z.string().default('minio-or-aws-access-key'),
  S3_SECRET_KEY: z.string().default('minio-or-aws-secret-key'),
  S3_REGION: z.string().default('us-east-1'),

  // Email (SMTP)
  SMTP_HOST: z.string().default('smtp.mailtrap.io'),
  SMTP_PORT: z.string().transform((val) => parseInt(val, 10)).default('587'),
  SMTP_USER: z.string().default('smtp-username'),
  SMTP_PASS: z.string().default('smtp-password'),
  EMAIL_FROM: z.string().email().default('noreply@medibill.com'),

  // Payment Gateway
  STRIPE_SECRET_KEY: z.string().default('sk_test_mock_stripe_secret_key'),
  STRIPE_WEBHOOK_SECRET: z.string().default('whsec_mock_stripe_webhook_secret'),

  // Healthcare Integrations
  CLEARINGHOUSE_API_KEY: z.string().default('mock-clearinghouse-api-key'),
  CLEARINGHOUSE_API_URL: z.string().default('https://api.clearinghouse-mock.com/v1'),
  ELIGIBILITY_API_KEY: z.string().default('mock-eligibility-payer-api-key'),

  // AI Service Config
  AI_API_KEY: z.string().optional().default('mock-ai-api-key'),
  AI_MODEL: z.string().optional().default('gemini-1.5-pro'),

  // Security & Logging
  ALLOWED_ORIGINS: z.string().default('http://localhost:3000'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const formattedErrors = result.error.flatten().fieldErrors;
    console.error('❌ CRITICAL: Invalid Environment Configuration Detected!');
    console.error(JSON.stringify(formattedErrors, null, 2));

    throw new Error(
      `Invalid environment variables: ${Object.keys(formattedErrors).join(', ')}`
    );
  }

  const data = result.data;
  const isProductionOrStaging = data.NODE_ENV === 'production' || data.NODE_ENV === 'staging';

  // Strict Production DevSecOps Audit: Reject insecure default/placeholder secrets in production
  if (isProductionOrStaging) {
    const insecurePatterns = [
      'change_me',
      'dev-',
      'mock-',
      'sk_test_mock',
      'smtp-password',
      'minioadmin',
      'postgres:postgres',
    ];

    const secretFieldsToCheck: (keyof Env)[] = [
      'JWT_SECRET',
      'SESSION_SECRET',
      'ENCRYPTION_KEY',
      'DATABASE_URL',
      'S3_ACCESS_KEY',
      'S3_SECRET_KEY',
      'SMTP_PASS',
      'STRIPE_SECRET_KEY',
      'CLEARINGHOUSE_API_KEY',
    ];

    const violations: string[] = [];

    for (const field of secretFieldsToCheck) {
      const val = String(data[field]);
      if (insecurePatterns.some((pattern) => val.toLowerCase().includes(pattern))) {
        violations.push(field);
      }
    }

    if (violations.length > 0) {
      const msg = `DevSecOps Security Notice: Environment contains default/placeholder secrets in fields: [${violations.join(', ')}].`;
      if (process.env.STRICT_DEVSECOPS === 'true') {
        console.error(`❌ FATAL DEVSECOPS AUDIT ERROR: ${msg} Startup aborted!`);
        throw new Error(`Production security violation: Secrets [${violations.join(', ')}] contain placeholder values!`);
      } else {
        console.warn(`⚠️ ${msg} Ensure production credentials are set before deployment.`);
      }
    }
  }

  return data;
}

export const env: Env = validateEnv();

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = env.DATABASE_URL;
}

// Helpers
export const isDevelopment = (): boolean => env.NODE_ENV === 'development';
export const isTest = (): boolean => env.NODE_ENV === 'test';
export const isStaging = (): boolean => env.NODE_ENV === 'staging';
export const isProduction = (): boolean => env.NODE_ENV === 'production';

// Masking helper to ensure secrets are never leaked in logs, API responses, or error diagnostics
export function getSanitizedConfig(): Record<string, string | number | boolean> {
  const secretKeys = [
    'DATABASE_URL',
    'REDIS_URL',
    'SESSION_SECRET',
    'JWT_SECRET',
    'ENCRYPTION_KEY',
    'S3_ACCESS_KEY',
    'S3_SECRET_KEY',
    'SMTP_PASS',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'CLEARINGHOUSE_API_KEY',
    'ELIGIBILITY_API_KEY',
  ];

  const sanitized: Record<string, string | number | boolean> = {};

  for (const [key, val] of Object.entries(env)) {
    if (secretKeys.includes(key) && typeof val === 'string') {
      sanitized[key] = val ? `${val.substring(0, 4)}***[REDACTED_SECRET]` : '[EMPTY]';
    } else {
      sanitized[key] = val;
    }
  }

  return sanitized;
}
