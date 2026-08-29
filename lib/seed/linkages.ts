import type { Citation, RecordSource } from '@/lib/types';

/**
 * A domain a citizen may be connected to.
 *
 * `probeContract` is the endpoint a department would implement for Milaan to
 * answer this honestly. It is written as a contract, not a wish: consent-bound,
 * yes/no, returning no data. Nothing calls it today — that is the point.
 */
export interface LinkageDomain {
  domain: string;
  label: string;
  /** What the citizen is actually asking when they look for this row. */
  question: string;
  obligation: 'mandatory' | 'conditional' | 'voluntary' | 'unknown';
  obligationDetail: string;
  source: Citation;
  /** Record sources that, if present, confirm this linkage directly. */
  confirmedBy: RecordSource[];
  /** Words in an authentication-history entry that suggest this domain. */
  suggestedBy: string[];
  probeContract: string;
}

const UIDAI_NO_REGISTRY: Citation = {
  instrument:
    'UIDAI — Aadhaar linkage is not tracked centrally; departments do not report linkages to UIDAI',
  url: 'https://uidai.gov.in/en/my-aadhaar/avail-aadhaar-services',
};

const PFMS_REJECTION: Citation = {
  instrument: 'PFMS — DBT Validation/Payment Error/Rejection and action thereon',
  notifiedOn: '11 March 2024',
  url: 'https://pfms.nic.in/sitePages/doc/PFMS_Validation_Payment_Rejection_Remedies.pdf',
};

const TAFCOP: Citation = {
  instrument:
    'Department of Telecommunications — TAFCOP on Sanchar Saathi lists connections issued against your identity',
  url: 'https://tafcop.sancharsaathi.gov.in',
};

const AUTH_HISTORY: Citation = {
  instrument:
    'UIDAI — Aadhaar Authentication History records who authenticated you (last 6 months, up to 50 records)',
  url: 'https://uidai.gov.in/en/305-faqs/aadhaar-online-services/aadhaar-authentication-history/10770-what-is-the-procedure-for-checking-aadhaar-authentication-history-on-uidai-websites.html',
};

export const linkageDomains: LinkageDomain[] = [
  {
    domain: 'schemeRegistration',
    label: 'Scheme registration',
    question: 'Which schemes am I currently registered with?',
    obligation: 'voluntary',
    obligationDetail:
      'You choose to apply. Registration is never automatic, and withdrawing an application is your right.',
    source: {
      instrument:
        'Prototype scheme-registration disclosure rule — derived from the application record you supplied',
    },
    confirmedBy: ['applicationForm'],
    suggestedBy: ['scholarship', 'portal'],
    probeContract:
      'GET /scheme/registrations — consent-bound. Returns the scheme name, application reference and current stage for applications filed under this identity. Returns no documents and no officer notes.',
  },
  {
    domain: 'bankDbt',
    label: 'Benefit routing (NPCI mapper)',
    question: 'Which account will scheme money actually land in?',
    obligation: 'conditional',
    obligationDetail:
      'Needed to receive money through Direct Benefit Transfer. Not needed to hold a bank account.',
    source: PFMS_REJECTION,
    confirmedBy: ['bank'],
    suggestedBy: ['bank'],
    probeContract:
      'GET /dbt/routing-status — consent-bound. Returns the bank name and seeding date of the account currently mapped to this Aadhaar, and nothing else. No account number, no balance, no history.',
  },
  {
    domain: 'phone',
    label: 'Mobile connections',
    question: 'How many SIMs were issued against my identity?',
    obligation: 'voluntary',
    obligationDetail:
      'Aadhaar is one accepted KYC document for a connection, not the only one. The Telecommunications Act 2023 caps connections at 9 (6 in Jammu & Kashmir, Assam and the North-East).',
    source: TAFCOP,
    confirmedBy: [],
    suggestedBy: ['telecom', 'operator'],
    probeContract:
      'TAFCOP already answers this for the citizen. Milaan should link out to it, not copy it. No new endpoint is required.',
  },
  {
    domain: 'pan',
    label: 'Tax record (PAN)',
    question: 'Is my PAN consistent with my identity record?',
    obligation: 'unknown',
    obligationDetail:
      'Linking obligations change by notification. This prototype does not assert a rule it has not verified.',
    source: { instrument: 'TODO_CITATION' },
    confirmedBy: ['pan'],
    suggestedBy: ['tax', 'income tax'],
    probeContract:
      'POST /pan/match — consent-bound. Accepts a name and date of birth, returns match: true | false. Never returns the stored value.',
  },
  {
    domain: 'uan',
    label: 'Provident fund (UAN)',
    question: 'Will my PF claim be rejected for a demographic mismatch?',
    obligation: 'conditional',
    obligationDetail:
      'Relevant only if you have been in formal employment. EPFO matches demographics exactly, not approximately.',
    source: { instrument: 'TODO_CITATION' },
    confirmedBy: [],
    suggestedBy: ['employer', 'provident', 'epfo'],
    probeContract:
      'POST /uan/demographic-match — consent-bound. Accepts name, date of birth and gender, returns per-field match: true | false, plus a count of UANs held. Never returns the stored values.',
  },
  {
    domain: 'rationCard',
    label: 'Ration card / PDS',
    question: 'Am I attached to a household entitlement?',
    obligation: 'conditional',
    obligationDetail:
      'Applies only where a household has enrolled. Membership is a state subject and varies.',
    source: { instrument: 'TODO_CITATION' },
    confirmedBy: [],
    suggestedBy: ['civil supplies', 'ration'],
    probeContract:
      'GET /pds/membership — consent-bound. Returns whether this identity appears on a household card and the issuing state. Returns no household member list.',
  },
  {
    domain: 'land',
    label: 'Land record',
    question: 'Is a land record attached to my name?',
    obligation: 'unknown',
    obligationDetail:
      'Land records are maintained state by state, in different systems, with no common identifier.',
    source: UIDAI_NO_REGISTRY,
    confirmedBy: [],
    suggestedBy: ['revenue', 'land'],
    probeContract:
      'No national contract is possible today. Each state revenue department would need to expose a consent-bound match endpoint separately. This row exists to name the gap, not to hide it.',
  },
];

export { UIDAI_NO_REGISTRY, AUTH_HISTORY, PFMS_REJECTION, TAFCOP };
