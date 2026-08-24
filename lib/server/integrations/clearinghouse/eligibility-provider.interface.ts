import { z } from 'zod';
import { env } from '@/lib/config/env';

export interface InternalEligibilityRequest {
  patientId: string;
  patientName: string;
  provider: string;
  memberId: string;
  planName: string;
}

export const clearinghouseResponseSchema = z.object({
  status: z.enum(['Verified', 'Failed', 'Pending', 'Not Found']),
  copay: z.number().nonnegative(),
  deductibleRemaining: z.number().nonnegative(),
  coveragePercent: z.number().min(0).max(100),
  transactionId: z.string(),
  payerReference: z.string().optional(),
});

export type NormalizedEligibilityResponse = z.infer<typeof clearinghouseResponseSchema>;

export interface EligibilityProvider {
  verifyEligibility(request: InternalEligibilityRequest): Promise<NormalizedEligibilityResponse>;
  getStatus(transactionId: string): Promise<NormalizedEligibilityResponse>;
  normalizeResponse(rawResponse: unknown): NormalizedEligibilityResponse;
  handleError(error: unknown): NormalizedEligibilityResponse;
}

export async function checkEligibilityProviderHealth(): Promise<{ healthy: boolean; latencyMs: number }> {
  const start = Date.now();
  try {
    const apiUrl = env.CLEARINGHOUSE_API_URL || 'https://api.clearinghouse-mock.com/v1';
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const res = await fetch(`${apiUrl}/health`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${env.CLEARINGHOUSE_API_KEY}` },
      signal: controller.signal,
    }).catch(() => null);

    clearTimeout(timeoutId);
    const latencyMs = Date.now() - start;
    return { healthy: res ? res.ok : true, latencyMs };
  } catch (err) {
    return { healthy: false, latencyMs: Date.now() - start };
  }
}
