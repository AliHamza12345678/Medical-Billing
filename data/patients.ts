import type {
  Patient,
  PatientInsurance,
  PatientDocument,
  Claim,
  Payment,
  Invoice,
  InvoiceLineItem,
} from '@/types';

export const patientInsurances = (pid: string): PatientInsurance[] => [
  {
    id: `ins-${pid}-1`,
    provider: 'Blue Cross Blue Shield',
    providerId: 'prov-bcbs',
    memberId: 'BCB8472910',
    groupNumber: 'GRP-002847',
    planName: 'PPO Preferred Plus',
    priority: 'Primary',
    status: 'Active',
    effectiveDate: '2025-01-01',
    expiryDate: '2025-12-31',
    copay: 25,
    deductible: 1500,
    deductibleMet: 875,
    coveragePercent: 80,
  },
  {
    id: `ins-${pid}-2`,
    provider: 'Aetna',
    providerId: 'prov-aetna',
    memberId: 'AET5920183',
    groupNumber: 'GRP-019283',
    planName: 'Aetna Choice POS',
    priority: 'Secondary',
    status: 'Active',
    effectiveDate: '2025-01-01',
    expiryDate: '2025-12-31',
    copay: 15,
    deductible: 1000,
    deductibleMet: 400,
    coveragePercent: 70,
  },
];

export const sampleDocuments = (pid: string): PatientDocument[] => [
  {
    id: `doc-${pid}-1`,
    name: 'Insurance Card Front.pdf',
    type: 'Insurance Card',
    uploadedOn: '2025-06-12',
    size: '124 KB',
  },
  {
    id: `doc-${pid}-2`,
    name: 'Insurance Card Back.pdf',
    type: 'Insurance Card',
    uploadedOn: '2025-06-12',
    size: '118 KB',
  },
  {
    id: `doc-${pid}-3`,
    name: 'Driver License.pdf',
    type: 'ID',
    uploadedOn: '2025-06-12',
    size: '256 KB',
  },
  {
    id: `doc-${pid}-4`,
    name: 'Referral Letter - Cardiology.pdf',
    type: 'Referral',
    uploadedOn: '2025-07-02',
    size: '89 KB',
  },
];

const avatarColors = [
  'bg-blue-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-violet-500',
  'bg-cyan-500',
  'bg-orange-500',
  'bg-teal-500',
];

const firstNames = [
  'James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda',
  'David', 'Elizabeth', 'William', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica',
  'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Nancy', 'Daniel', 'Lisa',
  'Matthew', 'Margaret', 'Anthony', 'Sandra', 'Mark', 'Ashley',
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
  'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
];

const cities: [string, string][] = [
  ['Boston', 'MA'], ['New York', 'NY'], ['Hartford', 'CT'], ['Providence', 'RI'],
  ['Manchester', 'NH'], ['Portland', 'ME'], ['Burlington', 'VT'], ['Albany', 'NY'],
];

const statuses: Patient['status'][] = ['Active', 'Active', 'Active', 'New', 'Inactive'];

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

const rng = seededRandom(42);
const pick = <T>(arr: T[]): T => arr[Math.floor(rng() * arr.length)];

function buildPatients(): Patient[] {
  const patients: Patient[] = [];
  for (let i = 0; i < 48; i++) {
    const firstName = pick(firstNames);
    const lastName = pick(lastNames);
    const [city, state] = pick(cities);
    const year = 1940 + Math.floor(rng() * 75);
    const month = String(1 + Math.floor(rng() * 12)).padStart(2, '0');
    const day = String(1 + Math.floor(rng() * 28)).padStart(2, '0');
    const id = `pt-${String(i + 1).padStart(4, '0')}`;
    const mrn = `MRN${String(100000 + i * 137).slice(0, 6)}`;
    const balance = Math.floor(rng() * 4000);
    const hasSecondary = rng() > 0.4;
    const insurances = hasSecondary
      ? patientInsurances(id)
      : [patientInsurances(id)[0]];
    patients.push({
      id,
      mrn,
      firstName,
      lastName,
      dateOfBirth: `${year}-${month}-${day}`,
      gender: rng() > 0.5 ? 'Male' : 'Female',
      phone: `(${200 + Math.floor(rng() * 700)}) ${100 + Math.floor(rng() * 899)}-${1000 + Math.floor(rng() * 8999)}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
      address: `${100 + Math.floor(rng() * 9000)} ${pick(['Main', 'Oak', 'Maple', 'Cedar', 'Pine', 'Elm', 'Park', 'Lake'])} ${pick(['St', 'Ave', 'Blvd', 'Dr', 'Ln'])}`,
      city,
      state,
      zip: String(10000 + Math.floor(rng() * 89999)),
      status: pick(statuses),
      balance,
      lastVisit: `2025-0${1 + Math.floor(rng() * 7)}-1${Math.floor(rng() * 9)}`,
      registeredOn: `202${Math.floor(rng() * 5)}-0${1 + Math.floor(rng() * 8)}-1${Math.floor(rng() * 9)}`,
      insurance: insurances,
      avatarColor: avatarColors[i % avatarColors.length],
      documents: sampleDocuments(id),
    });
  }
  return patients;
}

export const patients: Patient[] = buildPatients();

export function getPatientById(id: string): Patient | undefined {
  return patients.find((p) => p.id === id);
}

export function patientFullName(p: Patient): string {
  return `${p.firstName} ${p.lastName}`;
}

export function patientInitials(p: Patient): string {
  return `${p.firstName[0]}${p.lastName[0]}`;
}

export const patientsWithClaims = (claims: Claim[]): Patient[] =>
  patients.map((p) => ({
    ...p,
    balance: claims
      .filter((c) => c.patientId === p.id)
      .reduce((sum, c) => sum + c.patientResponsibility, 0),
  }));

export const lineItems = (pid: string): InvoiceLineItem[] => {
  const items: InvoiceLineItem[] = [];
  const codes: [string, string, number][] = [
    ['99213', 'Office visit, established patient, low to moderate complexity', 110],
    ['99214', 'Office visit, established patient, moderate complexity', 165],
    ['93000', 'Electrocardiogram, complete', 95],
    ['80053', 'Comprehensive metabolic panel', 45],
    ['85025', 'Complete blood count with differential', 32],
    ['71045', 'X-ray, chest, single view', 75],
  ];
  const count = 2 + Math.floor(rng() * 3);
  for (let i = 0; i < count; i++) {
    const [code, desc, price] = pick(codes);
    const qty = 1 + Math.floor(rng() * 2);
    items.push({
      id: `li-${pid}-${i}`,
      description: desc,
      cptCode: code,
      quantity: qty,
      unitPrice: price,
      total: qty * price,
    });
  }
  return items;
};

export { Invoice, Payment };
