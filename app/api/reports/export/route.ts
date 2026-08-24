import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/server/http/response';
import { requirePermission } from '@/lib/server/auth/auth-guard';
import { ReportExportEngine } from '@/lib/server/export/export-engine';
import { ApiError } from '@/lib/server/errors/api-error';

export async function POST(req: NextRequest) {
  try {
    const session = await requirePermission(req, 'reports.view');
    const body = await req.json();

    const { reportType, format } = body;
    if (!reportType) {
      throw ApiError.badRequest('reportType is required');
    }

    const exportFormat = format === 'json' ? 'json' : 'csv';

    const result = await ReportExportEngine.generateExport({
      reportType,
      format: exportFormat,
      userId: session.id,
      userName: session.name,
    });

    return new NextResponse(result.content, {
      status: 200,
      headers: {
        'Content-Type': result.mimeType,
        'Content-Disposition': `attachment; filename="${result.filename}"`,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
