import { CodingValidationEngine } from '../lib/server/coding/validation-engine';
import { FinancialReconciliationEngine } from '../lib/server/jobs/reconciliation-engine';
import { QueueManager } from '../lib/server/queues/queue-manager';

async function runProductionTestSuite() {
  console.log('=== MEDIBILL PRO AUTOMATED TEST SUITE ===\n');

  // 1. Test Coding Validation Engine
  console.log('[1/4] Testing Coding Validation Engine...');
  const codingValid = await CodingValidationEngine.validateCharge({
    cptCode: '99214',
    icd10Code: 'E11.9',
    quantity: 1,
    unitCharge: 150.00,
    serviceDate: new Date(),
  });
  if (!codingValid.isValid) {
    throw new Error('Coding validation test failed!');
  }
  console.log(' -> PASSED: Active CPT & ICD-10 codes validated successfully.\n');

  // 2. Test Queue Manager Idempotency
  console.log('[2/4] Testing Queue Manager Idempotency...');
  const job1 = await QueueManager.enqueue('edi', 'generate-837', { claimId: 'claim-123' }, 'test-idempotency-key');
  const job2 = await QueueManager.enqueue('edi', 'generate-837', { claimId: 'claim-123' }, 'test-idempotency-key');
  if (job1.status !== 'queued' || job2.status !== 'duplicate') {
    throw new Error('Queue idempotency test failed!');
  }
  console.log(' -> PASSED: Duplicate job keys rejected correctly.\n');

  // 3. Test Financial Reconciliation Engine
  console.log('[3/4] Testing Financial Reconciliation Engine...');
  const recon = await FinancialReconciliationEngine.reconcileLedgerBalances();
  if (recon.status !== 'RECONCILED') {
    throw new Error('Financial reconciliation check failed!');
  }
  console.log(` -> PASSED: Ledger reconciled. Status: ${recon.status}, Billed: $${recon.totalBilled.toFixed(2)}, Paid: $${recon.totalPaid.toFixed(2)}.\n`);

  console.log('=== ALL AUTOMATED PRODUCTION TESTS PASSED (0 ERRORS) ===');
}

runProductionTestSuite().catch((err) => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
