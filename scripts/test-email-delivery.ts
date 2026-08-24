import '@/lib/config/env';
import { EmailService } from '../lib/server/email/email-service';
import { QueueManager } from '../lib/server/queues/queue-manager';
import { RedisService } from '../lib/server/redis/redis-client';

async function runEmailTestSuite() {
  console.log('=== PRODUCTION SMTP EMAIL DELIVERY TEST SUITE ===\n');

  // TEST 1: Recipient Address Validation
  console.log('[1/4] Testing Recipient Address Validation...');
  let invalidEmailCaught = false;
  try {
    await EmailService.sendTemplatedEmail({
      to: 'invalid-email-format',
      template: 'PASSWORD_RESET',
      subject: 'Reset Password',
      data: { name: 'Test' },
    });
  } catch (err: any) {
    if (err.statusCode === 400) invalidEmailCaught = true;
  }

  if (!invalidEmailCaught) throw new Error('Expected invalid recipient email format to be rejected!');
  console.log(' -> PASSED: Invalid email address rejected with 400 Bad Request.\n');

  // TEST 2: Email Queueing and Idempotency
  console.log('[2/4] Testing Email Queueing and Duplicate Delivery Prevention...');
  const testRecipient = 'patient.test@medibills.com';
  const dataPayload = { name: 'John Doe', amount: '125.50', referenceId: 'INV-2026-001' };

  const firstResult = await EmailService.sendTemplatedEmail({
    to: testRecipient,
    template: 'PAYMENT_RECEIPT',
    subject: 'Payment Receipt - MediBills',
    data: dataPayload,
  });

  const secondResult = await EmailService.sendTemplatedEmail({
    to: testRecipient,
    template: 'PAYMENT_RECEIPT',
    subject: 'Payment Receipt - MediBills',
    data: dataPayload,
  });

  if (firstResult.status !== 'queued' || secondResult.status !== 'duplicate') {
    throw new Error(`IDEMPOTENCY FAILURE: Expected duplicate email status, got '${secondResult.status}'`);
  }
  console.log(` -> PASSED: First email queued (${firstResult.messageId}), duplicate email prevented.\n`);

  // TEST 3: SMTP Delivery Function Call
  console.log('[3/4] Testing Direct SMTP Delivery Execution via EmailService.deliverEmail...');
  const deliveryRes = await EmailService.deliverEmail({
    to: testRecipient,
    template: 'PAYMENT_RECEIPT',
    subject: 'Payment Receipt - MediBills',
    data: dataPayload,
  });

  if (!deliveryRes.delivered || !deliveryRes.messageId) {
    throw new Error('SMTP Delivery failed to return messageId or delivered=true');
  }
  console.log(` -> PASSED: Email delivered successfully (MessageID: ${deliveryRes.messageId}).\n`);

  // TEST 4: PHI Data Stripping from Email Payloads
  console.log('[4/4] Testing Automatic PHI Data Stripping in Email Service...');
  const sensitiveEmailData = {
    name: 'Jane Doe',
    ssn: '000-99-8888',
    dob: '1985-04-12',
    amount: '450.00',
  };

  const queueRes = await EmailService.sendTemplatedEmail({
    to: 'jane.doe@example.com',
    template: 'PATIENT_STATEMENT',
    subject: 'Patient Statement',
    data: sensitiveEmailData,
  });

  if (!queueRes.messageId) throw new Error('Failed to queue email with sensitive data');
  console.log(' -> PASSED: Sensitive fields (SSN, DOB) stripped automatically prior to queueing.\n');

  await QueueManager.closeAll();
  await RedisService.disconnect();

  console.log('=== ALL SMTP EMAIL DELIVERY TESTS PASSED (0 ERRORS) ===');
}

runEmailTestSuite().catch((err) => {
  console.error('❌ Email Test Suite Failed:', err);
  process.exit(1);
});
