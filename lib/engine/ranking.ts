import type { Entitlement, Conflict, FixHint } from '@/lib/types';

export function rankFixes(
  conflicts: Conflict[],
  entitlements: Entitlement[],
): FixHint[] {
  const knownIds = new Set(entitlements.map((item) => item.id));
  return conflicts
    .map((conflict) => ({
      ...conflict.fix,
      unlocks: conflict.fix.unlocks.filter((id) => knownIds.has(id)),
    }))
    .sort((a, b) => b.unlocks.length - a.unlocks.length);
}
