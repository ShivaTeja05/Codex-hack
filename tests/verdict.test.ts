import { describe, expect, it } from 'vitest';
import { applyChanges, buildCorrections, buildVerdict } from '@/lib/engine/verdict';
import { buildLinkageMap } from '@/lib/engine/linkage';
import { buildRouting } from '@/lib/engine/routing';
import { getCitizen } from '@/lib/seed/citizens';
import { getCitizenProfile } from '@/lib/seed/profiles';
import { POST_MATRIC_SCHOLARSHIP_ID as SCHEME } from '@/lib/seed/entitlements';
import { dbtReasons } from '@/lib/seed/reasonCodes';

describe('pre-submission verdict', () => {
  it('blocks Priya and names the rule that no correction can clear', () => {
    const verdict = buildVerdict(getCitizen('demo-priya'), SCHEME);
    expect(verdict.blocking.length).toBeGreaterThan(0);
    expect(verdict.unfixable.map((rule) => rule.ruleId)).toContain('eligibility.income');
  });

  it('clears Arun with no corrections offered', () => {
    const citizen = getCitizen('demo-arun');
    expect(buildVerdict(citizen, SCHEME).blocking).toHaveLength(0);
    expect(buildCorrections(citizen, SCHEME)).toHaveLength(0);
  });

  it('states a correction that rewrites more than one record', () => {
    const fatherName = buildCorrections(getCitizen('demo-priya'), SCHEME).find(
      (item) => item.field === 'fatherName',
    );
    expect(fatherName?.changes.length).toBeGreaterThan(1);
    expect(fatherName?.agreedValue).toBe('Rajeev Kumar');
  });

  it('applies corrections without mutating the seed', () => {
    const citizen = getCitizen('demo-priya');
    const snapshot = JSON.stringify(citizen);
    const corrections = buildCorrections(citizen, SCHEME);
    const after = buildVerdict(
      applyChanges(
        citizen,
        corrections.flatMap((item) => item.changes),
      ),
      SCHEME,
    );
    expect(JSON.stringify(citizen)).toBe(snapshot);
    expect(after.blocking.length).toBeLessThan(buildVerdict(citizen, SCHEME).blocking.length);
  });

  it('never offers a correction that unblocks nothing and changes nothing', () => {
    for (const correction of buildCorrections(getCitizen('demo-priya'), SCHEME)) {
      expect(correction.changes.length).toBeGreaterThan(0);
    }
  });
});

describe('linkage map', () => {
  it('grades every row and never invents a confirmed linkage', () => {
    const profile = getCitizenProfile('demo-priya');
    const map = buildLinkageMap(getCitizen('demo-priya'), profile.activity);
    expect(map.length).toBeGreaterThan(0);
    for (const row of map) {
      expect(['confirmed', 'probable', 'unknowable']).toContain(row.tier);
      expect(row.evidenceSource.instrument.trim()).not.toBe('');
      expect(row.probeContract.trim()).not.toBe('');
    }
    expect(map.some((row) => row.tier === 'unknowable')).toBe(true);
  });

  it('orders confirmed rows before unknowable ones', () => {
    const profile = getCitizenProfile('demo-priya');
    const map = buildLinkageMap(getCitizen('demo-priya'), profile.activity);
    const firstUnknowable = map.findIndex((row) => row.tier === 'unknowable');
    const lastConfirmed = map.map((row) => row.tier).lastIndexOf('confirmed');
    expect(lastConfirmed).toBeLessThan(firstUnknowable);
  });
});

describe('benefit routing', () => {
  it('reports the mapper account, not the account on the form', () => {
    const routing = buildRouting(getCitizen('demo-priya'));
    expect(routing?.agrees).toBe(false);
    expect(routing?.mapperAccount).toBe('DEMO-ACCT-2201');
    expect(routing?.landing).toContain('DEMO-ACCT-2201');
  });

  it('agrees when both records name the same account', () => {
    expect(buildRouting(getCitizen('demo-arun'))?.agrees).toBe(true);
  });
});

describe('published DBT reasons', () => {
  it('carries a real source and an action for every reason', () => {
    for (const reason of dbtReasons) {
      expect(reason.source.instrument).toContain('PFMS');
      expect(reason.source.url).toBeTruthy();
      expect(reason.officialRemedy.trim()).not.toBe('');
      expect(reason.whatYouDo.length).toBeGreaterThan(0);
    }
  });
});
