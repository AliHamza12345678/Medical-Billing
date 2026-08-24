import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { apiResponse, handleApiError } from '@/lib/server/http/response';
import { requirePermission } from '@/lib/server/auth/auth-guard';
import { ApiError } from '@/lib/server/errors/api-error';
import { aiDenialAnalysisInputSchema } from '@/lib/validations/ai';
import { MedicalAiService } from '@/lib/server/ai/ai-service';
import { AuditLogger } from '@/lib/server/audit/audit-logger';

export async function POST(req: NextRequest) {
  try {
    const session = await requirePermission(req, 'claims.edit');
    const body = await req.json();

    const parsed = aiDenialAnalysisInputSchema.safeParse(body);
    if (!parsed.success) {
      throw ApiError.validation('Invalid AI denial analysis payload', parsed.error.flatten().fieldErrors);
    }

    const claim = await prisma.claim.findUnique({
      where: { id: parsed.data.claimId },
    });

    if (!claim || claim.isDeleted) {
      throw ApiError.notFound(`Claim '${parsed.data.claimId}' not found`);
    }

    const analysis = await MedicalAiService.analyzeClaimDenial({
      claimNumber: claim.claimNumber,
      insuranceProvider: claim.insuranceProvider,
      billedAmount: Number(claim.billedAmount),
      deniedReason: parsed.data.denialReason || claim.deniedReason || 'General Claim Denial',
      cptCodes: claim.cptCodes,
      icd10Codes: claim.icd10Codes,
    });

    await AuditLogger.log({
      userId: session.id,
      userName: session.name,
      action: 'View',
      module: 'Claims',
      resource: `AI Denial Audit: ${claim.claimNumber}`,
      details: `Generated AI denial analysis for claim ${claim.claimNumber} (Appeal probability: ${analysis.appealProbability}%)`,
    });

    return apiResponse(analysis);
  } catch (error) {
    return handleApiError(error);
  }
}
