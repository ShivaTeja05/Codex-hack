import { describe, expect, it } from 'vitest';
import { buildConflicts } from '@/lib/engine/conflicts';
import { normaliseField } from '@/lib/engine/normalise';
import { getCitizen } from '@/lib/seed/citizens';
import { POST_MATRIC_SCHOLARSHIP_ID } from '@/lib/seed/entitlements';

describe('conflict detection', () => {
  it('keeps real spelling differences', () => {
    expect(normaliseField('fatherName', 'Rajeev Kumar')).not.toBe(
      normaliseField('fatherName', 'Rajiv Kumar'),
    );
  });

  it('collapses case and spacing', () => {
    expect(normaliseField('fatherName', 'RAJEEV KUMAR')).toBe(
      normaliseField('fatherName', 'Rajeev  Kumar'),
    );
  });

  it('reports the deliberate Priya name conflict', () => {
    const conflicts = buildConflicts(
      getCitizen('demo-priya'),
      POST_MATRIC_SCHOLARSHIP_ID,
    );
    expect(conflicts.some((conflict) => conflict.field === 'fatherName')).toBe(true);
  });
});
