import { afterEach, describe, expect, it } from 'vitest';
import { explain } from '@/lib/ai/explain';
import { buildBundle, decodeBundle, encodeBundle } from '@/lib/engine/bundle';
import { buildConflicts } from '@/lib/engine/conflicts';
import { resolveGoal } from '@/lib/engine/goal';
import { rankFixes } from '@/lib/engine/ranking';
import { evaluateRules } from '@/lib/engine/rules';
import { walletAdapter } from '@/lib/mock/walletAdapter';
import { entitlements } from '@/lib/seed/entitlements';

const originalKey = process.env.OPENAI_API_KEY;

afterEach(() => {
  if (originalKey) process.env.OPENAI_API_KEY = originalKey;
  else delete process.env.OPENAI_API_KEY;
});

describe('no-AI journey', () => {
  it('completes with the API key unset', async () => {
    delete process.env.OPENAI_API_KEY;
    const entitlementId = resolveGoal('I need help with college fees');
    const citizen = walletAdapter.connect('demo-priya');
    expect(citizen).not.toBeNull();

    const conflicts = buildConflicts(citizen!, entitlementId);
    const results = evaluateRules(citizen!, entitlementId);
    const fixes = rankFixes(conflicts, entitlements);
    const bundle = buildBundle(citizen!, entitlementId, conflicts);
    const payload = encodeBundle(bundle);

    expect(results.length).toBe(8);
    expect(fixes.length).toBeGreaterThan(0);
    expect(decodeBundle(payload)?.ref).toBe(bundle.ref);
    expect(await explain(results[0].message)).toBe(results[0].message);
  });
});
