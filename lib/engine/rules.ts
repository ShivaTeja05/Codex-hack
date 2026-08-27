import { allRules } from '@/lib/rules';
import { getEntitlement } from '@/lib/seed/entitlements';
import type { Citizen, RuleResult } from '@/lib/types';

export function evaluateRules(
  citizen: Citizen,
  entitlementId: string,
): RuleResult[] {
  const entitlement = getEntitlement(entitlementId);
  return allRules
    .filter(
      (rule) =>
        rule.appliesTo.includes(entitlementId) &&
        entitlement.ruleIds.includes(rule.id),
    )
    .map((rule) => ({ ...rule.evaluate(citizen), ruleId: rule.id }));
}
