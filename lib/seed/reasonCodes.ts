import type { Citation } from '@/lib/types';

/**
 * Reasons a DBT payment is returned, taken from the PFMS document that already
 * publishes them. The plain meaning and the "what you actually do" line are
 * this prototype's rewriting; the reason and the official remedy are quoted.
 */
export interface DbtReason {
  id: string;
  basis: 'account' | 'aadhaar';
  /** As returned, quoted from the PFMS document. */
  reason: string;
  /** What it means for the person waiting for money. */
  plainMeaning: string;
  /** The remedy as printed in the PFMS document. */
  officialRemedy: string;
  /** Where the citizen goes, in order. */
  whatYouDo: string[];
  source: Citation;
}

export const PFMS_SOURCE: Citation = {
  instrument: 'PFMS — DBT Validation/Payment Error/Rejection and action thereon',
  notifiedOn: '11 March 2024',
  url: 'https://pfms.nic.in/sitePages/doc/PFMS_Validation_Payment_Rejection_Remedies.pdf',
};

export const dbtReasons: DbtReason[] = [
  {
    id: 'aadhaar-not-seeded',
    basis: 'aadhaar',
    reason: 'Aadhaar Number is not seeded in NPCI',
    plainMeaning:
      'No bank has told NPCI which account should receive money for your Aadhaar. The scheme approved you; there is nowhere to send it.',
    officialRemedy:
      'Beneficiary must contact their bank branch for Aadhaar seeding with their bank account and ask the bank to update the same on NPCI mapper.',
    whatYouDo: [
      'Go to the branch of the account you want the money in — not any branch.',
      'Ask for "Aadhaar seeding for DBT", and say NPCI mapper explicitly.',
      'Ask them to confirm it is the DBT-enabled account, not only KYC linking. These are different things.',
      'Allow about 48 hours, then check again before the scheme retries.',
    ],
    source: PFMS_SOURCE,
  },
  {
    id: 'uid-disabled-closed',
    basis: 'aadhaar',
    reason: 'UID is Disable for DBT and account is closed',
    plainMeaning:
      'The account your Aadhaar points to has been closed, and DBT is switched off for your Aadhaar. Two problems at once.',
    officialRemedy:
      'Beneficiary must contact their bank branch for Aadhaar seeding with their bank account and ask the bank to update the same on NPCI mapper. Further, beneficiary must provide valid bank account to the scheme owner Department.',
    whatYouDo: [
      'Open or nominate a working account and get Aadhaar seeded there for DBT.',
      'Separately, update the account on the scheme application. Seeding alone does not correct the form.',
    ],
    source: PFMS_SOURCE,
  },
  {
    id: 'account-closed',
    basis: 'account',
    reason: 'Rejected by Bank, Account status is closed',
    plainMeaning:
      'The account named on your application no longer exists. The payment was returned to the department.',
    officialRemedy:
      'Beneficiary must provide valid bank account to the scheme owner Department.',
    whatYouDo: [
      'Give the department a working account number — through the scheme portal, not the bank.',
      'Check that the same account is the one seeded for DBT, or the next payment fails the other way.',
    ],
    source: PFMS_SOURCE,
  },
  {
    id: 'blocked-account',
    basis: 'account',
    reason: 'Blocked Account',
    plainMeaning:
      'The bank has placed a hold on the account. Money cannot be credited until the hold is lifted.',
    officialRemedy:
      'Beneficiary must provide valid bank account to the scheme owner Department.',
    whatYouDo: [
      'Ask the branch why the account is blocked and what it needs — usually pending KYC.',
      'If it cannot be unblocked quickly, give the department a different working account.',
    ],
    source: PFMS_SOURCE,
  },
  {
    id: 'validation-pending-6m',
    basis: 'account',
    reason: 'Invalid Account, Validation Pending Since Last 6 Month from Bank',
    plainMeaning:
      'Your bank has not completed KYC on this account for six months, so it will not accept credits.',
    officialRemedy: 'Beneficiary must contact their bank branch for KYC update.',
    whatYouDo: [
      'Visit the branch with identity proof and ask them to complete the pending KYC update.',
      'This is the bank’s step, not the department’s. The scheme cannot fix it for you.',
    ],
    source: PFMS_SOURCE,
  },
  {
    id: 'ifsc-invalid',
    basis: 'account',
    reason: 'Invalid IFSC Code',
    plainMeaning:
      'The branch code on your application is wrong or belongs to a branch that has merged.',
    officialRemedy: 'Beneficiary must provide valid IFSC to the scheme owner Department.',
    whatYouDo: [
      'Take the IFSC from a current passbook or the bank’s own site, not from an old form.',
      'Correct it on the scheme application.',
    ],
    source: PFMS_SOURCE,
  },
  {
    id: 'bank-merged',
    basis: 'account',
    reason: 'Bank currently inactive & merged with another bank',
    plainMeaning:
      'Your bank merged into another. The old account and branch code stopped working, even though nothing on your side changed.',
    officialRemedy:
      'Beneficiary must provide valid bank account to the scheme owner Department.',
    whatYouDo: [
      'Get the new account number and IFSC from the bank that absorbed yours.',
      'Update the scheme application, and re-seed for DBT if the account number changed.',
    ],
    source: PFMS_SOURCE,
  },
];
