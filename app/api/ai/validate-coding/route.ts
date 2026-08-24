import { NextRequest } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/server/http/response';
import { requirePermission } from '@/lib/server/auth/auth-guard';
import { ApiError } from '@/lib/server/errors/api-error';
import { aiCodingValidationInputSchema } from '@/lib/validations/ai';
import { MedicalAiService } from '@/lib/server/ai/ai-service';

export async function POST(req: NextRequest) {
  try {
    await requirePermission(req, 'claims.edit');
    const body = await req.json();

    const parsed = aiCodingValidationInputSchema.safeParse(body);
    if (!parsed.success) {
      throw ApiError.validation('Invalid coding validation payload', parsed.error.flatten().fieldErrors);
    }

    const validation = await MedicalAiService.validateCoding({
      cptCodes: parsed.data.cptCodes,
      icd10Codes: parsed.data.icd10Codes,
      serviceDate: parsed.data.serviceDate,
    });

    return apiResponse(validation);
  } catch (error) {
    return handleApiError(error);
  }
}
