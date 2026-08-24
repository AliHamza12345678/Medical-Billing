import { prisma } from '@/lib/db';
import { CodingValidationEngine } from '../coding/validation-engine';

export interface ScrubbingResult {
  status: 'PASS' | 'WARNINGS' | 'ERRORS';
  errors: string[];
  warnings: string[];
}

export class ClaimScrubber {
  static async scrubClaim(claimId: string): Promise<ScrubbingResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    const claim = await prisma.claim.findUnique({
      where: { id: claimId },
      include: { lines: true, patient: true },
    });

    if (!claim || claim.isDeleted) {
      return { status: 'ERRORS', errors: ['Claim record not found'], warnings: [] };
    }

    // 1. Patient Data Verification
    if (!claim.patient) {
      errors.push('Patient record is missing or invalid');
    } else if (claim.patient.isDeleted || claim.patient.status !== 'Active') {
      errors.push(`Patient '${claim.patientName}' is inactive or deleted`);
    }

    // 2. Insurance Payer Verification
    if (!claim.insuranceProvider) {
      errors.push('Insurance provider is required');
    }

    // 3. Service Date Sanity
    if (claim.serviceDate > new Date()) {
      errors.push('Service date cannot be in the future');
    }

    // 4. Line Items & Coding Scrubbing
    if (!claim.lines || claim.lines.length === 0) {
      errors.push('Claim must contain at least one charge line');
    } else {
      for (const line of claim.lines) {
        const lineVal = await CodingValidationEngine.validateCharge({
          cptCode: line.cptCode,
          icd10Code: line.icd10Codes[0] || '',
          quantity: line.units,
          unitCharge: Number(line.unitCharge),
          serviceDate: claim.serviceDate,
        });

        errors.push(...lineVal.errors);
        warnings.push(...lineVal.warnings);
      }
    }

    // 5. Billed Amount Validation
    if (Number(claim.billedAmount) <= 0) {
      errors.push('Claim billed amount must be greater than $0.00');
    }

    // 6. Duplicate Claim Risk Detection
    const duplicateRisk = await prisma.claim.findFirst({
      where: {
        id: { not: claim.id },
        patientId: claim.patientId,
        insuranceProvider: claim.insuranceProvider,
        serviceDate: claim.serviceDate,
        isDeleted: false,
        status: { in: ['Submitted', 'Pending', 'Paid'] },
      },
    });

    if (duplicateRisk) {
      warnings.push(
        `Duplicate claim risk: Active claim (${duplicateRisk.claimNumber}) exists for this patient and service date`
      );
    }

    let status: 'PASS' | 'WARNINGS' | 'ERRORS' = 'PASS';
    if (errors.length > 0) {
      status = 'ERRORS';
    } else if (warnings.length > 0) {
      status = 'WARNINGS';
    }

    return { status, errors, warnings };
  }
}
