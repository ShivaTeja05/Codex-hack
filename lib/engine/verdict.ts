import { getEntitlement } from '@/lib/seed/entitlements';
import { allRules } from '@/lib/rules';
import { fieldLabels, sourceLabels } from '@/lib/presentation';
import type {
  Citation,
  Citizen,
  FieldKey,
  ProposedChange,
  RecordSource,
  RuleResult,
} from '@/lib/types';
import { normaliseField } from './normalise';
import { evaluateRules } from './rules';

const CHECKED_FIELDS: FieldKey[] = [
  'name',
  'fatherName',
  'dob',
  'annualIncome',
  'category',
  'bankAccount',
];

/** A rule result carrying the citation and description of the rule it came from. */
export interface VerdictRule extends RuleResult {
  ruleId: string;
  description: string;
  kind: 'consistency' | 'eligibility' | 'document';
  source: Citation;
}

/**
 * One citizen-facing correction: set `field` to the issuer-signed value on every
 * self-declared record that currently disagrees.
 */
export interface Correction {
  id: string;
  field: FieldKey;
  fieldLabel: string;
  /** The value every record should carry. */
  agreedValue: string;
  /** Where that value comes from — an issuer-signed record. */
  authorityLabel: string;
  authoritySource: RecordSource;
  /** The records this correction rewrites. */
  changes: ProposedChange[];
  touchedLabels: string[];
  /** What each disagreeing record says today. */
  disagreements: { source: RecordSource; label: string; value: string }[];
  clearsRuleIds: string[];
  clearsBlocking: number;
  where: string;
  /** Plain-language name for what the records disagree about. */
  disagreementNoun: string;
  /** Real consequence of a correction that unblocks nothing. */
  sideEffect?: string;
}

export interface Verdict {
  entitlementId: string;
  entitlementName: string;
  blocking: VerdictRule[];
  warnings: VerdictRule[];
  passing: VerdictRule[];
  /** Blocking rules no correction in this prototype can clear. */
  unfixable: VerdictRule[];
}

const ruleIndex = new Map(allRules.map((rule) => [rule.id, rule]));

const disagreementNouns: Record<FieldKey, string> = {
  name: 'which spelling is correct',
  fatherName: 'which spelling is correct',
  dob: 'which date is correct',
  bankAccount: 'which account is correct',
  annualIncome: 'which figure is correct',
  category: 'which category is correct',
};

/** What a correction changes when it clears no blocking rule. */
const sideEffects: Partial<Record<FieldKey, string>> = {
  bankAccount: 'where money lands',
};

const correctionWhere: Partial<Record<FieldKey, string>> = {
  name: 'Scholarship form → Applicant details',
  fatherName: 'Issuing office that printed the wrong record',
  bankAccount: 'Scholarship form → Bank details',
  dob: 'Issuing office that printed the wrong record',
};

/** Apply a batch of proposed changes to a citizen. Pure; never mutates input. */
export function applyChanges(citizen: Citizen, changes: ProposedChange[]): Citizen {
  if (changes.length === 0) return citizen;
  return {
    ...citizen,
    documents: citizen.documents.map((document) => {
      const forThisDocument = changes.filter((change) => change.source === document.source);
      if (forThisDocument.length === 0) return document;
      return {
        ...document,
        fields: forThisDocument.reduce(
          (fields, change) => ({ ...fields, [change.field]: change.newValue }),
          document.fields,
        ),
      };
    }),
  };
}

/**
 * The value an issuer has signed for this field.
 * Returns null when no issuer carries the field, or when two issuers disagree —
 * in that case the citizen cannot self-correct and must go back to an issuer.
 */
function issuerValue(
  citizen: Citizen,
  field: FieldKey,
): { value: string; source: RecordSource } | null {
  const issued = citizen.documents.filter(
    (document) => document.provenance === 'issued' && document.fields[field],
  );
  if (issued.length === 0) return null;
  const distinct = new Set(
    issued.map((document) => normaliseField(field, document.fields[field] as string)),
  );
  if (distinct.size !== 1) return null;
  return { value: issued[0].fields[field] as string, source: issued[0].source };
}

/**
 * Rule results only. `buildCorrections` uses this rather than `buildVerdict`,
 * because working out which blocks are unfixable requires the corrections.
 */
function coreVerdict(citizen: Citizen, entitlementId: string): Omit<Verdict, 'unfixable'> {
  const entitlement = getEntitlement(entitlementId);
  const results = evaluateRules(citizen, entitlementId).map<VerdictRule>((result) => {
    const rule = ruleIndex.get(result.ruleId as string);
    return {
      ...result,
      ruleId: result.ruleId as string,
      description: rule?.description ?? result.ruleId ?? 'Unnamed rule',
      kind: rule?.kind ?? 'consistency',
      source: rule?.source ?? { instrument: 'TODO_CITATION' },
    };
  });

  return {
    entitlementId,
    entitlementName: entitlement.name,
    blocking: results.filter((result) => result.status === 'block'),
    warnings: results.filter((result) => result.status === 'warn'),
    passing: results.filter((result) => result.status === 'pass'),
  };
}

export function buildVerdict(citizen: Citizen, entitlementId: string): Verdict {
  const core = coreVerdict(citizen, entitlementId);
  const clearable = new Set(
    buildCorrections(citizen, entitlementId).flatMap((correction) => correction.clearsRuleIds),
  );
  return {
    ...core,
    unfixable: core.blocking.filter((result) => !clearable.has(result.ruleId)),
  };
}

/**
 * Every correction available to this citizen, ranked by how many blocking rules
 * it clears. Ordering is deterministic: blocking count, then records touched,
 * then field order.
 */
export function buildCorrections(citizen: Citizen, entitlementId: string): Correction[] {
  const before = coreVerdict(citizen, entitlementId);
  const blockingBefore = new Set(before.blocking.map((rule) => rule.ruleId));

  return CHECKED_FIELDS.flatMap((field) => {
    const authority = issuerValue(citizen, field);
    if (!authority) return [];

    const target = normaliseField(field, authority.value);
    const outliers = citizen.documents.filter(
      (document) =>
        document.provenance === 'uploaded' &&
        document.fields[field] !== undefined &&
        normaliseField(field, document.fields[field] as string) !== target,
    );
    if (outliers.length === 0) return [];

    const changes: ProposedChange[] = outliers.map((document) => ({
      source: document.source,
      field,
      newValue: authority.value,
    }));

    const after = coreVerdict(applyChanges(citizen, changes), entitlementId);
    const stillBlocking = new Set(after.blocking.map((rule) => rule.ruleId));
    const clearsRuleIds = Array.from(blockingBefore).filter((ruleId) => !stillBlocking.has(ruleId));

    return [
      {
        id: `correction.${field}`,
        field,
        fieldLabel: fieldLabels[field],
        agreedValue: authority.value,
        authorityLabel: sourceLabels[authority.source],
        authoritySource: authority.source,
        changes,
        touchedLabels: outliers.map((document) => sourceLabels[document.source]),
        disagreements: outliers.map((document) => ({
          source: document.source,
          label: sourceLabels[document.source],
          value: document.fields[field] as string,
        })),
        clearsRuleIds,
        clearsBlocking: clearsRuleIds.length,
        where: correctionWhere[field] ?? 'The record-owning authority',
        disagreementNoun: disagreementNouns[field],
        sideEffect: sideEffects[field],
      },
    ];
  }).sort(
    (left, right) =>
      right.clearsBlocking - left.clearsBlocking ||
      right.changes.length - left.changes.length ||
      CHECKED_FIELDS.indexOf(left.field) - CHECKED_FIELDS.indexOf(right.field),
  );
}
