import { getEntitlement, POST_MATRIC_SCHOLARSHIP_ID } from '@/lib/seed/entitlements';
import type { Rule } from '@/lib/types';

export const documentRules: Rule[] = [
  {
    id: 'document.required',
    kind: 'document',
    appliesTo: [POST_MATRIC_SCHOLARSHIP_ID],
    description: 'All required supporting records are present',
    source: { instrument: 'TODO_CITATION' },
    evaluate(citizen) {
      const entitlement = getEntitlement(POST_MATRIC_SCHOLARSHIP_ID);
      const present = new Set(citizen.documents.map((document) => document.source));
      const missing = entitlement.requiredDocuments.filter((item) => !present.has(item));
      return missing.length === 0
        ? { status: 'pass', message: 'Every record required by this demo is present.' }
        : {
            status: 'block',
            message: `This rule requires all supporting records; missing: ${missing.join(', ')}.`,
          };
    },
  },
  {
    id: 'document.validity',
    kind: 'document',
    appliesTo: [POST_MATRIC_SCHOLARSHIP_ID],
    description: 'Required certificates are still valid',
    source: { instrument: 'TODO_CITATION' },
    evaluate(citizen) {
      const expired = citizen.documents.filter(
        (document) =>
          document.validUntil && new Date(document.validUntil).getTime() < Date.now(),
      );
      return expired.length === 0
        ? { status: 'pass', message: 'The dated certificates are still valid.' }
        : {
            status: 'warn',
            message: `This rule requires current certificates; ${expired.map((item) => item.label).join(', ')} has expired.`,
          };
    },
  },
];
