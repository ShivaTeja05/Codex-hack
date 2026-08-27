import { cascade } from '@/lib/engine/cascade';
import { sourceLabels } from '@/lib/presentation';
import type { Citizen, RecordOverview, RecordStatus } from '@/lib/types';

const statusRank: Record<RecordStatus, number> = {
  blocked: 0,
  wrong: 1,
  expired: 2,
  clear: 3,
  unknown: 4,
  optional: 5,
};

export function sortRecords(records: RecordOverview[]): RecordOverview[] {
  return [...records].sort(
    (left, right) => statusRank[left.status] - statusRank[right.status],
  );
}

export function cascadeSentence(
  citizen: Citizen,
  record: RecordOverview,
  entitlementId: string,
): string | null {
  if (!record.proposedChange) return null;
  const result = cascade(citizen, record.proposedChange, entitlementId);
  const resolved = result.resolvedConflicts.length;
  const introduced = result.newConflicts.length;
  const propagation = result.propagateTo.length
    ? result.propagateTo.map((source) => sourceLabels[source]).join(', ')
    : 'no other records';
  return `This correction resolves ${resolved} record difference${resolved === 1 ? '' : 's'} and introduces ${introduced}. Check the same field on: ${propagation}.`;
}
