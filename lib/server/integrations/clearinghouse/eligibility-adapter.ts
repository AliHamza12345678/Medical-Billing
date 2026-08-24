import { clearinghouseService } from './clearinghouse-service';

export interface EligibilityRequestParams {
  patientId: string;
  patientName: string;
  provider: string;
  memberId: string;
  planName: string;
}

export interface EligibilityResponseResult {
  status: 'Verified' | 'Failed' | 'Pending' | 'Not Found';
  copay: number;
  deductibleRemaining: number;
  coveragePercent: number;
  referenceNumber: string;
  responseTimestamp: Date;
  rawResponse?: string;
}

export interface IEligibilityAdapter {
  verify(params: EligibilityRequestParams): Promise<EligibilityResponseResult>;
}

export class ClearinghouseEligibilityAdapter implements IEligibilityAdapter {
  /**
   * Performs real 270/271 Real-Time Clearinghouse EDI eligibility verification.
   * Removes all static / mock fallback data from production.
   */
  async verify(params: EligibilityRequestParams): Promise<EligibilityResponseResult> {
    const res = await clearinghouseService.verifyEligibility({
      patientId: params.patientId,
      patientName: params.patientName,
      provider: params.provider,
      memberId: params.memberId,
      planName: params.planName,
    });

    return {
      status: res.status,
      copay: res.copay,
      deductibleRemaining: res.deductibleRemaining,
      coveragePercent: res.coveragePercent,
      referenceNumber: res.payerReference || res.transactionId,
      responseTimestamp: new Date(),
      rawResponse: JSON.stringify({
        ediStandard: 'X12-271',
        transactionId: res.transactionId,
        payerReference: res.payerReference,
        status: res.status,
        copay: res.copay,
        deductibleRemaining: res.deductibleRemaining,
        coveragePercent: res.coveragePercent,
      }),
    };
  }
}

export const eligibilityAdapter = new ClearinghouseEligibilityAdapter();
