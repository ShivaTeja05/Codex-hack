import { describe, expect, it } from 'vitest';
import { applyChange, cascade } from '@/lib/engine/cascade';
import { applyChanges } from '@/lib/engine/verdict';
import { buildConflicts } from '@/lib/engine/conflicts';
import { getCitizen } from '@/lib/seed/citizens';
import { POST_MATRIC_SCHOLARSHIP_ID } from '@/lib/seed/entitlements';

const change = {
  source: 'incomeCertificate' as const,
  field: 'fatherName' as const,
  newValue: 'Rajeev Kumar',
};

describe('correction cascade', () => {
  it('does not mutate seed data and writes the new value', () => {
    const citizen = getCitizen('demo-priya');
    const snapshot = JSON.stringify(citizen);

    const result = cascade(citizen, change, POST_MATRIC_SCHOLARSHIP_ID);

    expect(result.newConflicts).toHaveLength(0);
    expect(JSON.stringify(citizen)).toBe(snapshot);
    expect(
      applyChange(citizen, change).documents.find(
        (document) => document.source === 'incomeCertificate',
      )?.fields.fatherName,
    ).toBe('Rajeev Kumar');
  });

  it('leaves the difference open while another record still disagrees', () => {
    const citizen = getCitizen('demo-priya');

    // The scholarship form carries the same wrong spelling as the certificate,
    // so correcting one of the two does not make the records agree.
    const result = cascade(citizen, change, POST_MATRIC_SCHOLARSHIP_ID);

    expect(result.resolvedConflicts.some((item) => item.field === 'fatherName')).toBe(false);
    expect(result.propagateTo).toContain('applicationForm');
  });

  it('resolves the difference once every disagreeing record is corrected', () => {
    const citizen = getCitizen('demo-priya');

    const corrected = applyChanges(citizen, [
      change,
      { source: 'applicationForm', field: 'fatherName', newValue: 'Rajeev Kumar' },
    ]);

    expect(
      buildConflicts(corrected, POST_MATRIC_SCHOLARSHIP_ID).some(
        (conflict) => conflict.field === 'fatherName',
      ),
    ).toBe(false);
  });
});
