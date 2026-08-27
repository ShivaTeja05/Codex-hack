import { buildConflicts } from '@/lib/engine/conflicts';
import type {
  CascadeResult,
  Citizen,
  ProposedChange,
  RecordSource,
} from '@/lib/types';

export function applyChange(citizen: Citizen, change: ProposedChange): Citizen {
  return {
    ...citizen,
    documents: citizen.documents.map((document) => ({
      ...document,
      fields: {
        ...document.fields,
        ...(document.source === change.source
          ? { [change.field]: change.newValue }
          : {}),
      },
    })),
  };
}

function recordsCarrying(citizen: Citizen, change: ProposedChange): RecordSource[] {
  return Array.from(
    new Set(
      citizen.documents
        .filter((document) => document.fields[change.field] !== undefined)
        .map((document) => document.source),
    ),
  );
}

export function cascade(
  citizen: Citizen,
  change: ProposedChange,
  entitlementId: string,
): CascadeResult {
  const before = buildConflicts(citizen, entitlementId);
  const after = buildConflicts(applyChange(citizen, change), entitlementId);
  return {
    change,
    newConflicts: after.filter(
      (candidate) => !before.some((current) => current.id === candidate.id),
    ),
    resolvedConflicts: before.filter(
      (current) => !after.some((candidate) => candidate.id === current.id),
    ),
    propagateTo: recordsCarrying(citizen, change).filter(
      (source) => source !== change.source,
    ),
  };
}
