import { describe, expect, it } from 'vitest';
import { attentionCount } from '@/lib/engine/issues';
import { sortRecords } from '@/lib/engine/records';
import { citizenProfiles, getCitizenProfile } from '@/lib/seed/profiles';
import { validateCitationSources } from '@/lib/validation/citations';

describe('full app demo data', () => {
  it('keeps Priya’s required issue and record ordering deterministic', () => {
    const priya = getCitizenProfile('demo-priya');

    expect(attentionCount(priya.issues)).toBe(3);
    expect(sortRecords(priya.records).map((record) => record.status)).toEqual([
      'blocked',
      'wrong',
      'expired',
      'clear',
      'unknown',
      'optional',
    ]);
    expect(priya.documents).toHaveLength(5);
    expect(priya.documents.filter((document) => document.provenance === 'issued')).toHaveLength(3);
    expect(priya.documents.filter((document) => document.state === 'pending')).toHaveLength(1);
  });

  it('keeps Arun clean apart from unknown and optional records', () => {
    const arun = getCitizenProfile('demo-arun');
    expect(arun.issues).toHaveLength(0);
    expect(sortRecords(arun.records).map((record) => record.status)).toEqual([
      'clear',
      'clear',
      'clear',
      'clear',
      'unknown',
      'optional',
    ]);
  });

  it('stores only the final four Aadhaar digits and requires citations', () => {
    for (const profile of citizenProfiles) {
      expect(profile.identity.aadhaarLast4).toMatch(/^\d{4}$/);
      expect(profile.identity).not.toHaveProperty('aadhaarNumber');
    }

    expect(() =>
      validateCitationSources(
        citizenProfiles.flatMap((profile) => [
          ...profile.issues.map((issue) => ({ id: issue.id, source: issue.source })),
          ...profile.records.map((record) => ({ id: record.id, source: record.source })),
        ]),
      ),
    ).not.toThrow();
  });
});
