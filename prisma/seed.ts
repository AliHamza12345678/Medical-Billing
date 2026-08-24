import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { patients } from '../data/patients';
import { claims } from '../data/claims';
import { payments, invoices } from '../data/payments';
import { insuranceProviders, eligibilityVerifications, authorizations } from '../data/insurance';
import { procedureCodes, diagnosisCodes, chargeEntries } from '../data/charge-entry';
import { users, roles, feeSchedule, auditLogs } from '../data/users';
import { notifications } from '../data/notifications';

const prisma = new PrismaClient();

async function main() {
  const isProduction = process.env.NODE_ENV === 'production' && process.env.ALLOW_PROD_PHI_SEED !== 'true';
  const defaultDemoPasswordHash = bcrypt.hashSync('Password123!', 12);

  console.log(`🌱 Starting database seeding (Mode: ${process.env.NODE_ENV || 'development'})...`);

  if (isProduction) {
    console.log('🔒 PRODUCTION MODE DETECTED: Seeding reference system data ONLY. Patient/PHI fake data seeding is BLOCKED.');
  }

  // 1. Seed Roles
  console.log('📦 Seeding Roles & Permissions...');
  for (const r of roles) {
    await prisma.role.upsert({
      where: { name: r.name },
      update: {
        description: r.description,
        usersCount: r.usersCount,
        permissions: r.permissions,
        system: r.system,
      },
      create: {
        id: r.id,
        name: r.name,
        description: r.description,
        usersCount: r.usersCount,
        permissions: r.permissions,
        system: r.system,
      },
    });
  }

  // 2. Seed System Users (Administrator, Billing Manager, Coder, Front Desk, Provider)
  console.log('👥 Seeding System Users...');
  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        name: u.name,
        role: u.role.replace(' ', '') as any,
        status: u.status,
        permissions: u.permissions,
        passwordHash: defaultDemoPasswordHash,
      },
      create: {
        id: u.id,
        name: u.name,
        email: u.email,
        passwordHash: defaultDemoPasswordHash,
        role: u.role.replace(' ', '') as any,
        status: u.status,
        lastLogin: u.lastLogin ? new Date(u.lastLogin) : null,
        avatarColor: u.avatarColor,
        permissions: u.permissions,
        createdAt: new Date(u.createdOn),
      },
    });
  }

  // 3. Seed Insurance Providers
  console.log('🏥 Seeding Insurance Providers...');
  for (const ip of insuranceProviders) {
    await prisma.insuranceProvider.upsert({
      where: { payerId: ip.payerId },
      update: {
        name: ip.name,
        type: ip.type,
        phone: ip.phone,
        email: ip.email,
        status: ip.status,
        totalRevenue: ip.totalRevenue,
      },
      create: {
        id: ip.id,
        name: ip.name,
        payerId: ip.payerId,
        type: ip.type,
        phone: ip.phone,
        email: ip.email,
        address: ip.address,
        city: ip.city,
        state: ip.state,
        zip: ip.zip,
        status: ip.status,
        claimsSubmitted: ip.claimsSubmitted,
        claimsPaid: ip.claimsPaid,
        avgProcessingDays: ip.avgProcessingDays,
        totalRevenue: ip.totalRevenue,
        logoColor: ip.logoColor,
      },
    });
  }

  // 4. Seed CPT Procedure Codes
  console.log('🏷️ Seeding Procedure Codes...');
  for (const pc of procedureCodes) {
    await prisma.procedureCode.upsert({
      where: { cptCode: pc.cptCode },
      update: {
        description: pc.description,
        standardCharge: pc.standardCharge,
        medicareRate: pc.medicareRate,
      },
      create: {
        id: pc.id,
        cptCode: pc.cptCode,
        description: pc.description,
        category: pc.category,
        standardCharge: pc.standardCharge,
        medicareRate: pc.medicareRate,
        rvu: pc.rvu,
        status: pc.status,
      },
    });
  }

  // 5. Seed ICD-10 Diagnosis Codes
  console.log('🔍 Seeding Diagnosis Codes...');
  for (const dc of diagnosisCodes) {
    await prisma.diagnosisCode.upsert({
      where: { icd10Code: dc.icd10Code },
      update: {
        description: dc.description,
        category: dc.category,
      },
      create: {
        id: dc.id,
        icd10Code: dc.icd10Code,
        description: dc.description,
        category: dc.category,
        status: dc.status,
      },
    });
  }

  // 6. Seed Fee Schedule
  console.log('💵 Seeding Fee Schedules...');
  for (const fs of feeSchedule) {
    await prisma.feeSchedule.upsert({
      where: { id: fs.id },
      update: {
        standardRate: fs.standardRate,
        negotiatedRate: fs.negotiatedRate,
      },
      create: {
        id: fs.id,
        cptCode: fs.cptCode,
        description: fs.description,
        provider: fs.provider,
        standardRate: fs.standardRate,
        negotiatedRate: fs.negotiatedRate,
        effectiveDate: new Date(fs.effectiveDate),
        status: fs.status,
      },
    });
  }

  // STOP SEEDING PHI DATA IF IN PRODUCTION MODE
  if (isProduction) {
    console.log('✅ Reference system data seeding complete! Skipped PHI/patient data for production safety.');
    return;
  }

  // 7. Seed Sample Patients (Dev / Staging ONLY)
  console.log('🩺 Seeding Patients & Insurances (Dev/Testing Mode)...');
  for (const p of patients) {
    const createdPatient = await prisma.patient.upsert({
      where: { mrn: p.mrn },
      update: {
        balance: p.balance,
        status: p.status as any,
      },
      create: {
        id: p.id,
        mrn: p.mrn,
        firstName: p.firstName,
        lastName: p.lastName,
        dateOfBirth: new Date(p.dateOfBirth),
        gender: p.gender as any,
        phone: p.phone,
        email: p.email,
        address: p.address,
        city: p.city,
        state: p.state,
        zip: p.zip,
        status: p.status as any,
        balance: p.balance,
        lastVisit: p.lastVisit ? new Date(p.lastVisit) : null,
        registeredOn: new Date(p.registeredOn),
        avatarColor: p.avatarColor,
      },
    });

    for (const ins of p.insurance) {
      await prisma.patientInsurance.upsert({
        where: { id: ins.id },
        update: {
          copay: ins.copay,
          deductible: ins.deductible,
        },
        create: {
          id: ins.id,
          patientId: createdPatient.id,
          providerName: ins.provider,
          providerId: ins.providerId,
          memberId: ins.memberId,
          groupNumber: ins.groupNumber,
          planName: ins.planName,
          priority: ins.priority,
          status: ins.status,
          effectiveDate: new Date(ins.effectiveDate),
          expiryDate: ins.expiryDate ? new Date(ins.expiryDate) : null,
          copay: ins.copay,
          deductible: ins.deductible,
          deductibleMet: ins.deductibleMet,
          coveragePercent: ins.coveragePercent,
        },
      }).catch(() => {});
    }
  }

  // 8. Seed Claims (Dev / Staging ONLY)
  console.log('📄 Seeding Claims & Itemized Claim Lines...');
  for (const c of claims) {
    await prisma.claim.upsert({
      where: { claimNumber: c.claimNumber },
      update: {
        status: c.status as any,
        paidAmount: c.paidAmount,
      },
      create: {
        id: c.id,
        claimNumber: c.claimNumber,
        patientId: c.patientId,
        patientName: c.patientName,
        provider: c.provider,
        insuranceProvider: c.insuranceProvider,
        serviceDate: new Date(c.serviceDate),
        submissionDate: new Date(c.submissionDate),
        billedAmount: c.billedAmount,
        paidAmount: c.paidAmount,
        patientResponsibility: c.patientResponsibility,
        status: c.status as any,
        priority: c.priority as any,
        cptCodes: c.cptCodes,
        icd10Codes: c.icd10Codes,
        deniedReason: c.deniedReason,
        ageDays: c.ageDays,
      },
    });
  }

  // 9. Seed Payments (Dev / Staging ONLY)
  console.log('💳 Seeding Payments...');
  for (const pay of payments) {
    await prisma.payment.upsert({
      where: { paymentNumber: pay.paymentNumber },
      update: {
        status: pay.status as any,
      },
      create: {
        id: pay.id,
        paymentNumber: pay.paymentNumber,
        patientId: pay.patientId,
        patientName: pay.patientName,
        amount: pay.amount,
        method: pay.method.replace(' ', '') as any,
        status: pay.status as any,
        date: new Date(pay.date),
        appliedTo: pay.appliedTo,
        reference: pay.reference,
        type: pay.type,
      },
    });
  }

  // 10. Seed Invoices (Dev / Staging ONLY)
  console.log('🧾 Seeding Invoices...');
  for (const inv of invoices) {
    await prisma.invoice.upsert({
      where: { invoiceNumber: inv.invoiceNumber },
      update: {
        status: inv.status,
        paidAmount: inv.paidAmount,
        balance: inv.balance,
      },
      create: {
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        patientId: inv.patientId,
        patientName: inv.patientName,
        issueDate: new Date(inv.issueDate),
        dueDate: new Date(inv.dueDate),
        amount: inv.amount,
        paidAmount: inv.paidAmount,
        balance: inv.balance,
        status: inv.status,
        notes: inv.notes,
      },
    });
  }

  // 11. Seed Audit Logs
  console.log('📋 Seeding Audit Trail...');
  for (const log of auditLogs) {
    await prisma.auditLog.upsert({
      where: { id: log.id },
      update: {},
      create: {
        id: log.id,
        timestamp: new Date(log.timestamp),
        user: log.user,
        action: log.action as any,
        module: log.module,
        resource: log.resource,
        details: log.details,
        ipAddress: log.ipAddress,
      },
    });
  }

  // 12. Seed Notifications
  console.log('🔔 Seeding Notifications...');
  for (const n of notifications) {
    await prisma.appNotification.upsert({
      where: { id: n.id },
      update: { read: n.read },
      create: {
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        timestamp: new Date(n.timestamp),
        read: n.read,
        priority: n.priority,
        actionUrl: n.actionUrl,
      },
    });
  }

  console.log('🎉 Idempotent database seeding successfully completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
