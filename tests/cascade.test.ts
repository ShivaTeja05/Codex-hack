import { describe, expect, it } from 'vitest';
import { applyChange, cascade } from '@/lib/engine/cascade';
import { getCitizen } from '@/lib/seed/citizens';
import { POST_MATRIC_SCHOLARSHIP_ID } from '@/lib/seed/entitlements';

describe('correction cascade', () => {
  it('resolves Priya’s father-name difference without mutating seed data', () => {
    const citizen = getCitizen('demo-priya');
    const snapshot = JSON.stringify(citizen);
    const change = {
      source: 'incomeCertificate' as const,
      field: 'fatherName',
      newValue: 'Rajeev Kumar',
    };

    const result = cascade(citizen, change, POST_MATRIC_SCHOLARSHIP_ID);

    expect(result.resolvedConflicts.some((item) => item.field === 'fatherName')).toBe(true);
    expect(result.newConflicts).toHaveLength(0);
    expect(JSON.stringify(citizen)).toBe(snapshot);
    expect(
      applyChange(citizen, change).documents.find(
        (document) => document.source === 'incomeCertificate',
      )?.fields.fatherName,
    ).toBe('Rajeev Kumar');
  });
});
