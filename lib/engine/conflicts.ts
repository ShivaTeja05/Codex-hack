import { getEntitlement } from '@/lib/seed/entitlements';
import type { Citizen, Conflict, FieldKey, FixHint } from '@/lib/types';
import { normaliseField } from './normalise';

const fields: FieldKey[] = [
  'name',
  'fatherName',
  'dob',
  'annualIncome',
  'category',
  'bankAccount',
];

const consistencyRuleForField: Partial<Record<FieldKey, string>> = {
  name: 'consistency.name',
  fatherName: 'consistency.fatherName',
  dob: 'consistency.dob',
  annualIncome: 'consistency.income',
};

const fixForField: Record<FieldKey, Omit<FixHint, 'unlocks'>> = {
  name: {
    action: 'Make the applicant name match on every required record',
    where: 'Ask the issuer of the incorrect record for a correction',
  },
  fatherName: {
    action: "Correct the father's name on the income certificate",
    where: 'MeeSeva → Revenue → Certificate Correction',
  },
  dob: {
    action: 'Make the date of birth match on every required record',
    where: 'Ask the issuer of the incorrect record for a correction',
  },
  annualIncome: {
    action: 'Make the income figure match on the form and certificate',
    where: 'Correct the scholarship form or replace the certificate',
  },
  category: {
    action: 'Make the category entry match the supporting certificate',
    where: 'Correct the scholarship form',
  },
  bankAccount: {
    action: 'Update the scholarship form with the current bank account',
    where: 'Scholarship form → Bank details',
  },
};

export function buildConflicts(
  citizen: Citizen,
  entitlementId: string,
): Conflict[] {
  const entitlement = getEntitlement(entitlementId);

  return fields.flatMap((field) => {
    const values = citizen.documents.flatMap((document) => {
      const value = document.fields[field];
      return value ? [{ source: document.source, value }] : [];
    });
    const distinct = new Set(
      values.map(({ value }) => normaliseField(field, value)),
    );

    if (values.length < 2 || distinct.size < 2) return [];

    const ruleId = consistencyRuleForField[field];
    const isBlocking = Boolean(ruleId && entitlement.ruleIds.includes(ruleId));
    return [
      {
        id: `conflict.${field}`,
        field,
        values,
        severity: isBlocking ? 'blocking' : 'warning',
        blocks: isBlocking ? [entitlementId] : [],
        fix: {
          ...fixForField[field],
          unlocks: isBlocking ? [entitlementId] : [],
        },
      },
    ];
  });
}
