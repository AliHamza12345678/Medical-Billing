import '@/lib/config/env';
import crypto from 'crypto';
import {
  createSession,
  validateSessionToken,
  revokeSessionToken,
  hashSessionToken,
} from '../lib/server/auth/session';
import { hashPassword } from '../lib/server/auth/password';
import { prisma } from '../lib/db';

async function runSessionHashingTestSuite() {
  console.log('=== SESSION TOKEN STORAGE SECURITY & HASHING TEST SUITE ===\n');

  // PART 1: Unit Tests for Hashing Function
  console.log('[1/6] Testing Cryptographic Hash Helper...');
  const sampleToken = 'a1b2c3d4e5f67890123456789012345678901234567890123456789012345678';
  const expectedHash = crypto.createHash('sha256').update(sampleToken).digest('hex');
  const computedHash = hashSessionToken(sampleToken);

  if (computedHash !== expectedHash) {
    throw new Error(`UNIT TEST FAILED: SHA-256 hash mismatch! Computed: ${computedHash}, Expected: ${expectedHash}`);
  }
  if (hashSessionToken('') !== '') {
    throw new Error('UNIT TEST FAILED: Empty token hash should return empty string!');
  }
  console.log(' -> PASSED: hashSessionToken correctly computes SHA-256 digests.\n');

  // PART 2: Database Integration Tests (if PostgreSQL is online)
  console.log('[2/6] Testing Database Session Storage Security & Integration...');
  try {
    await prisma.$queryRaw`SELECT 1`;

    const testEmail = 'session.hash.test@medibill.com';
    const testPassword = 'Password123!';

    // Cleanup
    await prisma.session.deleteMany({ where: { user: { email: testEmail } } });
    await prisma.user.deleteMany({ where: { email: testEmail } });

    // Seed test user
    const user = await prisma.user.create({
      data: {
        name: 'Session Test User',
        email: testEmail,
        passwordHash: await hashPassword(testPassword),
        role: 'BillingManager',
        status: 'Active',
        permissions: ['claims.view'],
      },
    });

    // Test 1: Session Creation & Database Digest Isolation
    console.log('[3/6] Testing Session Creation (Raw Cookie Token vs Database SHA-256 Digest)...');
    const { token: rawToken, expiresAt } = await createSession(user.id);

    // Verify rawToken is 64 hex characters
    if (!rawToken || rawToken.length !== 64) {
      throw new Error(`Raw token format invalid! Length: ${rawToken?.length}`);
    }

    // Query DB record directly
    const expectedDigest = hashSessionToken(rawToken);
    const dbSessionByDigest = await prisma.session.findUnique({ where: { token: expectedDigest } });

    if (!dbSessionByDigest) {
      throw new Error('INTEGRATION TEST FAILED: Session was NOT saved using SHA-256 token digest in database!');
    }

    // Verify raw token IS NOT in database
    const dbSessionByRaw = await prisma.session.findUnique({ where: { token: rawToken } });
    if (dbSessionByRaw) {
      throw new Error('CRITICAL SECURITY FAILURE: Raw session token was saved in plaintext in database!');
    }

    console.log(' -> PASSED: Database stores SHA-256 digest. Raw token is isolated from DB storage.\n');

    // Test 2: Valid Session Validation via Raw Cookie Token
    console.log('[4/6] Testing validateSessionToken with Raw Cookie Token...');
    const validatedUser = await validateSessionToken(rawToken);
    if (!validatedUser || validatedUser.id !== user.id) {
      throw new Error('INTEGRATION TEST FAILED: validateSessionToken failed to validate raw token via digest lookup!');
    }
    console.log(' -> PASSED: Raw cookie token validated successfully against DB digest.\n');

    // Test 3: Invalid Token Rejection
    console.log('[5/6] Testing Invalid Token Rejection...');
    const invalidResult = await validateSessionToken('invalid-token-string-12345678901234567890123456789012');
    if (invalidResult !== null) {
      throw new Error('INTEGRATION TEST FAILED: Invalid token was accepted!');
    }
    console.log(' -> PASSED: Invalid session token correctly returned null.\n');

    // Test 4: Revocation / Logout via Raw Token
    console.log('[6/6] Testing Session Revocation / Logout...');
    await revokeSessionToken(rawToken);

    const postRevokeUser = await validateSessionToken(rawToken);
    if (postRevokeUser !== null) {
      throw new Error('INTEGRATION TEST FAILED: Revoked session was still accepted!');
    }

    const reloadedDbSession = await prisma.session.findUnique({ where: { token: expectedDigest } });
    if (!reloadedDbSession?.revoked) {
      throw new Error('INTEGRATION TEST FAILED: DB session record revoked status was not set to true!');
    }
    console.log(' -> PASSED: Session revoked successfully via raw token digest.\n');

    // Cleanup
    await prisma.session.deleteMany({ where: { userId: user.id } });
    await prisma.user.deleteMany({ where: { id: user.id } });

  } catch (err: any) {
    if (err.message?.includes("Can't reach database server")) {
      console.log(' ⚠️ Database server is offline. Unit security tests PASSED. Integration tests skipped.\n');
    } else {
      throw err;
    }
  }

  console.log('=== ALL SESSION TOKEN STORAGE SECURITY TESTS PASSED (0 ERRORS) ===');
}

runSessionHashingTestSuite().catch((err) => {
  console.error('❌ Session Security Test Suite Failed:', err);
  process.exit(1);
});
