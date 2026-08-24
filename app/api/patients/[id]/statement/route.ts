import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { apiResponse, handleApiError } from '@/lib/server/http/response';
import { requirePermission } from '@/lib/server/auth/auth-guard';
import { AuthorizationEngine } from '@/lib/server/auth/authorization-engine';
import { ApiError } from '@/lib/server/errors/api-error';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requirePermission(req, 'patients.view');

    // IDOR protection check
    AuthorizationEngine.assertCanAccessPatient(session, params.id);

    const patient = await prisma.patient.findUnique({
      where: { id: params.id },
      include: {
        insurances: true,
        claims: { where: { isDeleted: false }, orderBy: { serviceDate: 'desc' } },
        payments: { where: { isDeleted: false }, orderBy: { date: 'desc' } },
        refunds: { orderBy: { date: 'desc' } },
        ledger: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!patient || patient.isDeleted) {
      throw ApiError.notFound(`Patient '${params.id}' not found`);
    }

    const totalBilled = patient.claims.reduce((s, c) => s + Number(c.billedAmount), 0);
    const totalPaid = patient.payments.filter((p) => p.status === 'Paid').reduce((s, p) => s + Number(p.amount), 0);
    const totalRefunded = patient.refunds.filter((r) => r.status === 'Processed').reduce((s, r) => s + Number(r.amount), 0);
    const statementBalance = totalBilled - totalPaid + totalRefunded;

    const statement = {
      statementDate: new Date().toISOString().split('T')[0],
      patient: {
        id: patient.id,
        name: `${patient.firstName} ${patient.lastName}`,
        mrn: patient.mrn,
        email: patient.email,
        phone: patient.phone,
        address: `${patient.address}, ${patient.city}, ${patient.state} ${patient.zip}`,
      },
      summary: {
        totalBilled,
        totalPaid,
        totalRefunded,
        statementBalance: statementBalance < 0 ? 0 : statementBalance,
      },
      activity: patient.ledger.map((entry) => ({
        id: entry.id,
        date: entry.createdAt.toISOString().split('T')[0],
        type: entry.transactionType,
        description: entry.description,
        debit: Number(entry.debit),
        credit: Number(entry.credit),
        balanceAfter: Number(entry.balanceAfter),
      })),
    };

    return apiResponse(statement);
  } catch (error) {
    return handleApiError(error);
  }
}
