import { describe, expect, it } from 'vitest';
import { computeInsights, interpret } from '@/lib/trail/insights';
import { checkConsistency } from '@/lib/trail/consistency';
import { schemes, syntheticApplications, applications, documents } from '@/lib/trail/seed';

const now = Date.now();

describe('insights are computed from the timeline, not stored', () => {
  const all = [...applications, ...syntheticApplications];
  const insights = computeInsights(schemes, all, now);

  it('aggregates every scheme and every step', () => {
    expect(insights).toHaveLength(schemes.length);
    const postMatric = insights.find((s) => s.schemeId === 'ka-post-matric')!;
    expect(postMatric.steps).toHaveLength(7);
    expect(postMatric.steps.every((step) => step.n > 0)).toBe(true);
  });

  it('flags the marksheet step as queue-dominated with mostly waiting time', () => {
    const postMatric = insights.find((s) => s.schemeId === 'ka-post-matric')!;
    const marksheet = postMatric.steps.find((s) => s.plainName.includes('marksheet'))!;
    expect(marksheet.queueDominated).toBe(true);
    expect(marksheet.medianWaitDays).toBeGreaterThan(marksheet.medianHandleDays);
    expect(marksheet.queueShare).toBeGreaterThan(0.6);
  });

  it('reports the slowest step as the bottleneck', () => {
    const postMatric = insights.find((s) => s.schemeId === 'ka-post-matric')!;
    const maxTotal = Math.max(...postMatric.steps.map((s) => s.medianTotalDays));
    expect(postMatric.bottleneck.medianTotalDays).toBe(maxTotal);
  });

  it('interprets a queue bottleneck as a staffing decision', () => {
    const postMatric = insights.find((s) => s.schemeId === 'ka-post-matric')!;
    const marksheet = postMatric.steps.find((s) => s.plainName.includes('marksheet'))!;
    expect(interpret(marksheet)).toMatch(/queue time|staffing/i);
  });
});

describe('consistency checks state the consequence, not just the mismatch', () => {
  it('catches the seeded PIN mismatch between the ID and ration card', () => {
    const findings = checkConsistency(documents);
    const pin = findings.find((f) => f.title.includes('PIN'));
    expect(pin).toBeDefined();
    expect(pin!.severity).toBe('WARNING');
    // The message must name where it fails, not just that it mismatched.
    expect(pin!.message).toMatch(/sent back|district/i);
  });

  it('does not invent problems when documents agree', () => {
    const clean = documents.filter((d) => d.id === 'doc-id' || d.id === 'doc-domicile');
    expect(checkConsistency(clean)).toHaveLength(0);
  });
});
