import { describe, expect, it } from 'vitest';
import { allRules, validateRuleSources } from '@/lib/rules';

describe('rulebook', () => {
  it('gives every rule a non-empty source instrument', () => {
    expect(() => validateRuleSources(allRules)).not.toThrow();
    expect(allRules.every((rule) => rule.source.instrument.trim().length > 0)).toBe(true);
  });
});
