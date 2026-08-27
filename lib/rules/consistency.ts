import { normaliseField } from '@/lib/engine/normalise';
import { POST_MATRIC_SCHOLARSHIP_ID } from '@/lib/seed/entitlements';
import type { Citizen, FieldKey, Rule } from '@/lib/types';

function consistencyRule(
  id: string,
  field: FieldKey,
  description: string,
): Rule {
  return {
    id,
    kind: 'consistency',
    appliesTo: [POST_MATRIC_SCHOLARSHIP_ID],
    description,
    source: { instrument: 'P0 prototype document-consistency policy' },
    evaluate(citizen: Citizen) {
      const values = citizen.documents.flatMap((document) => {
        const value = document.fields[field];
        return value ? [normaliseField(field, value)] : [];
      });
      const matches = new Set(values).size <= 1;
      return matches
        ? { status: 'pass', message: `The ${description.toLowerCase()} match.` }
        : {
            status: 'block',
            message: `This rule requires ${description.toLowerCase()} to match; the records show different values.`,
          };
    },
  };
}

export const consistencyRules: Rule[] = [
  consistencyRule(
    'consistency.fatherName',
    'fatherName',
    "Father's name across identity and income records",
  ),
  consistencyRule(
    'consistency.name',
    'name',
    'Applicant name across identity, marksheet and bank records',
  ),
  consistencyRule(
    'consistency.dob',
    'dob',
    'Date of birth across identity and marksheet records',
  ),
  consistencyRule(
    'consistency.income',
    'annualIncome',
    'Annual income across the form and income certificate',
  ),
];
