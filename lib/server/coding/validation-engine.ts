import { prisma } from '@/lib/db';

export interface ChargeValidationInput {
  cptCode: string;
  icd10Code: string;
  quantity: number;
  unitCharge: number;
  serviceDate: string | Date;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class CodingValidationEngine {
  static async validateCharge(input: ChargeValidationInput): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. Validate Quantity
    if (!input.quantity || input.quantity <= 0) {
      errors.push('Quantity must be greater than 0');
    }

    // 2. Validate Unit Charge
    if (input.unitCharge < 0) {
      errors.push('Unit charge cannot be negative');
    }

    // 3. Validate CPT Procedure Code against Database
    if (!input.cptCode) {
      errors.push('CPT procedure code is required');
    } else {
      const cptRecord = await prisma.procedureCode.findUnique({
        where: { cptCode: input.cptCode },
      });

      if (!cptRecord) {
        errors.push(`Invalid CPT code: '${input.cptCode}' is not recognized in procedure code library`);
      } else if (cptRecord.status !== 'Active') {
        errors.push(`Inactive CPT code: '${input.cptCode}' is currently inactive`);
      }
    }

    // 4. Validate ICD-10 Diagnosis Code against Database
    if (!input.icd10Code) {
      errors.push('ICD-10 diagnosis code is required');
    } else {
      const icdRecord = await prisma.diagnosisCode.findUnique({
        where: { icd10Code: input.icd10Code },
      });

      if (!icdRecord) {
        errors.push(`Invalid ICD-10 code: '${input.icd10Code}' is not recognized in diagnosis code library`);
      } else if (icdRecord.status !== 'Active') {
        warnings.push(`ICD-10 code '${input.icd10Code}' is flagged for review`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }
}
