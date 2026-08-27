import type { Linkage, ReasonCode, Rule } from '@/lib/types';
import { validateCitationSources } from '@/lib/validation/citations';
import { consistencyRules } from './consistency';
import { documentRules } from './documents';
import { eligibilityRules } from './eligibility';

export const allRules: Rule[] = [
  ...consistencyRules,
  ...eligibilityRules,
  ...documentRules,
];

export function validateRuleSources(
  rules: Rule[],
  linkages: Linkage[] = [],
  reasonCodes: ReasonCode[] = [],
): void {
  validateCitationSources([
    ...rules.map((rule) => ({ id: rule.id, source: rule.source })),
    ...linkages.map((linkage) => ({
      id: `linkage.${linkage.domain}`,
      source: linkage.source,
    })),
    ...reasonCodes.map((reasonCode) => ({
      id: `reasonCode.${reasonCode.code}`,
      source: reasonCode.source,
    })),
  ]);
}

validateRuleSources(allRules);

export { consistencyRules, documentRules, eligibilityRules };
