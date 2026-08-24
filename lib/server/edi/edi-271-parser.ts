import { NormalizedEligibilityResponse, clearinghouseResponseSchema } from '../integrations/clearinghouse/eligibility-provider.interface';
import { ApiError } from '../errors/api-error';
import { Logger } from '../logging/logger';

export interface Parsed271Result {
  controlNumber: string;
  isaControlNumber?: string;
  gsControlNumber?: string;
  status: 'Verified' | 'Failed' | 'Pending' | 'Not Found';
  copay: number;
  deductibleRemaining: number;
  coveragePercent: number;
  payerReference?: string;
  rejectionReason?: string;
  rawSegments: string[];
}

export class Edi271Parser {
  /**
   * Parses an ANSI X12 271 Health Care Eligibility Benefit Response payload,
   * validates control number correlation, and normalizes eligibility benefit values.
   */
  static parse271Response(
    rawPayload: string,
    expectedControlNumber?: string
  ): Parsed271Result {
    if (!rawPayload || typeof rawPayload !== 'string' || rawPayload.trim() === '') {
      throw ApiError.badRequest('Empty or invalid EDI 271 payload received from clearinghouse');
    }

    const segments = rawPayload
      .replace(/\r\n/g, '\n')
      .split(/~|\n/)
      .map((s) => s.trim())
      .filter(Boolean);

    const hasEdiMarkers = segments.some((s) =>
      s.startsWith('ISA*') || s.startsWith('ST*') || s.startsWith('BHT*') || s.startsWith('EB*') || s.startsWith('AAA*')
    );
    if (!hasEdiMarkers) {
      throw ApiError.badRequest('Malformed or unrecognized EDI 271 payload structure');
    }

    let controlNumber = '';
    let isaControlNumber = '';
    let gsControlNumber = '';
    let status: 'Verified' | 'Failed' | 'Pending' | 'Not Found' = 'Failed';
    let copay = 0;
    let deductibleRemaining = 0;
    let coveragePercent = 0;
    let payerReference = '';
    let rejectionReason = '';

    let foundActiveCoverage = false;
    let foundInactive = false;
    let foundRejection = false;

    for (const segment of segments) {
      const fields = segment.split('*');
      const tag = fields[0];

      if (tag === 'ISA') {
        isaControlNumber = fields[13] || '';
      } else if (tag === 'GS') {
        gsControlNumber = fields[6] || '';
      } else if (tag === 'BHT') {
        controlNumber = fields[3] || '';
      } else if (tag === 'TRN' && fields[1] === '2') {
        payerReference = fields[2] || '';
      } else if (tag === 'AAA') {
        // AAA segment indicates request rejection / error by payer
        foundRejection = true;
        const rejectCode = fields[3] || 'UNKNOWN';
        rejectionReason = this.mapAaaRejectCode(rejectCode);
      } else if (tag === 'EB') {
        // EB - Eligibility or Benefit Information
        const eb01Code = fields[1] || '';
        const eb03Service = fields[3] || '';
        const eb07Monetary = parseFloat(fields[7] || '0');
        const eb08Percent = parseFloat(fields[8] || '0');

        // EB01 = '1' -> Active Coverage
        if (eb01Code === '1') {
          foundActiveCoverage = true;
          if (eb08Percent > 0) {
            coveragePercent = eb08Percent <= 1 ? eb08Percent * 100 : eb08Percent;
          }
        } else if (eb01Code === '6' || eb01Code === 'I') {
          foundInactive = true;
        } else if (eb01Code === '8') {
          // Copay amount
          if (!isNaN(eb07Monetary) && eb07Monetary >= 0) {
            copay = eb07Monetary;
          }
        } else if (eb01Code === 'C') {
          // Deductible amount
          if (!isNaN(eb07Monetary) && eb07Monetary >= 0) {
            deductibleRemaining = eb07Monetary;
          }
        } else if (eb01Code === 'A' || eb01Code === '7' || eb01Code === 'CB') {
          // Coinsurance percentage
          if (!isNaN(eb08Percent) && eb08Percent > 0) {
            coveragePercent = eb08Percent <= 1 ? eb08Percent * 100 : eb08Percent;
          }
        }
      }
    }

    // Determine final verification status
    if (foundRejection) {
      status = rejectionReason.includes('Not Found') ? 'Not Found' : 'Failed';
    } else if (foundActiveCoverage) {
      status = 'Verified';
      // Default fallback coverage % if active coverage specified without explicit coinsurance
      if (coveragePercent === 0) coveragePercent = 80;
    } else if (foundInactive) {
      status = 'Not Found';
    } else {
      status = 'Failed';
    }

    // Control Number Correlation Validation
    if (expectedControlNumber && controlNumber && expectedControlNumber !== controlNumber) {
      Logger.warn(
        `[EDI271] Control number mismatch! Expected '${expectedControlNumber}', parsed '${controlNumber}'. Rejecting response.`
      );
      throw ApiError.badRequest(
        `EDI 271 correlation failure: expected control number '${expectedControlNumber}', received '${controlNumber}'`
      );
    }

    const result: Parsed271Result = {
      controlNumber: controlNumber || expectedControlNumber || `CTL-${Date.now()}`,
      isaControlNumber,
      gsControlNumber,
      status,
      copay: Math.max(0, copay),
      deductibleRemaining: Math.max(0, deductibleRemaining),
      coveragePercent: Math.min(100, Math.max(0, coveragePercent)),
      payerReference: payerReference || `REF-${Date.now()}`,
      rejectionReason: rejectionReason || undefined,
      rawSegments: segments,
    };

    return result;
  }

  /**
   * Maps X12 AAA segment rejection codes to human-readable domain descriptions.
   */
  private static mapAaaRejectCode(code: string): string {
    const codeMap: Record<string, string> = {
      '15': 'Required element missing from request',
      '42': 'Patient / Member Not Found in Payer Database',
      '43': 'Invalid / Mismatched Member ID',
      '58': 'Payer system unavailable or down',
      '71': 'Invalid Patient / Member Identification Number',
      '72': 'Invalid Subscriber Name',
      '73': 'Invalid Date of Birth',
      '75': 'Subscriber and Subscriber ID Mismatch',
    };
    return codeMap[code] || `Payer Rejection Code (${code})`;
  }

  /**
   * Converts parsed EDI 271 result into validated NormalizedEligibilityResponse.
   */
  static normalize(parsed: Parsed271Result): NormalizedEligibilityResponse {
    const normalized = {
      status: parsed.status,
      copay: parsed.copay,
      deductibleRemaining: parsed.deductibleRemaining,
      coveragePercent: parsed.coveragePercent,
      transactionId: parsed.controlNumber,
      payerReference: parsed.payerReference,
    };

    // Enforce Zod runtime validation
    return clearinghouseResponseSchema.parse(normalized);
  }
}
