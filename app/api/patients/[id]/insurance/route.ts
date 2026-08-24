import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { apiResponse, handleApiError } from '@/lib/server/http/response';
import { requirePermission } from '@/lib/server/auth/auth-guard';
import { createPatientInsuranceSchema } from '@/lib/validations/patient-insurance';
import { ApiError } from '@/lib/server/errors/api-error';
import { AuditLogger } from '@/lib/server/audit/audit-logger';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requirePermission(req, 'patients.view');
    const insurances = await prisma.patientInsurance.findMany({
      where: { patientId: params.id },
      orderBy: { createdAt: 'asc' },
    });
    return apiResponse(insurances);
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
    const parsed = createPatientInsuranceSchema.safeParse(body);
    if (!parsed.success) {
      throw ApiError.validation('Invalid patient insurance payload', parsed.error.flatten().fieldErrors);
    }

    const {
      providerName,
      providerId,
      memberId,
      groupNumber,
      planName,
      priority,
      status,
      effectiveDate,
      expiryDate,
      copay,
      deductible,
      deductibleMet,
      coveragePercent,
    } = parsed.data;

    // Check for duplicate active policy with same priority
    if (status === 'Active') {
      const existing = await prisma.patientInsurance.findFirst({
        where: {
          patientId: params.id,
          priority,
          status: 'Active',
        },
      });

      if (existing) {
        throw ApiError.conflict(
          `Patient already has an active ${priority} insurance policy (${existing.providerName})`
        );
      }
    }

    const newInsurance = await prisma.patientInsurance.create({
      data: {
        patientId: params.id,
        providerName,
        providerId,
        memberId,
        groupNumber,
        planName,
        priority,
        status,
        effectiveDate: new Date(effectiveDate),
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        copay,
        deductible,
        deductibleMet,
        coveragePercent,
      },
    });

    await AuditLogger.log({
      userId: session.id,
      userName: session.name,
      action: 'Create',
      module: 'Patients',
      resource: `PatientInsurance: ${newInsurance.id}`,
      details: `Added ${priority} insurance policy (${providerName}) for patient ${patient.firstName} ${patient.lastName}`,
    });

    return apiResponse(newInsurance, undefined, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
