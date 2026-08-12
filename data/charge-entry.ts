import type { ProcedureCode, DiagnosisCode, ChargeEntry } from '@/types';

export const procedureCodes: ProcedureCode[] = [
  { id: 'cpt-1', cptCode: '99202', description: 'Office visit, new patient, simple', category: 'Evaluation', standardCharge: 95, medicareRate: 78, rvu: 0.93, status: 'Active' },
  { id: 'cpt-2', cptCode: '99203', description: 'Office visit, new patient, low complexity', category: 'Evaluation', standardCharge: 135, medicareRate: 110, rvu: 1.6, status: 'Active' },
  { id: 'cpt-3', cptCode: '99204', description: 'Office visit, new patient, moderate complexity', category: 'Evaluation', standardCharge: 180, medicareRate: 151, rvu: 2.6, status: 'Active' },
  { id: 'cpt-4', cptCode: '99205', description: 'Office visit, new patient, high complexity', category: 'Evaluation', standardCharge: 235, medicareRate: 209, rvu: 3.5, status: 'Active' },
  { id: 'cpt-5', cptCode: '99212', description: 'Office visit, established patient, simple', category: 'Evaluation', standardCharge: 75, medicareRate: 56, rvu: 0.7, status: 'Active' },
  { id: 'cpt-6', cptCode: '99213', description: 'Office visit, established patient, low complexity', category: 'Evaluation', standardCharge: 110, medicareRate: 92, rvu: 1.3, status: 'Active' },
  { id: 'cpt-7', cptCode: '99214', description: 'Office visit, established patient, moderate complexity', category: 'Evaluation', standardCharge: 165, medicareRate: 137, rvu: 1.92, status: 'Active' },
  { id: 'cpt-8', cptCode: '99215', description: 'Office visit, established patient, high complexity', category: 'Evaluation', standardCharge: 220, medicareRate: 184, rvu: 2.8, status: 'Active' },
  { id: 'cpt-9', cptCode: '93000', description: 'Electrocardiogram, complete', category: 'Medicine', standardCharge: 95, medicareRate: 72, rvu: 0.97, status: 'Active' },
  { id: 'cpt-10', cptCode: '93005', description: 'ECG tracing only', category: 'Medicine', standardCharge: 35, medicareRate: 26, rvu: 0.36, status: 'Active' },
  { id: 'cpt-11', cptCode: '80053', description: 'Comprehensive metabolic panel', category: 'Pathology', standardCharge: 45, medicareRate: 31, rvu: 0.49, status: 'Active' },
  { id: 'cpt-12', cptCode: '85025', description: 'Complete blood count with differential', category: 'Pathology', standardCharge: 32, medicareRate: 22, rvu: 0.35, status: 'Active' },
  { id: 'cpt-13', cptCode: '71045', description: 'X-ray, chest, single view', category: 'Radiology', standardCharge: 75, medicareRate: 52, rvu: 0.7, status: 'Active' },
  { id: 'cpt-14', cptCode: '72148', description: 'MRI lumbar spine without contrast', category: 'Radiology', standardCharge: 680, medicareRate: 485, rvu: 5.2, status: 'Active' },
  { id: 'cpt-15', cptCode: '73721', description: 'MRI knee without contrast', category: 'Radiology', standardCharge: 720, medicareRate: 510, rvu: 5.4, status: 'Active' },
  { id: 'cpt-16', cptCode: '93306', description: 'Echocardiogram, transthoracic, complete', category: 'Medicine', standardCharge: 320, medicareRate: 243, rvu: 3.0, status: 'Active' },
  { id: 'cpt-17', cptCode: '97110', description: 'Therapeutic exercises, 15 min', category: 'Medicine', standardCharge: 58, medicareRate: 41, rvu: 0.5, status: 'Active' },
  { id: 'cpt-18', cptCode: '17000', description: 'Destruction of premalignant lesion, 1st', category: 'Surgery', standardCharge: 120, medicareRate: 92, rvu: 1.0, status: 'Active' },
  { id: 'cpt-19', cptCode: '11042', description: 'Debridement, skin, subcutaneous tissue', category: 'Surgery', standardCharge: 185, medicareRate: 148, rvu: 1.5, status: 'Active' },
  { id: 'cpt-20', cptCode: '00100', description: 'Anesthesia for procedures on head', category: 'Anesthesia', standardCharge: 290, medicareRate: 218, rvu: 2.4, status: 'Active' },
  { id: 'cpt-21', cptCode: '90471', description: 'Immunization administration, 1 vaccine', category: 'Medicine', standardCharge: 45, medicareRate: 32, rvu: 0.4, status: 'Active' },
  { id: 'cpt-22', cptCode: '90686', description: 'Influenza vaccine, quadrivalent', category: 'Medicine', standardCharge: 68, medicareRate: 51, rvu: 0.6, status: 'Active' },
  { id: 'cpt-23', cptCode: '45378', description: 'Colonoscopy, diagnostic', category: 'Surgery', standardCharge: 980, medicareRate: 742, rvu: 7.5, status: 'Active' },
  { id: 'cpt-24', cptCode: '94010', description: 'Spirometry, complete', category: 'Medicine', standardCharge: 88, medicareRate: 66, rvu: 0.8, status: 'Active' },
  { id: 'cpt-25', cptCode: '99291', description: 'Critical care, first 30-74 min', category: 'Evaluation', standardCharge: 420, medicareRate: 351, rvu: 4.5, status: 'Inactive' },
];

export const diagnosisCodes: DiagnosisCode[] = [
  { id: 'icd-1', icd10Code: 'I10', description: 'Essential (primary) hypertension', category: 'Circulatory', status: 'Active' },
  { id: 'icd-2', icd10Code: 'E11.9', description: "Type 2 diabetes mellitus without complications", category: 'Endocrine', status: 'Active' },
  { id: 'icd-3', icd10Code: 'E78.5', description: 'Hyperlipidemia, unspecified', category: 'Endocrine', status: 'Active' },
  { id: 'icd-4', icd10Code: 'J45.909', description: 'Unspecified asthma, uncomplicated', category: 'Respiratory', status: 'Active' },
  { id: 'icd-5', icd10Code: 'M54.5', description: 'Low back pain', category: 'Musculoskeletal', status: 'Active' },
  { id: 'icd-6', icd10Code: 'M25.561', description: 'Pain in right knee', category: 'Musculoskeletal', status: 'Active' },
  { id: 'icd-7', icd10Code: 'K21.9', description: 'Gastro-esophageal reflux disease without esophagitis', category: 'Digestive', status: 'Active' },
  { id: 'icd-8', icd10Code: 'F41.1', description: 'Generalized anxiety disorder', category: 'Mental', status: 'Active' },
  { id: 'icd-9', icd10Code: 'F32.9', description: 'Major depressive disorder, single episode', category: 'Mental', status: 'Active' },
  { id: 'icd-10', icd10Code: 'I25.10', description: 'Atherosclerotic heart disease of native coronary artery', category: 'Circulatory', status: 'Active' },
  { id: 'icd-11', icd10Code: 'N39.0', description: 'Urinary tract infection, site not specified', category: 'Genitourinary', status: 'Active' },
  { id: 'icd-12', icd10Code: 'J02.9', description: 'Acute pharyngitis, unspecified', category: 'Respiratory', status: 'Active' },
  { id: 'icd-13', icd10Code: 'J20.9', description: 'Acute bronchitis, unspecified', category: 'Respiratory', status: 'Active' },
  { id: 'icd-14', icd10Code: 'R51.9', description: 'Headache, unspecified', category: 'Symptoms', status: 'Active' },
  { id: 'icd-15', icd10Code: 'R10.9', description: 'Unspecified abdominal pain', category: 'Symptoms', status: 'Active' },
  { id: 'icd-16', icd10Code: 'Z00.00', description: 'Encounter for general adult medical exam', category: 'Factors', status: 'Active' },
  { id: 'icd-17', icd10Code: 'Z12.31', description: 'Encounter for screening mammogram', category: 'Factors', status: 'Active' },
  { id: 'icd-18', icd10Code: 'E78.0', description: 'Pure hypercholesterolemia', category: 'Endocrine', status: 'Active' },
  { id: 'icd-19', icd10Code: 'M17.11', description: 'Unilateral primary osteoarthritis, right knee', category: 'Musculoskeletal', status: 'Active' },
  { id: 'icd-20', icd10Code: 'G47.33', description: 'Obstructive sleep apnea', category: 'Nervous', status: 'Active' },
];

export function getCpt(code: string): ProcedureCode | undefined {
  return procedureCodes.find((c) => cptCodeValue(c) === code);
}
export function cptCodeValue(c: ProcedureCode) {
  return c.cptCode;
}
export function getIcd(code: string): DiagnosisCode | undefined {
  return diagnosisCodes.find((c) => c.icd10Code === code);
}

export const chargeEntries: ChargeEntry[] = [
  { id: 'ce-001', patientName: 'James Smith', patientId: 'pt-0001', cptCode: '99213', cptDescription: 'Office visit, established patient, low complexity', icd10Code: 'I10', icd10Description: 'Essential (primary) hypertension', quantity: 1, unitCharge: 110, totalCharge: 110, provider: 'Dr. Sarah Chen', serviceDate: '2025-07-28', status: 'Billed' },
  { id: 'ce-002', patientName: 'Mary Johnson', patientId: 'pt-0002', cptCode: '93000', cptDescription: 'Electrocardiogram, complete', icd10Code: 'I25.10', icd10Description: 'Atherosclerotic heart disease', quantity: 1, unitCharge: 95, totalCharge: 95, provider: 'Dr. Sarah Chen', serviceDate: '2025-07-29', status: 'Submitted' },
  { id: 'ce-003', patientName: 'Robert Williams', patientId: 'pt-0003', cptCode: '80053', cptDescription: 'Comprehensive metabolic panel', icd10Code: 'E11.9', icd10Description: 'Type 2 diabetes mellitus', quantity: 1, unitCharge: 45, totalCharge: 45, provider: 'Dr. Michael Reyes', serviceDate: '2025-07-30', status: 'Billed' },
  { id: 'ce-004', patientName: 'Patricia Brown', patientId: 'pt-0004', cptCode: '71045', cptDescription: 'X-ray, chest, single view', icd10Code: 'J45.909', icd10Description: 'Unspecified asthma', quantity: 1, unitCharge: 75, totalCharge: 75, provider: 'Dr. Michael Reyes', serviceDate: '2025-07-30', status: 'Submitted' },
  { id: 'ce-005', patientName: 'John Jones', patientId: 'pt-0005', cptCode: '93306', cptDescription: 'Echocardiogram, transthoracic, complete', icd10Code: 'I25.10', icd10Description: 'Atherosclerotic heart disease', quantity: 1, unitCharge: 320, totalCharge: 320, provider: 'Dr. Sarah Chen', serviceDate: '2025-07-31', status: 'Billed' },
  { id: 'ce-006', patientName: 'Jennifer Garcia', patientId: 'pt-0006', cptCode: '99214', cptDescription: 'Office visit, established patient, moderate complexity', icd10Code: 'F41.1', icd10Description: 'Generalized anxiety disorder', quantity: 1, unitCharge: 165, totalCharge: 165, provider: 'Dr. Emily Park', serviceDate: '2025-07-31', status: 'Draft' },
  { id: 'ce-007', patientName: 'Michael Miller', patientId: 'pt-0007', cptCode: '72148', cptDescription: 'MRI lumbar spine without contrast', icd10Code: 'M54.5', icd10Description: 'Low back pain', quantity: 1, unitCharge: 680, totalCharge: 680, provider: 'Dr. Michael Reyes', serviceDate: '2025-08-01', status: 'Submitted' },
  { id: 'ce-008', patientName: 'Linda Davis', patientId: 'pt-0008', cptCode: '97110', cptDescription: 'Therapeutic exercises, 15 min', icd10Code: 'M25.561', icd10Description: 'Pain in right knee', quantity: 4, unitCharge: 58, totalCharge: 232, provider: 'Dr. Emily Park', serviceDate: '2025-08-01', status: 'Billed' },
  { id: 'ce-009', patientName: 'David Rodriguez', patientId: 'pt-0009', cptCode: '99214', cptDescription: 'Office visit, established patient, moderate complexity', icd10Code: 'E78.5', icd10Description: 'Hyperlipidemia', quantity: 1, unitCharge: 165, totalCharge: 165, provider: 'Dr. Sarah Chen', serviceDate: '2025-08-02', status: 'Draft' },
  { id: 'ce-010', patientName: 'Elizabeth Martinez', patientId: 'pt-0010', cptCode: '85025', cptDescription: 'Complete blood count with differential', icd10Code: 'N39.0', icd10Description: 'Urinary tract infection', quantity: 1, unitCharge: 32, totalCharge: 32, provider: 'Dr. Michael Reyes', serviceDate: '2025-08-02', status: 'Submitted' },
  { id: 'ce-011', patientName: 'William Hernandez', patientId: 'pt-0011', cptCode: '93000', cptDescription: 'Electrocardiogram, complete', icd10Code: 'I10', icd10Description: 'Essential hypertension', quantity: 1, unitCharge: 95, totalCharge: 95, provider: 'Dr. Sarah Chen', serviceDate: '2025-08-02', status: 'Billed' },
  { id: 'ce-012', patientName: 'Barbara Lopez', patientId: 'pt-0012', cptCode: '99213', cptDescription: 'Office visit, established patient, low complexity', icd10Code: 'F32.9', icd10Description: 'Major depressive disorder', quantity: 1, unitCharge: 110, totalCharge: 110, provider: 'Dr. Emily Park', serviceDate: '2025-08-02', status: 'Draft' },
];
