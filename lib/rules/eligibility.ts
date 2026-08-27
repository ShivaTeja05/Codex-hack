import {
  POST_MATRIC_INCOME_THRESHOLD,
  POST_MATRIC_SCHOLARSHIP_ID,
} from '@/lib/seed/entitlements';
import type { Rule } from '@/lib/types';

function rupees(raw?: string): number {
  return Number(raw?.replace(/[^0-9]/g, '') ?? Number.NaN);
}

export const eligibilityRules: Rule[] = [
  {
    id: 'eligibility.income',
    kind: 'eligibility',
    appliesTo: [POST_MATRIC_SCHOLARSHIP_ID],
    description: 'Annual family income is at or below ₹2,50,000',
    source: { instrument: 'TODO_CITATION' },
    evaluate(citizen) {
      const raw = citizen.documents.find(
        (document) => document.source === 'incomeCertificate',
      )?.fields.annualIncome;
      const income = rupees(raw);
      const pass = Number.isFinite(income) && income <= POST_MATRIC_INCOME_THRESHOLD;
      return pass
        ? {
            status: 'pass',
            message: `This rule requires income at or below ₹2,50,000; the record says ${raw}.`,
          }
        : {
            status: 'block',
            message: `This rule requires income at or below ₹2,50,000; the record says ${raw ?? 'no value'}.`,
            fix: {
              action: 'Check that the income certificate has the correct figure',
              where: 'Income certificate issuer',
              unlocks: [POST_MATRIC_SCHOLARSHIP_ID],
            },
          };
    },
  },
  {
    id: 'eligibility.category',
    kind: 'eligibility',
    appliesTo: [POST_MATRIC_SCHOLARSHIP_ID],
    description: 'Category is included in this scholarship demo',
    source: { instrument: 'TODO_CITATION' },
    evaluate(citizen) {
      const category = citizen.documents.find(
        (document) => document.source === 'casteCertificate',
      )?.fields.category;
      const pass = category === 'SC';
      return {
        status: pass ? 'pass' : 'block',
        message: `This rule requires the SC category for this demo; the record says ${category ?? 'no value'}.`,
      };
    },
  },
];
