import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { apiResponse, handleApiError } from '@/lib/server/http/response';
import { requirePermission } from '@/lib/server/auth/auth-guard';
import { ApiError } from '@/lib/server/errors/api-error';
import { aiClaimAnalysisInputSchema } from '@/lib/validations/ai';
import { MedicalAiService } from '@/lib/server/ai/ai-service';
import { AuditLogger } from '@/lib/server/audit/audit-logger';

export async function POST(req: NextRequest) {
  try {
    const session = await requirePermission(req, 'claims.view');
    const body = await req.json();

    const parsed = aiClaimAnalysisInputSchema.safeParse(body);
    if (!parsed.success) {
      throw ApiError.validation('Invalid AI analysis payload', parsed.error.flatten().fieldErrors);
    }

    const claim = await prisma.claim.findUnique({
      where: { id: parsed.data.claimId },
      include: { lines: true },
    });

    if (!claim || claim.isDeleted) {
      throw ApiError.notFound(`Claim '${parsed.data.claimId}' not found`);
    }

    const analysis = await MedicalAiService.analyzeClaimScrubbing({
      claimId: claim.id,
      claimNumber: claim.claimNumber,
      insuranceProvider: claim.insuranceProvider,
      billedAmount: Number(claim.billedAmount),
      cptCodes: claim.cptCodes,
      icd10Codes: claim.icd10Codes,
      serviceDate: claim.serviceDate.toISOString().split('T')[0],
      status: claim.status,
      deniedReason: claim.deniedReason,
    });

    await AuditLogger.log({
      userId: session.id,
      userName: session.name,
      action: 'View',
      module: 'Claims',
      resource: `AI Audit: ${claim.claimNumber}`,
      details: `Generated AI claim scrubbing analysis for ${claim.claimNumber} (Status: ${analysis.status})`,
    });

    return apiResponse(analysis);
  } catch (error) {
    return handleApiError(error);
  }
}
