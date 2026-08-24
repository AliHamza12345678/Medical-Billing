import { prisma } from '@/lib/db';
import { ApiError } from '../errors/api-error';

export interface Edi837TransactionResult {
  transactionId: string;
  controlNumber: string;
  claimId: string;
  generatedTimestamp: Date;
  segmentCount: number;
  payload: string;
}

export class Edi837Generator {
  static async generate837Transaction(claimId: string): Promise<Edi837TransactionResult> {
    const claim = await prisma.claim.findUnique({
      where: { id: claimId },
      include: { lines: true, patient: true },
    });

    if (!claim || claim.isDeleted) {
      throw ApiError.notFound(`Claim '${claimId}' not found for EDI generation`);
    }

    const controlNumber = Math.floor(100000000 + Math.random() * 900000000).toString();
    const transactionId = `EDI837-${claim.claimNumber}-${Date.now()}`;
    const timestamp = new Date();

    const dateYYMMDD = timestamp.toISOString().slice(2, 10).replace(/-/g, '');
    const dateYYYYMMDD = timestamp.toISOString().slice(0, 10).replace(/-/g, '');
    const timeHHMM = timestamp.toISOString().slice(11, 16).replace(/:/g, '');

    const segments: string[] = [];

    // ISA - Interchange Control Header
    segments.push(
      `ISA*00*          *00*          *ZZ*MEDIBILL       *ZZ*CLEARINGHOUSE  *${dateYYMMDD}*${timeHHMM}*^*00501*${controlNumber}*0*P*:~`
    );

    // GS - Functional Group Header
    segments.push(
      `GS*HC*MEDIBILL*CLEARINGHOUSE*${dateYYYYMMDD}*${timeHHMM}*${controlNumber.slice(-6)}*X*005010X222A1~`
    );

    // ST - Transaction Set Header
    segments.push(`ST*837*0001*005010X222A1~`);

    // BHT - Beginning of Hierarchical Transaction
    segments.push(`BHT*0019*00*${claim.claimNumber}*${dateYYYYMMDD}*${timeHHMM}*CH~`);

    // Loop 2000A - Billing Provider Hierarchical Level
    segments.push(`HL*1**20*1~`);
    segments.push(`NM1*85*2*MEDIBILL HEALTHCARE LLC*****XX*1992837465~`);
    segments.push(`N3*100 MEDICAL PARKWAY*SUITE 400~`);
    segments.push(`N4*AUSTIN*TX*78701~`);

    // Loop 2000B - Subscriber / Patient Hierarchical Level
    segments.push(`HL*2*1*22*0~`);
    segments.push(`SBR*P*18*******CI~`);
    segments.push(`NM1*IL*1*${claim.patientName.split(' ')[1] || 'PATIENT'}*${claim.patientName.split(' ')[0] || 'JOHN'}****MI*${claim.patientId.slice(0, 9)}~`);
    segments.push(`NM1*PR*2*${claim.insuranceProvider.toUpperCase()}*****PI*PAYER${claim.insuranceProvider.slice(0, 3).toUpperCase()}~`);

    // Loop 2300 - Claim Information
    const totalBilled = Number(claim.billedAmount).toFixed(2);
    segments.push(`CLM*${claim.claimNumber}*${totalBilled}***11:B:1*Y*A*Y*Y~`);
    segments.push(`DTP*431*D8*${claim.serviceDate.toISOString().slice(0, 10).replace(/-/g, '')}~`);

    // Diagnosis Codes (HI Segment)
    if (claim.icd10Codes && claim.icd10Codes.length > 0) {
      const diagStr = claim.icd10Codes.map((code) => `ABK:${code.replace('.', '')}`).join('*');
      segments.push(`HI*${diagStr}~`);
    }

    // Loop 2400 - Service Lines (SV1 Segment)
    claim.lines.forEach((line, idx) => {
      segments.push(`LX*${idx + 1}~`);
      segments.push(
        `SV1*HC:${line.cptCode}*${Number(line.totalCharge).toFixed(2)}*UN*${line.units}***1~`
      );
      segments.push(`DTP*472*D8*${claim.serviceDate.toISOString().slice(0, 10).replace(/-/g, '')}~`);
    });

    // SE - Transaction Set Trailer
    const segmentCount = segments.length - 2 + 1; // excluding ISA & GS, plus SE
    segments.push(`SE*${segmentCount + 1}*0001~`);

    // GE - Functional Group Trailer
    segments.push(`GE*1*${controlNumber.slice(-6)}~`);

    // IEA - Interchange Control Trailer
    segments.push(`IEA*1*${controlNumber}~`);

    const payload = segments.join('\n');

    return {
      transactionId,
      controlNumber,
      claimId: claim.id,
      generatedTimestamp: timestamp,
      segmentCount: segments.length,
      payload,
    };
  }
}
