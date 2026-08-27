import type { Entitlement } from '@/lib/types';

export const POST_MATRIC_SCHOLARSHIP_ID = 'post-matric-scholarship';
export const POST_MATRIC_INCOME_THRESHOLD = 250_000;

export const entitlements: Entitlement[] = [
  {
    id: POST_MATRIC_SCHOLARSHIP_ID,
    name: 'Post-matric scholarship',
    authority: 'Synthetic demo authority',
    requiredDocuments: [
      'aadhaar',
      'marksheet12',
      'incomeCertificate',
      'casteCertificate',
      'bank',
    ],
    ruleIds: [
      'consistency.fatherName',
      'consistency.name',
      'consistency.dob',
      'consistency.income',
      'eligibility.income',
      'eligibility.category',
      'document.required',
      'document.validity',
    ],
    slaDays: 30,
    slaSource: { instrument: 'TODO_CITATION' },
    applyUrl: 'https://www.scholarships.gov.in/',
  },
];

export function getEntitlement(id: string): Entitlement {
  return entitlements.find((item) => item.id === id) ?? entitlements[0];
}
