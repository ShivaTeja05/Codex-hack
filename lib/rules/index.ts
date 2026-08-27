import type { Rule } from '@/lib/types';
import { consistencyRules } from './consistency';
import { documentRules } from './documents';
import { eligibilityRules } from './eligibility';

export const allRules: Rule[] = [
  ...consistencyRules,
  ...eligibilityRules,
  ...documentRules,
];

export function validateRuleSources(rules: Rule[]): void {
  const invalid = rules.filter((rule) => !rule.source.instrument.trim());
  if (invalid.length > 0) {
    throw new Error(
      `Rules missing source.instrument: ${invalid.map((rule) => rule.id).join(', ')}`,
    );
  }
}

validateRuleSources(allRules);

export { consistencyRules, documentRules, eligibilityRules };
