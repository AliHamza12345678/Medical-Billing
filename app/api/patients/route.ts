import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { apiResponse, handleApiError } from '@/lib/server/http/response';
import { requirePermission } from '@/lib/server/auth/auth-guard';
import { createPatientSchema } from '@/lib/validations/patient';
import { ApiError } from '@/lib/server/errors/api-error';
import { AuditLogger } from '@/lib/server/audit/audit-logger';
import { IdGeneratorService } from '@/lib/server/db/id-generator';
import { Prisma } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    await requirePermission(req, 'patients.view');
    const { searchParams } = new URL(req.url);

    // Parse & sanitize pagination params
    const rawPage = parseInt(searchParams.get('page') || '1', 10);
    const rawLimit = parseInt(searchParams.get('limit') || '20', 10);
    const page = Math.max(1, isNaN(rawPage) ? 1 : rawPage);
    const limit = Math.min(Math.max(1, isNaN(rawLimit) ? 20 : rawLimit), 100);
    const skip = (page - 1) * limit;

    // Search & filter params
    const search = searchParams.get('search')?.trim() || '';
    const status = searchParams.get('status');
    const gender = searchParams.get('gender');
    const registeredFrom = searchParams.get('registeredFrom');
    const registeredTo = searchParams.get('registeredTo');
    const minBalance = searchParams.get('minBalance') ? parseFloat(searchParams.get('minBalance')!) : undefined;
    const maxBalance = searchParams.get('maxBalance') ? parseFloat(searchParams.get('maxBalance')!) : undefined;
    const sortByParam = searchParams.get('sortBy') || 'registeredOn';
    const sortOrderParam = searchParams.get('sortOrder')?.toLowerCase() === 'asc' ? 'asc' : 'desc';

    // Allowed sort fields whitelist to prevent SQL injection
    const allowedSortFields = ['registeredOn', 'lastName', 'firstName', 'dateOfBirth', 'balance', 'mrn', 'createdAt'];
    const sortBy = allowedSortFields.includes(sortByParam) ? sortByParam : 'registeredOn';

    // Construct PostgreSQL query filter
    const where: Prisma.PatientWhereInput = {
      isDeleted: false,
      ...(status && status !== 'all' ? { status: status as any } : {}),
      ...(gender && gender !== 'all' ? { gender: gender as any } : {}),
      ...(registeredFrom || registeredTo
        ? {
            registeredOn: {
              ...(registeredFrom ? { gte: new Date(registeredFrom) } : {}),
              ...(registeredTo ? { lte: new Date(registeredTo) } : {}),
            },
          }
        : {}),
      ...(minBalance !== undefined || maxBalance !== undefined
        ? {
            balance: {
              ...(minBalance !== undefined && !isNaN(minBalance) ? { gte: minBalance } : {}),
              ...(maxBalance !== undefined && !isNaN(maxBalance) ? { lte: maxBalance } : {}),
            },
          }
        : {}),
      ...(search
        ? {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
              { mrn: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
              { phone: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    // Deterministic tie-breaker ordering
    const orderBy: Prisma.PatientOrderByWithRelationInput[] = [
      { [sortBy]: sortOrderParam },
      { id: 'asc' },
    ];

    // Execute count & paginated query inside PostgreSQL in parallel
    const [total, dbPatients] = await prisma.$transaction([
      prisma.patient.count({ where }),
      prisma.patient.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: { insurances: true, documents: true },
      }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Format for frontend consumption
    const formatted = dbPatients.map((p) => ({
      ...p,
      dateOfBirth: p.dateOfBirth.toISOString().split('T')[0],
      registeredOn: p.registeredOn.toISOString().split('T')[0],
      lastVisit: p.lastVisit ? p.lastVisit.toISOString().split('T')[0] : null,
      balance: Number(p.balance),
      insurance: p.insurances.map((ins) => ({
        id: ins.id,
        provider: ins.providerName,
        memberId: ins.memberId,
        groupNumber: ins.groupNumber,
        planName: ins.planName,
        priority: ins.priority as any,
        status: ins.status as any,
        effectiveDate: ins.effectiveDate.toISOString().split('T')[0],
      })),
      documents: p.documents.map((doc) => ({
        id: doc.id,
        name: doc.name,
        type: doc.type,
        uploadedOn: doc.uploadedOn.toISOString().split('T')[0],
        size: doc.size,
      })),
    }));

    return apiResponse(formatted, {
      total,
      page,
      limit,
      totalPages,
      hasNextPage,
      hasPrevPage,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requirePermission(req, 'patients.edit');
    const body = await req.json();

    const parsed = createPatientSchema.safeParse(body);
    if (!parsed.success) {
      throw ApiError.validation('Invalid patient data payload', parsed.error.flatten().fieldErrors);
    }

    // Generate unique MRN if omitted or blank using PostgreSQL sequence generator
    const mrn = parsed.data.mrn || (await IdGeneratorService.generateMrn());

    const newPatient = await prisma.patient.create({
      data: {
        mrn,
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        dateOfBirth: new Date(parsed.data.dateOfBirth),
        gender: parsed.data.gender as any,
        phone: parsed.data.phone,
        email: parsed.data.email,
        address: parsed.data.address,
        city: parsed.data.city,
        state: parsed.data.state,
        zip: parsed.data.zip,
        status: (parsed.data.status as any) || 'Active',
        ...(parsed.data.insurance && parsed.data.insurance.length > 0
          ? {
              insurances: {
                create: parsed.data.insurance.map((i: any) => ({
                  providerName: i.provider || 'Commercial',
                  providerId: i.providerId || 'PAY-001',
                  memberId: i.memberId || 'MEM-001',
                  groupNumber: i.groupNumber || 'GRP-001',
                  planName: i.planName || 'Standard Coverage',
                  priority: i.priority || 'Primary',
                  status: 'Active',
                  effectiveDate: i.effectiveDate ? new Date(i.effectiveDate) : new Date(),
                  expiryDate: i.expiryDate ? new Date(i.expiryDate) : null,
                  copay: Number(i.copay) || 0,
                  deductible: Number(i.deductible) || 0,
                  coveragePercent: Number(i.coveragePercent) || 80,
                })),
              },
            }
          : {}),
      },
      include: { insurances: true },
    });

    await AuditLogger.log({
      userId: session.id,
      userName: session.name,
      action: 'Create',
      module: 'Patients',
      resource: `MRN: ${newPatient.mrn}`,
      details: `Created patient record for ${newPatient.firstName} ${newPatient.lastName} (MRN: ${newPatient.mrn})`,
    });

    return apiResponse(newPatient, undefined, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
