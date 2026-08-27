import type { FieldKey } from '@/lib/types';

const HONORIFICS = /^(mr|mrs|ms|miss|shri|smt|dr)\s+/i;

export function normaliseField(key: FieldKey, raw: string): string {
  const trimmed = raw.trim().toLocaleLowerCase('en-IN');

  if (key === 'annualIncome') return trimmed.replace(/[^0-9]/g, '');
  if (key === 'dob') return trimmed.replace(/[^0-9]/g, '');
  if (key === 'bankAccount') return trimmed.replace(/[^a-z0-9]/g, '');

  const withoutHonorific =
    key === 'name' || key === 'fatherName'
      ? trimmed.replace(HONORIFICS, '')
      : trimmed;

  return withoutHonorific
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
