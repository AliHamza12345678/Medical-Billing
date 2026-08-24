import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { apiResponse, handleApiError } from '@/lib/server/http/response';
import { requirePermission } from '@/lib/server/auth/auth-guard';
import { createClaimSchema } from '@/lib/validations/claim';
import { ApiError } from '@/lib/server/errors/api-error';
import { CodingValidationEngine } from '@/lib/server/coding/validation-engine';
import { AuditLogger } from '@/lib/server/audit/audit-logger';
import { IdGeneratorService } from '@/lib/server/db/id-generator';
import { Prisma } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    await requirePermission(req, 'claims.view');
    const { searchParams } = new URL(req.url);

    // Parse & sanitize pagination params
    const rawPage = parseInt(searchParams.get('page') || '1', 10);
    const rawLimit = parseInt(searchParams.get('limit') || '20', 10);
    const page = Math.max(1, isNaN(rawPage) ? 1 : rawPage);
    const limit = Math.min(Math.max(1, isNaN(rawLimit) ? 20 : rawLimit), 100);
    const skip = (page - 1) * limit;

    // Search & filter params
    const status = searchParams.get('status');
    const payer = searchParams.get('payer')?.trim();
    const provider = searchParams.get('provider')?.trim();
    const patientId = searchParams.get('patientId')?.trim();
    const search = searchParams.get('search')?.trim() || '';
    const serviceDateFrom = searchParams.get('serviceDateFrom');
    const serviceDateTo = searchParams.get('serviceDateTo');
    const submissionDateFrom = searchParams.get('submissionDateFrom');
    const submissionDateTo = searchParams.get('submissionDateTo');
    const minBilled = searchParams.get('minBilled') ? parseFloat(searchParams.get('minBilled')!) : undefined;
    const maxBilled = searchParams.get('maxBilled') ? parseFloat(searchParams.get('maxBilled')!) : undefined;
    const sortByParam = searchParams.get('sortBy') || 'submissionDate';
    const sortOrderParam = searchParams.get('sortOrder')?.toLowerCase() === 'asc' ? 'asc' : 'desc';

    // Allowed sort fields whitelist
    const allowedSortFields = ['submissionDate', 'serviceDate', 'billedAmount', 'paidAmount', 'status', 'claimNumber', 'patientName'];
    const sortBy = allowedSortFields.includes(sortByParam) ? sortByParam : 'submissionDate';

    // Construct PostgreSQL query filter
    const where: Prisma.ClaimWhereInput = {
      isDeleted: false,
      ...(patientId ? { patientId } : {}),
      ...(status && status !== 'all' ? { status: status as any } : {}),
      ...(payer && payer !== 'all' ? { insuranceProvider: { contains: payer, mode: 'insensitive' } } : {}),
      ...(provider && provider !== 'all' ? { provider: { contains: provider, mode: 'insensitive' } } : {}),
      ...(serviceDateFrom || serviceDateTo
        ? {
            serviceDate: {
              ...(serviceDateFrom ? { gte: new Date(serviceDateFrom) } : {}),
              ...(serviceDateTo ? { lte: new Date(serviceDateTo) } : {}),
            },
          }
        : {}),
      ...(submissionDateFrom || submissionDateTo
        ? {
            submissionDate: {
              ...(submissionDateFrom ? { gte: new Date(submissionDateFrom) } : {}),
              ...(submissionDateTo ? { lte: new Date(submissionDateTo) } : {}),
            },
          }
        : {}),
      ...(minBilled !== undefined || maxBilled !== undefined
        ? {
            billedAmount: {
              ...(minBilled !== undefined && !isNaN(minBilled) ? { gte: minBilled } : {}),
              ...(maxBilled !== undefined && !isNaN(maxBilled) ? { lte: maxBilled } : {}),
            },
          }
        : {}),
      ...(search
        ? {
            OR: [
              { claimNumber: { contains: search, mode: 'insensitive' } },
              { patientName: { contains: search, mode: 'insensitive' } },
              { insuranceProvider: { contains: search, mode: 'insensitive' } },
              { provider: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    // Deterministic tie-breaker ordering
    const orderBy: Prisma.ClaimOrderByWithRelationInput[] = [
      { [sortBy]: sortOrderParam },
      { id: 'asc' },
    ];

    // Execute count & paginated query inside PostgreSQL in parallel
    const [total, dbClaims] = await prisma.$transaction([
      prisma.claim.count({ where }),
      prisma.claim.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: { lines: true, timeline: true },
      }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    const now = Date.now();

    const formatted = dbClaims.map((c) => {
      // Calculate claim age server-side (never trust client)
      const ageDays = Math.floor((now - c.submissionDate.getTime()) / (1000 * 60 * 60 * 24));

      return {
        ...c,
        ageDays: ageDays < 0 ? 0 : ageDays,
        serviceDate: c.serviceDate.toISOString().split('T')[0],
        submissionDate: c.submissionDate.toISOString().split('T')[0],
        billedAmount: Number(c.billedAmount),
        paidAmount: Number(c.paidAmount),
        patientResponsibility: Number(c.patientResponsibility),
        lines: c.lines.map((l) => ({
          ...l,
          unitCharge: Number(l.unitCharge),
          totalCharge: Number(l.totalCharge),
          allowedAmount: Number(l.allowedAmount),
          paidAmount: Number(l.paidAmount),
        })),
        timeline: c.timeline.map((t) => ({
          ...t,
          date: t.date.toISOString(),
        })),
      };
    });

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
    const session = await requirePermission(req, 'claims.edit');
    const body = await req.json();

    const parsed = createClaimSchema.safeParse(body);
    if (!parsed.success) {
      throw ApiError.validation('Invalid claim creation payload', parsed.error.flatten().fieldErrors);
    }

    const { patientId, insuranceProvider, serviceDate, priority, lines } = parsed.data;

    // Lookup patient name from database if not provided
    const patient = await prisma.patient.findUnique({ where: { id: patientId } });
    if (!patient || patient.isDeleted) {
      throw ApiError.notFound(`Patient '${patientId}' not found`);
    }

    const patientName = `${patient.firstName} ${patient.lastName}`;

    // Validate all claim lines using CodingValidationEngine
    for (const line of lines) {
      const validation = await CodingValidationEngine.validateCharge({
        cptCode: line.cptCode,
        icd10Code: line.icd10Code,
        quantity: line.quantity,
        unitCharge: line.unitCharge,
        serviceDate,
      });

      if (!validation.isValid) {
        throw ApiError.badRequest(`Claim line validation failed for CPT ${line.cptCode}: ${validation.errors.join('; ')}`);
      }
    }

    // Server-side calculation of total billed amount across normalized claim lines
    const billedAmount = lines.reduce(
      (sum, l) => sum + Number(l.quantity) * Number(l.unitCharge),
      0
    );

    const cptCodes = Array.from(new Set(lines.map((l) => l.cptCode)));
    const icd10Codes = Array.from(new Set(lines.map((l) => l.icd10Code)));

    // Execute atomic transaction for Claim, ClaimLine records, and ClaimTimelineEvent
    const newClaim = await prisma.$transaction(async (tx) => {
      const claimNumber = await IdGeneratorService.generateClaimNumber(tx);

      const claim = await tx.claim.create({
        data: {
          claimNumber,
          patientId,
          patientName,
          provider: parsed.data.provider || 'Dr. Sarah Johnson',
          insuranceProvider,
          serviceDate: new Date(serviceDate),
          submissionDate: new Date(),
          billedAmount,
          paidAmount: 0,
          patientResponsibility: 0,
          status: 'Submitted',
          priority: priority as any,
          cptCodes,
          icd10Codes,
        },
      });

      // Create normalized ClaimLine records
      await tx.claimLine.createMany({
        data: lines.map((line) => ({
          claimId: claim.id,
          cptCode: line.cptCode,
          cptDescription: line.cptDescription || `Procedure ${line.cptCode}`,
          icd10Codes: [line.icd10Code],
          units: line.quantity,
          unitCharge: line.unitCharge,
          totalCharge: line.quantity * line.unitCharge,
          allowedAmount: line.unitCharge * 0.8,
          paidAmount: 0,
        })),
      });

      // Create initial ClaimTimelineEvent
      await tx.claimTimelineEvent.create({
        data: {
          claimId: claim.id,
          date: new Date(),
          event: 'Claim Submitted',
          description: `Claim submitted to ${insuranceProvider} via clearinghouse`,
          actor: session.name,
          type: 'submission',
        },
      });

      return claim;
    });

    await AuditLogger.log({
      userId: session.id,
      userName: session.name,
      action: 'Create',
      module: 'Claims',
      resource: `Claim: ${newClaim.claimNumber}`,
      details: `Created and submitted claim ${newClaim.claimNumber} for ${patientName} ($${billedAmount.toFixed(2)})`,
    });

    return apiResponse(newClaim, undefined, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
