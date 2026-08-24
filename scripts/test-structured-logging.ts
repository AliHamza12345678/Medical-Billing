import '@/lib/config/env';
import { Logger, sanitizeMetadata } from '../lib/server/logging/logger';
import { MetricsService } from '../lib/server/monitoring/metrics-service';
import { AuditLogger } from '../lib/server/audit/audit-logger';

async function runStructuredLoggingTestSuite() {
  console.log('=== STRUCTURED PRODUCTION LOGGING TEST SUITE ===\n');

  // Intercept console outputs for verification
  let lastLogOutput = '';
  const originalLog = console.log;
  const originalWarn = console.warn;
  const originalError = console.error;
  const originalDebug = console.debug;

  console.log = (msg: string) => { lastLogOutput = msg; };
  console.warn = (msg: string) => { lastLogOutput = msg; };
  console.error = (msg: string) => { lastLogOutput = msg; };
  console.debug = (msg: string) => { lastLogOutput = msg; };

  try {
    // TEST 1: Structured JSON Formatting & Schema Compliance
    originalLog('[1/5] Testing Structured JSON Log Formatting & Schema...');
    const testCorrelationId = 'req-corr-998877';
    Logger.info('User authenticated successfully', { userId: 'usr-100', role: 'Administrator' }, testCorrelationId);

    const parsedLog = JSON.parse(lastLogOutput);
    if (parsedLog.service !== 'medibill-api') throw new Error('Missing service field');
    if (parsedLog.level !== 'INFO') throw new Error(`Expected level 'INFO', got '${parsedLog.level}'`);
    if (parsedLog.correlationId !== testCorrelationId) throw new Error('Correlation ID mismatch');
    if (!parsedLog.timestamp || !parsedLog.environment) throw new Error('Missing timestamp or environment');
    originalLog(' -> PASSED: Log output is valid structured JSON with service, level, correlationId, and timestamp.\n');

    // TEST 2: Centralized Metadata Sanitization & PHI Redaction
    originalLog('[2/5] Testing Centralized Metadata Sanitization & PHI Redaction...');
    const sensitiveData = {
      user: 'John Doe',
      ssn: '000-11-2222',
      password: 'SuperSecretPassword123!',
      token: 'jwt-session-token-abcd',
      cardNumber: '4111222233334444',
      cvv: '123',
      rawEdi: 'ISA*00*...~',
      nested: {
        authorization: 'Bearer secret-key-99',
        dob: '1990-01-01',
      },
    };

    const sanitized = sanitizeMetadata(sensitiveData) as Record<string, any>;

    if (
      sanitized.ssn !== '[REDACTED_PHI_SECRET]' ||
      sanitized.password !== '[REDACTED_PHI_SECRET]' ||
      sanitized.token !== '[REDACTED_PHI_SECRET]' ||
      sanitized.cardNumber !== '[REDACTED_PHI_SECRET]' ||
      sanitized.cvv !== '[REDACTED_PHI_SECRET]' ||
      sanitized.rawEdi !== '[REDACTED_PHI_SECRET]' ||
      sanitized.nested.authorization !== '[REDACTED_PHI_SECRET]' ||
      sanitized.nested.dob !== '[REDACTED_PHI_SECRET]'
    ) {
      throw new Error('REDACTION FAILURE: Sensitive fields were not properly masked!');
    }
    originalLog(' -> PASSED: All sensitive credentials, tokens, and PHI redacted to [REDACTED_PHI_SECRET].\n');

    // TEST 3: Error Logging & Stack Trace Preservation
    originalLog('[3/5] Testing Error Logging & Stack Trace Preservation...');
    const testError = new Error('Database connection failed');
    Logger.error('Unhandled Database Error', testError, { dbHost: 'postgres:5432' }, 'req-err-123');

    const parsedErrLog = JSON.parse(lastLogOutput);
    if (parsedErrLog.level !== 'ERROR') throw new Error('Expected level ERROR');
    if (parsedErrLog.metadata.errorMessage !== 'Database connection failed') throw new Error('Missing errorMessage');
    if (!parsedErrLog.metadata.stack) throw new Error('Error stack trace not preserved');
    originalLog(' -> PASSED: Error stack traces preserved cleanly in JSON logs.\n');

    // TEST 4: Audit Logger Integration
    originalLog('[4/5] Testing AuditLogger Integration with Structured Logger...');
    await AuditLogger.log({
      userId: 'usr-200',
      userName: 'Alice Smith',
      action: 'Update',
      module: 'Patients',
      resource: 'Patient: pat-100',
      details: 'Updated insurance coverage details',
      correlationId: 'req-audit-456',
    });

    const parsedAudit = JSON.parse(lastLogOutput);
    if (!parsedAudit.message.includes('[AUDIT_LOG]')) throw new Error('Audit log prefix missing');
    if (parsedAudit.correlationId !== 'req-audit-456') throw new Error('Correlation ID missing in audit log');
    originalLog(' -> PASSED: Audit log entries formatted cleanly as structured JSON logs.\n');

    // TEST 5: MetricsService HTTP Request Logging
    originalLog('[5/5] Testing MetricsService HTTP Request Logging...');
    MetricsService.logRequest({
      requestId: 'req-http-789',
      route: '/api/claims',
      method: 'POST',
      status: 422,
      durationMs: 45,
      errorCategory: 'VALIDATION_ERROR',
      timestamp: new Date().toISOString(),
    });

    const parsedHttp = JSON.parse(lastLogOutput);
    if (parsedHttp.level !== 'WARN') throw new Error('Expected 422 status to log as WARN');
    if (parsedHttp.metadata.durationMs !== 45) throw new Error('Duration metric missing');
    if (parsedHttp.correlationId !== 'req-http-789') throw new Error('Correlation ID missing in HTTP metrics log');
    originalLog(' -> PASSED: HTTP request metrics logged cleanly with WARN level for 4xx errors.\n');

  } finally {
    console.log = originalLog;
    console.warn = originalWarn;
    console.error = originalError;
    console.debug = originalDebug;
  }

  console.log('=== ALL STRUCTURED LOGGING TESTS PASSED (0 ERRORS) ===');
}

runStructuredLoggingTestSuite().catch((err) => {
  console.error('❌ Structured Logging Test Suite Failed:', err);
  process.exit(1);
});
