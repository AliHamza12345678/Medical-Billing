import '@/lib/config/env';
import { Edi270Generator } from '../lib/server/edi/edi-270-generator';
import { Edi271Parser } from '../lib/server/edi/edi-271-parser';
import { eligibilityAdapter } from '../lib/server/integrations/clearinghouse/eligibility-adapter';

async function runEdi270271TestSuite() {
  console.log('=== REAL EDI 270/271 HEALTHCARE CLEARINGHOUSE INTEGRATION TEST SUITE ===\n');

  // TEST 1: ANSI X12 270 Request Generation
  console.log('[1/7] Testing ANSI X12 270 Request Generation...');
  const requestParams = {
    patientId: 'pat-101',
    patientName: 'Jane Doe',
    provider: 'BLUE CROSS BLUE SHIELD',
    memberId: 'BCBS987654321',
    planName: 'PPO Gold Choice',
  };

  const edi270 = Edi270Generator.generate270Request(requestParams);

  if (!edi270.payload.includes('ST*270*0001*005010X279A1~')) {
    throw new Error('270 GENERATION FAILURE: ST*270 segment missing or invalid format!');
  }
  if (!edi270.payload.includes('BHT*0022*13*')) {
    throw new Error('270 GENERATION FAILURE: BHT*0022 eligibility header segment missing!');
  }
  if (!edi270.payload.includes('EQ*30~')) {
    throw new Error('270 GENERATION FAILURE: EQ*30 Health Benefit Coverage inquiry missing!');
  }
  if (!edi270.isaControlNumber || edi270.isaControlNumber.length !== 9) {
    throw new Error(`270 GENERATION FAILURE: Invalid ISA13 control number format '${edi270.isaControlNumber}'`);
  }

  console.log(` -> PASSED: X12 270 payload generated successfully (Control Number: ${edi270.controlNumber}, ${edi270.segmentCount} segments).\n`);

  // TEST 2: Valid X12 271 Response Parsing (Active Coverage, Copay, Deductible, Coinsurance)
  console.log('[2/7] Testing ANSI X12 271 Response Parsing (Active Coverage)...');
  const sampleActive271 = [
    `ISA*00*          *00*          *ZZ*BCBS           *ZZ*MEDIBILL       *260821*1200*^*00501*100000001*0*P*:~`,
    `GS*HB*BCBS*MEDIBILL*20260821*1200*000001*X*005010X279A1~`,
    `ST*271*0001*005010X279A1~`,
    `BHT*0022*11*${edi270.controlNumber}*20260821*1200~`,
    `HL*1**20*1~`,
    `NM1*PR*2*BLUE CROSS BLUE SHIELD*****PI*PAYER01~`,
    `HL*2*1*21*1~`,
    `NM1*1P*2*MEDIBILL HEALTHCARE*****XX*1992837465~`,
    `HL*3*2*22*0~`,
    `TRN*2*REF-271-998877*1992837465~`,
    `NM1*IL*1*DOE*JANE****MI*BCBS987654321~`,
    `EB*1**30****80~`,      // Active coverage (80% coinsurance)
    `EB*8**30***27*35.00~`,  // Copay $35.00
    `EB*C**30***27*250.00~`, // Deductible remaining $250.00
    `SE*14*0001~`,
    `GE*1*000001~`,
    `IEA*1*100000001~`,
  ].join('\n');

  const parsedActive = Edi271Parser.parse271Response(sampleActive271, edi270.controlNumber);

  if (parsedActive.status !== 'Verified') throw new Error(`Expected status 'Verified', got '${parsedActive.status}'`);
  if (parsedActive.copay !== 35.0) throw new Error(`Expected copay 35.00, got ${parsedActive.copay}`);
  if (parsedActive.deductibleRemaining !== 250.0) throw new Error(`Expected deductible 250.00, got ${parsedActive.deductibleRemaining}`);
  if (parsedActive.coveragePercent !== 80.0) throw new Error(`Expected coveragePercent 80.0, got ${parsedActive.coveragePercent}`);

  console.log(' -> PASSED: Parsed active 271 EDI payload cleanly (Verified: 80% coverage, $35 copay, $250 deductible).\n');

  // TEST 3: Inactive / No Coverage 271 Response Parsing
  console.log('[3/7] Testing ANSI X12 271 Response Parsing (Inactive / No Coverage)...');
  const sampleInactive271 = [
    `ISA*00*          *00*          *ZZ*BCBS           *ZZ*MEDIBILL       *260821*1200*^*00501*100000002*0*P*:~`,
    `GS*HB*BCBS*MEDIBILL*20260821*1200*000002*X*005010X279A1~`,
    `ST*271*0001*005010X279A1~`,
    `BHT*0022*11*CTL-INACTIVE-001*20260821*1200~`,
    `HL*1**20*1~`,
    `NM1*PR*2*AETNA*****PI*PAYER02~`,
    `HL*2*1*21*1~`,
    `NM1*1P*2*MEDIBILL HEALTHCARE*****XX*1992837465~`,
    `HL*3*2*22*0~`,
    `NM1*IL*1*SMITH*BOB****MI*AETNA112233~`,
    `EB*6**30~`, // Inactive Coverage
    `SE*10*0001~`,
    `GE*1*000002~`,
    `IEA*1*100000002~`,
  ].join('\n');

  const parsedInactive = Edi271Parser.parse271Response(sampleInactive271, 'CTL-INACTIVE-001');

  if (parsedInactive.status !== 'Not Found') {
    throw new Error(`Expected status 'Not Found' for inactive coverage, got '${parsedInactive.status}'`);
  }
  console.log(' -> PASSED: Parsed inactive 271 EDI payload cleanly (Status: Not Found).\n');

  // TEST 4: AAA Segment Payer Rejection Parsing
  console.log('[4/7] Testing AAA Segment Payer Rejection Handling...');
  const sampleRejection271 = [
    `ISA*00*          *00*          *ZZ*CIGNA          *ZZ*MEDIBILL       *260821*1200*^*00501*100000003*0*P*:~`,
    `GS*HB*CIGNA*MEDIBILL*20260821*1200*000003*X*005010X279A1~`,
    `ST*271*0001*005010X279A1~`,
    `BHT*0022*11*CTL-REJECT-001*20260821*1200~`,
    `AAA*N**42*C~`, // Code 42: Patient Not Found in Payer Database
    `SE*6*0001~`,
    `GE*1*000003~`,
    `IEA*1*100000003~`,
  ].join('\n');

  const parsedRejection = Edi271Parser.parse271Response(sampleRejection271, 'CTL-REJECT-001');

  if (parsedRejection.status !== 'Not Found' || !parsedRejection.rejectionReason?.includes('Patient / Member Not Found')) {
    throw new Error(`AAA Rejection parsing failed! Got status '${parsedRejection.status}', reason: '${parsedRejection.rejectionReason}'`);
  }
  console.log(` -> PASSED: AAA segment parsed correctly (Reason: '${parsedRejection.rejectionReason}').\n`);

  // TEST 5: Control Number Correlation Mismatch Detection
  console.log('[5/7] Testing Correlation Control Number Mismatch Detection...');
  let correlationMismatchCaught = false;
  try {
    Edi271Parser.parse271Response(sampleActive271, 'MISMATCHED-EXPECTED-CONTROL-NUMBER');
  } catch (err: any) {
    if (err.statusCode === 400 && err.message.includes('correlation failure')) {
      correlationMismatchCaught = true;
    }
  }

  if (!correlationMismatchCaught) {
    throw new Error('CORRELATION FAILURE: Parser allowed 271 response with mismatched control number!');
  }
  console.log(' -> PASSED: Mismatched control numbers correctly caught and rejected.\n');

  // TEST 6: Clearinghouse Eligibility Adapter Verification
  console.log('[6/7] Testing ClearinghouseEligibilityAdapter.verify Execution...');
  const adapterResult = await eligibilityAdapter.verify({
    patientId: 'pat-102',
    patientName: 'Robert Johnson',
    provider: 'UNITED HEALTHCARE',
    memberId: 'UHC55443322',
    planName: 'Choice Plus Choice',
  });

  if (!adapterResult.status || adapterResult.copay === undefined || adapterResult.deductibleRemaining === undefined) {
    throw new Error('Adapter verify execution returned incomplete response structure');
  }
  console.log(` -> PASSED: Adapter executed 270/271 clearinghouse flow (Status: ${adapterResult.status}, Copay: $${adapterResult.copay}, Deductible: $${adapterResult.deductibleRemaining}).\n`);

  // TEST 7: Malformed 271 Response Handling
  console.log('[7/7] Testing Malformed / Invalid 271 Response Rejection...');
  let malformedCaught = false;
  try {
    Edi271Parser.parse271Response('INVALID_NON_EDI_STRING');
  } catch (err: any) {
    malformedCaught = true;
  }

  if (!malformedCaught) {
    throw new Error('Expected malformed 271 string to be rejected!');
  }
  console.log(' -> PASSED: Malformed 271 EDI payloads rejected safely without throwing unhandled exceptions.\n');

  console.log('=== ALL REAL EDI 270/271 CLEARINGHOUSE INTEGRATION TESTS PASSED (0 ERRORS) ===');
}

runEdi270271TestSuite().catch((err) => {
  console.error('❌ EDI 270/271 Test Suite Failed:', err);
  process.exit(1);
});
