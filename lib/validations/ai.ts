import { z } from 'zod';

// Input Schemas
export const aiClaimAnalysisInputSchema = z.object({
  claimId: z.string().min(1, 'Claim ID is required'),
});

export const aiDenialAnalysisInputSchema = z.object({
  claimId: z.string().min(1, 'Claim ID is required'),
  denialCode: z.string().optional(),
  denialReason: z.string().optional(),
});

export const aiCodingValidationInputSchema = z.object({
  cptCodes: z.array(z.string()).min(1, 'At least one CPT code is required'),
  icd10Codes: z.array(z.string()).min(1, 'At least one ICD-10 code is required'),
  serviceDate: z.string().optional(),
});

// Output Schemas
export const aiRecommendationSchema = z.object({
  category: z.enum(['coding', 'billing', 'coverage', 'documentation', 'general']),
  title: z.string(),
  description: z.string(),
  actionRequired: z.string(),
  confidenceScore: z.number().min(0).max(1),
});

export const aiClaimAnalysisResultSchema = z.object({
  status: z.enum(['CLEAN', 'WARNINGS', 'ERRORS']),
  summary: z.string(),
  explanation: z.string(),
  riskScore: z.number().min(0).max(100),
  detectedIssues: z.array(z.string()),
  recommendations: z.array(aiRecommendationSchema),
  analyzedAt: z.string(),
});

export const aiDenialAnalysisResultSchema = z.object({
  denialCode: z.string(),
  rootCause: z.string(),
  explanation: z.string(),
  appealProbability: z.number().min(0).max(100),
  suggestedAppealReason: z.string(),
  recommendedActionSteps: z.array(z.string()),
  supportingDocumentationNeeded: z.array(z.string()),
});

export const aiCodingValidationResultSchema = z.object({
  isValid: z.boolean(),
  medicalNecessityScore: z.number().min(0).max(100),
  cptIcd10Pairings: z.array(
    z.object({
      cptCode: z.string(),
      icd10Code: z.string(),
      isCompatible: z.boolean(),
      notes: z.string(),
    })
  ),
  suggestedModifiers: z.array(
    z.object({
      cptCode: z.string(),
      modifier: z.string(),
      reason: z.string(),
    })
  ),
  warnings: z.array(z.string()),
});

export type AiClaimAnalysisInput = z.infer<typeof aiClaimAnalysisInputSchema>;
export type AiClaimAnalysisResult = z.infer<typeof aiClaimAnalysisResultSchema>;
export type AiDenialAnalysisResult = z.infer<typeof aiDenialAnalysisResultSchema>;
export type AiCodingValidationResult = z.infer<typeof aiCodingValidationResultSchema>;
