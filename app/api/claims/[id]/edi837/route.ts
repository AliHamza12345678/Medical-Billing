import { NextRequest } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/server/http/response';
import { requirePermission } from '@/lib/server/auth/auth-guard';
import { Edi837Generator } from '@/lib/server/edi/edi-837-generator';
import { AuditLogger } from '@/lib/server/audit/audit-logger';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requirePermission(req, 'claims.view');
    const ediResult = await Edi837Generator.generate837Transaction(params.id);

    await AuditLogger.log({
      userId: session.id,
      userName: session.name,
      action: 'Export',
      module: 'Claims',
      resource: `EDI 837: ${ediResult.transactionId}`,
      details: `Generated ASC X12 837P EDI transaction payload for claim ${params.id} (Control #${ediResult.controlNumber})`,
    });

    return apiResponse(ediResult);
  } catch (error) {
    return handleApiError(error);
  }
}
