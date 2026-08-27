import type { FieldKey, RecordSource } from '@/lib/types';

export const fieldLabels: Record<FieldKey, string> = {
  name: 'Applicant name',
  fatherName: "Father's name",
  dob: 'Date of birth',
  annualIncome: 'Annual income',
  category: 'Category',
  bankAccount: 'Bank account reference',
};

export const sourceLabels: Record<RecordSource, string> = {
  aadhaar: 'Synthetic identity record',
  pan: 'Synthetic tax record',
  bank: 'Synthetic bank record',
  marksheet12: 'Synthetic Class 12 marksheet',
  incomeCertificate: 'Synthetic income certificate',
  casteCertificate: 'Synthetic category certificate',
  applicationForm: 'Synthetic scholarship form',
};
