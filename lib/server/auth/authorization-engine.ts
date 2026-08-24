import { ActiveSessionUser } from './session';
import { ApiError } from '../errors/api-error';

export class AuthorizationEngine {
  /**
   * Ensures the session user has permission to access or modify a patient's records.
   * Prevents Insecure Direct Object Reference (IDOR) attacks.
   */
  static assertCanAccessPatient(session: ActiveSessionUser, patientId: string): void {
    if (session.permissions.includes('all') || session.permissions.includes('patients.view')) {
      return;
    }

    // Patient Portal users can only access their own patient record
    if (session.role === 'Patient' && session.id === patientId) {
      return;
    }

    throw ApiError.forbidden('You do not have authorization to access this patient record');
  }

  /**
   * Ensures the user has permission to view or manage claims.
   */
  static assertCanAccessClaim(session: ActiveSessionUser): void {
    if (session.permissions.includes('all') || session.permissions.includes('claims.view')) {
      return;
    }
    throw ApiError.forbidden('You do not have authorization to access claims');
  }

  /**
   * Prevents privilege escalation: non-Admin users cannot assign the Administrator role.
   */
  static assertCanAssignRole(session: ActiveSessionUser, targetRole: string): void {
    if (targetRole === 'Administrator' && !session.permissions.includes('all') && session.role !== 'Administrator') {
      throw ApiError.forbidden('Only Administrators can assign Administrator privileges');
    }
  }

  /**
   * Prevents Administrator self-lockout (demoting or deactivating one's own active account).
   */
  static assertNotSelfLockout(
    currentUserId: string,
    targetUserId: string,
    newStatus?: string,
    newRole?: string
  ): void {
    if (currentUserId === targetUserId) {
      if (newStatus && newStatus !== 'Active') {
        throw ApiError.badRequest('You cannot deactivate or suspend your own active administrator account');
      }
      if (newRole && newRole !== 'Administrator') {
        throw ApiError.badRequest('You cannot remove administrator privileges from your own account');
      }
    }
  }

  /**
   * Unambiguously resolves a patient record and enforces strict access control.
   * Prevents fallback logic and cross-patient financial manipulation.
   */
  static async resolveAndAssertPatientAccess(
    session: ActiveSessionUser,
    requestedPatientId?: string
  ): Promise<{ id: string; firstName: string; lastName: string; email: string; balance: any }> {
    const { prisma } = await import('@/lib/db');

    let patient: { id: string; firstName: string; lastName: string; email: string; balance: any; isDeleted: boolean } | null = null;

    if (requestedPatientId && requestedPatientId.trim() !== '') {
      patient = await prisma.patient.findUnique({
        where: { id: requestedPatientId },
        select: { id: true, firstName: true, lastName: true, email: true, balance: true, isDeleted: true },
      });

      if (!patient || patient.isDeleted) {
        throw ApiError.notFound(`Patient record '${requestedPatientId}' not found`);
      }
    } else {
      // Try resolving by session ID or session email
      patient = await prisma.patient.findFirst({
        where: {
          OR: [
            { id: session.id },
            { email: session.email.toLowerCase() },
          ],
          isDeleted: false,
        },
        select: { id: true, firstName: true, lastName: true, email: true, balance: true, isDeleted: true },
      });

      if (!patient) {
        throw ApiError.badRequest('Patient identity could not be resolved unambiguously for this transaction');
      }
    }

    const hasStaffPermission =
      session.permissions.includes('all') ||
      session.permissions.includes('payments.edit') ||
      session.permissions.includes('patients.view');

    if (!hasStaffPermission) {
      const isSelf =
        patient.id === session.id ||
        patient.email.toLowerCase() === session.email.toLowerCase();

      if (!isSelf) {
        throw ApiError.forbidden('You are not authorized to process payments or access records for another patient account');
      }
    }

    return patient;
  }
}

