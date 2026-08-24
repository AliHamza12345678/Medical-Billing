import crypto from 'crypto';

export interface Edi270RequestParams {
  patientId: string;
  patientName: string;
  provider: string;
  memberId: string;
  planName: string;
  serviceTypeCode?: string; // Default '30' (Health Benefit Coverage)
}

export interface Edi270GenerationResult {
  transactionId: string;
  controlNumber: string;
  isaControlNumber: string;
  gsControlNumber: string;
  stControlNumber: string;
  generatedTimestamp: Date;
  segmentCount: number;
  payload: string;
}

export class Edi270Generator {
  /**
   * Generates a fully compliant ANSI X12 270 Health Care Eligibility Benefit Inquiry payload.
   */
  static generate270Request(params: Edi270RequestParams): Edi270GenerationResult {
    const timestamp = new Date();
    const dateYYMMDD = timestamp.toISOString().slice(2, 10).replace(/-/g, '');
    const dateYYYYMMDD = timestamp.toISOString().slice(0, 10).replace(/-/g, '');
    const timeHHMM = timestamp.toISOString().slice(11, 16).replace(/:/g, '');

    // Control Numbers for Correlation Tracking
    const randomHex = crypto.randomBytes(3).toString('hex');
    const isaControlNumber = (Math.floor(100000000 + Math.random() * 900000000)).toString(); // 9 digits
    const gsControlNumber = isaControlNumber.slice(-6); // 6 digits
    const stControlNumber = '0001';
    const controlNumber = `CTL-${dateYYYYMMDD}-${isaControlNumber}`;
    const transactionId = `270-${Date.now()}-${randomHex}`;

    const nameParts = params.patientName.trim().split(' ');
    const firstName = nameParts[0] || 'PATIENT';
    const lastName = nameParts.slice(1).join(' ') || 'UNKNOWN';
    const payerName = params.provider.toUpperCase().trim();
    const payerId = `PAYER${payerName.replace(/[^A-Z0-9]/g, '').slice(0, 5)}`;
    const serviceType = params.serviceTypeCode || '30';

    const segments: string[] = [];

    // ISA - Interchange Control Header
    segments.push(
      `ISA*00*          *00*          *ZZ*MEDIBILL       *ZZ*CLEARINGHOUSE  *${dateYYMMDD}*${timeHHMM}*^*00501*${isaControlNumber}*0*P*:~`
    );

    // GS - Functional Group Header (HS = Health Care Eligibility Benefit Inquiry)
    segments.push(
      `GS*HS*MEDIBILL*CLEARINGHOUSE*${dateYYYYMMDD}*${timeHHMM}*${gsControlNumber}*X*005010X279A1~`
    );

    // ST - Transaction Set Header (270)
    segments.push(`ST*270*${stControlNumber}*005010X279A1~`);

    // BHT - Beginning of Hierarchical Transaction (0022 = Eligibility, 13 = Request, RT = Real Time)
    segments.push(`BHT*0022*13*${controlNumber}*${dateYYYYMMDD}*${timeHHMM}*RT~`);

    // HL Loop 2000A - Information Source (Payer)
    segments.push(`HL*1**20*1~`);
    segments.push(`NM1*PR*2*${payerName}*****PI*${payerId}~`);

    // HL Loop 2000B - Information Receiver (Provider)
    segments.push(`HL*2*1*21*1~`);
    segments.push(`NM1*1P*2*MEDIBILL HEALTHCARE SERVICES*****XX*1992837465~`);

    // HL Loop 2000C - Subscriber / Patient
    segments.push(`HL*3*2*22*0~`);
    segments.push(`TRN*1*${controlNumber}*1992837465~`);
    segments.push(`NM1*IL*1*${lastName.toUpperCase()}*${firstName.toUpperCase()}****MI*${params.memberId.toUpperCase()}~`);
    if (params.planName) {
      segments.push(`REF*18*${params.planName.toUpperCase()}~`);
    }

    // EQ - Eligibility Inquiry Segment (30 = Health Benefit Coverage)
    segments.push(`EQ*${serviceType}~`);

    // SE - Transaction Set Trailer (excluding ISA & GS, plus SE)
    const segmentCount = segments.length - 2 + 1;
    segments.push(`SE*${segmentCount}*${stControlNumber}~`);

    // GE - Functional Group Trailer
    segments.push(`GE*1*${gsControlNumber}~`);

    // IEA - Interchange Control Trailer
    segments.push(`IEA*1*${isaControlNumber}~`);

    const payload = segments.join('\n');

    return {
      transactionId,
      controlNumber,
      isaControlNumber,
      gsControlNumber,
      stControlNumber,
      generatedTimestamp: timestamp,
      segmentCount: segments.length,
      payload,
    };
  }
}
