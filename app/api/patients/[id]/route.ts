import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { apiResponse, handleApiError } from '@/lib/server/http/response';
import { requirePermission } from '@/lib/server/auth/auth-guard';
import { ApiError } from '@/lib/server/errors/api-error';

import { updatePatientSchema } from '@/lib/validations/patient';
import { AuditLogger } from '@/lib/server/audit/audit-logger';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requirePermission(req, 'patients.view');
    const patient = await prisma.patient.findUnique({
      where: { id: params.id },
      include: { insurances: true, documents: true },
    });

    if (!patient || patient.isDeleted) {
      throw ApiError.notFound(`Patient with ID '${params.id}' not found`);
    }

    return apiResponse({
      ...patient,
      dateOfBirth: patient.dateOfBirth.toISOString().split('T')[0],
      registeredOn: patient.registeredOn.toISOString().split('T')[0],
      lastVisit: patient.lastVisit ? patient.lastVisit.toISOString().split('T')[0] : null,
      balance: Number(patient.balance),
      insurance: patient.insurances.map((ins) => ({
        id: ins.id,
        provider: ins.providerName,
        memberId: ins.memberId,
        groupNumber: ins.groupNumber,
        planName: ins.planName,
        priority: ins.priority as any,
        status: ins.status as any,
        effectiveDate: ins.effectiveDate.toISOString().split('T')[0],
      })),
      documents: patient.documents.map((doc) => ({
        id: doc.id,
        name: doc.name,
        type: doc.type,
        uploadedOn: doc.uploadedOn.toISOString().split('T')[0],
        size: doc.size,
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requirePermission(req, 'patients.edit');
    const patient = await prisma.patient.findUnique({ where: { id: params.id } });

    if (!patient || patient.isDeleted) {
      throw ApiError.notFound(`Patient with ID '${params.id}' not found`);
    }

    const body = await req.json();
    const parsed = updatePatientSchema.safeParse(body);
    if (!parsed.success) {
      throw ApiError.validation('Invalid patient update payload', parsed.error.flatten().fieldErrors);
    }

    const updateData: any = { ...parsed.data };
    if (parsed.data.dateOfBirth) {
      updateData.dateOfBirth = new Date(parsed.data.dateOfBirth);
    }

    const updatedPatient = await prisma.patient.update({
      where: { id: params.id },
      data: updateData,
    });

    await AuditLogger.log({
      userId: session.id,
      userName: session.name,
      action: 'Update',
      module: 'Patients',
      resource: `MRN: ${patient.mrn}`,
      details: `Updated patient details for ${updatedPatient.firstName} ${updatedPatient.lastName}`,
    });

    return apiResponse(updatedPatient);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requirePermission(req, 'patients.edit');
    const patient = await prisma.patient.findUnique({ where: { id: params.id } });

    if (!patient || patient.isDeleted) {
      throw ApiError.notFound(`Patient with ID '${params.id}' not found`);
    }

    await prisma.patient.update({
      where: { id: params.id },
      data: { isDeleted: true, status: 'Inactive', deletedAt: new Date() },
    });

    await AuditLogger.log({
      userId: session.id,
      userName: session.name,
      action: 'Delete',
      module: 'Patients',
      resource: `MRN: ${patient.mrn}`,
      details: `Soft-deleted patient ${patient.firstName} ${patient.lastName} (MRN: ${patient.mrn})`,
    });

    return apiResponse({ message: `Patient '${patient.firstName} ${patient.lastName}' soft-deleted successfully` });
  } catch (error) {
    return handleApiError(error);
  }
}
