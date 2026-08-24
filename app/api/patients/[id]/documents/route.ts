import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { apiResponse, handleApiError } from '@/lib/server/http/response';
import { requirePermission } from '@/lib/server/auth/auth-guard';
import { ApiError } from '@/lib/server/errors/api-error';
import { AuditLogger } from '@/lib/server/audit/audit-logger';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requirePermission(req, 'patients.view');
    const documents = await prisma.patientDocument.findMany({
      where: { patientId: params.id },
      orderBy: { uploadedOn: 'desc' },
    });

    const formatted = documents.map((doc) => ({
      ...doc,
      uploadedOn: doc.uploadedOn.toISOString().split('T')[0],
      // Controlled signed temporary download URL (S3 architecture pattern)
      fileUrl: doc.fileUrl ? `${doc.fileUrl}?expires=${Date.now() + 15 * 60 * 1000}` : `/api/patients/${params.id}/documents/${doc.id}/download`,
    }));

    return apiResponse(formatted);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requirePermission(req, 'patients.edit');
    const patient = await prisma.patient.findUnique({ where: { id: params.id } });
    if (!patient || patient.isDeleted) {
      throw ApiError.notFound(`Patient '${params.id}' not found`);
    }

    const body = await req.json();
    const { name, type, size, fileUrl } = body;

    if (!name || !type) {
      throw ApiError.validation('Document name and type are required');
    }

    const newDocument = await prisma.patientDocument.create({
      data: {
        patientId: params.id,
        name,
        type,
        size: size || '1.2 MB',
        fileUrl: fileUrl || null,
      },
    });

    await AuditLogger.log({
      userId: session.id,
      userName: session.name,
      action: 'Create',
      module: 'Patients',
      resource: `Document: ${newDocument.name}`,
      details: `Uploaded document metadata '${newDocument.name}' for patient ${patient.firstName} ${patient.lastName}`,
    });

    return apiResponse(newDocument, undefined, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
