import type { CapabilityDisclosure } from '@/lib/types';

export const capabilities: CapabilityDisclosure[] = [
  {
    capability: 'Masked identity reveal',
    status: 'real',
    reason: 'React state keeps name, address and date of birth out of the DOM until the demo PIN is accepted.',
  },
  {
    capability: 'Conflict detection and cascade',
    status: 'real',
    reason: 'Pure TypeScript compares synthetic records twice and computes what a correction changes.',
  },
  {
    capability: 'Pre-submission rule check',
    status: 'real',
    reason:
      'The scheme rulebook runs in pure TypeScript against the synthetic records and states the verdict before submission. Applying a correction recomputes every rule.',
  },
  {
    capability: 'Linkage evidence tiers',
    status: 'real',
    reason:
      'Confirmed, probable and unknowable are computed from what the records and the activity log actually support. No row claims more than its evidence.',
  },
  {
    capability: 'Benefit-routing comparison',
    status: 'real',
    reason:
      'Derived from the seeded bank and application records. The one-Aadhaar-one-account mechanic it demonstrates is real; the accounts are not.',
  },
  {
    capability: 'DBT rejection reasons',
    status: 'real',
    reason:
      'The reasons and official remedies are quoted from the PFMS document that already publishes them. The plain-language rewriting is ours and is labelled as such.',
  },
  {
    capability: 'Department probe endpoints',
    status: 'mocked',
    reason:
      'Every probe contract on the linkage map is a specification, not an integration. Nothing calls them. They describe what a department would need to expose.',
  },
  {
    capability: 'Issue ordering and tracked reports',
    status: 'real',
    reason: 'Deterministic local code orders issues and creates an in-memory reference for the session.',
  },
  {
    capability: 'Share bundle',
    status: 'real',
    reason: 'The URL carries a self-contained, expiring synthetic payload. Nothing is saved.',
  },
  {
    capability: 'Login and PIN verification',
    status: 'mocked',
    reason: 'The phone, OTP and PIN are fixed demo values. There is no real authentication service.',
  },
  {
    capability: 'Verification activity',
    status: 'mocked',
    reason: 'The activity log contains fictional agencies and never contacts a government or telecom system.',
  },
  {
    capability: 'DigiLocker documents',
    status: 'mocked',
    reason: 'The list is local synthetic data. Outbound links open DigiLocker; Milaan never fetches a file.',
  },
  {
    capability: 'Government issue reporting',
    status: 'mocked',
    reason: 'References are tracked only in memory and are not sent to a department.',
  },
  {
    capability: 'AI explanation',
    status: 'mocked',
    reason: 'Optional wording only. Every result has a deterministic fallback when no API key is set.',
  },
  {
    capability: 'Legal citations',
    status: 'mocked',
    reason: 'Unverified sources remain TODO_CITATION rather than inventing a law, section or date.',
  },
];
