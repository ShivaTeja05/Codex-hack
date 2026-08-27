import type { Citizen } from '@/lib/types';

export const citizens: Citizen[] = [
  {
    id: 'demo-priya',
    displayName: 'Priya Demo',
    documents: [
      {
        source: 'aadhaar',
        label: 'Synthetic identity record',
        issuer: 'Local demo wallet',
        provenance: 'issued',
        issuedOn: '2024-01-10',
        fields: {
          name: 'Priya Sharma',
          fatherName: 'Rajeev Kumar',
          dob: '14-08-2005',
        },
      },
      {
        source: 'marksheet12',
        label: 'Synthetic Class 12 marksheet',
        issuer: 'Demo Education Board',
        provenance: 'issued',
        issuedOn: '2023-05-20',
        fields: { name: 'PRIYA SHARMA', dob: '14/08/2005' },
      },
      {
        source: 'incomeCertificate',
        label: 'Synthetic income certificate',
        issuer: 'Demo Revenue Office',
        provenance: 'uploaded',
        issuedOn: '2026-03-01',
        validUntil: '2027-02-28',
        fields: {
          fatherName: 'Rajiv Kumar',
          annualIncome: '₹2,80,000',
        },
      },
      {
        source: 'casteCertificate',
        label: 'Synthetic category certificate',
        issuer: 'Demo Revenue Office',
        provenance: 'uploaded',
        issuedOn: '2025-04-27',
        validUntil: '2026-04-27',
        fields: { name: 'Priya Sharma', category: 'SC' },
      },
      {
        source: 'bank',
        label: 'Synthetic bank record',
        issuer: 'Demo Bank',
        provenance: 'issued',
        issuedOn: '2022-06-12',
        fields: { name: 'Priya Sharma', bankAccount: 'DEMO-ACCT-2201' },
      },
      {
        source: 'applicationForm',
        label: 'Synthetic scholarship form',
        issuer: 'Milaan local demo',
        provenance: 'uploaded',
        issuedOn: '2026-08-27',
        fields: {
          annualIncome: '₹2,80,000',
          bankAccount: 'DEMO-ACCT-9914',
        },
      },
    ],
  },
  {
    id: 'demo-arun',
    displayName: 'Arun Demo',
    documents: [
      {
        source: 'aadhaar',
        label: 'Synthetic identity record',
        issuer: 'Local demo wallet',
        provenance: 'issued',
        issuedOn: '2024-02-04',
        fields: {
          name: 'Arun Rao',
          fatherName: 'Mahesh Rao',
          dob: '03-11-2004',
        },
      },
      {
        source: 'marksheet12',
        label: 'Synthetic Class 12 marksheet',
        issuer: 'Demo Education Board',
        provenance: 'issued',
        issuedOn: '2022-05-18',
        fields: { name: 'Arun Rao', dob: '03/11/2004' },
      },
      {
        source: 'incomeCertificate',
        label: 'Synthetic income certificate',
        issuer: 'Demo Revenue Office',
        provenance: 'uploaded',
        issuedOn: '2026-02-10',
        validUntil: '2027-02-09',
        fields: { fatherName: 'Mahesh Rao', annualIncome: '₹1,80,000' },
      },
      {
        source: 'casteCertificate',
        label: 'Synthetic category certificate',
        issuer: 'Demo Revenue Office',
        provenance: 'uploaded',
        issuedOn: '2026-01-03',
        validUntil: '2030-01-02',
        fields: { name: 'Arun Rao', category: 'SC' },
      },
      {
        source: 'bank',
        label: 'Synthetic bank record',
        issuer: 'Demo Bank',
        provenance: 'issued',
        issuedOn: '2025-09-12',
        fields: { name: 'Arun Rao', bankAccount: 'DEMO-ACCT-4402' },
      },
      {
        source: 'applicationForm',
        label: 'Synthetic scholarship form',
        issuer: 'Milaan local demo',
        provenance: 'uploaded',
        issuedOn: '2026-08-27',
        fields: {
          annualIncome: '₹1,80,000',
          bankAccount: 'DEMO-ACCT-4402',
        },
      },
    ],
  },
];

export function getCitizen(id?: string | null): Citizen {
  return citizens.find((citizen) => citizen.id === id) ?? citizens[0];
}
