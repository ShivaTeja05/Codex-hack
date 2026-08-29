import type {
  Application,
  ApplicationStep,
  Citizen,
  DocEvent,
  Flag,
  Scheme,
  ShareCode,
  TrailDocument,
  WorkflowStep,
} from './types';

const DAY = 86_400_000;
const HOUR = 3_600_000;

/** Everything is seeded relative to load time so the demo never goes stale. */
const iso = (offsetMs: number) => new Date(Date.now() - offsetMs).toISOString();

export const citizen: Citizen = {
  id: 'citizen-1',
  name: 'Meena Sabannavar',
  mockLockerId: 'MOCK-LOCKER-0001',
  phoneMasked: '90XXXXXX01',
  dob: '2006-04-11',
};

export const documents: TrailDocument[] = [
  {
    id: 'doc-id',
    ownerId: citizen.id,
    docType: 'MOCK_ID',
    plainName: 'Your government ID (mock)',
    issuer: 'Mock Identity Authority',
    issuedOn: '2024-01-10',
    refMasked: 'MOCK-ID-•••• 4417',
    source: 'DIGILOCKER_MOCK',
    fields: {
      name: 'Meena Sabannavar',
      dob: '2006-04-11',
      address: '14 Station Road, Kalaburagi',
      pincode: '585101',
      phone: '90XXXXXX01',
      fatherName: 'Ravi Sabannavar',
    },
  },
  {
    id: 'doc-marksheet12',
    ownerId: citizen.id,
    docType: 'MARKSHEET_12',
    plainName: 'Your Class 12 marksheet',
    issuer: 'Mock Board of Secondary Education',
    issuedOn: '2024-05-20',
    refMasked: 'MOCK-BOARD-•••• 2210',
    source: 'DIGILOCKER_MOCK',
    fields: { name: 'MEENA SABANNAVAR', dob: '2006-04-11' },
  },
  {
    id: 'doc-income',
    ownerId: citizen.id,
    docType: 'INCOME_CERT',
    plainName: 'Your family income certificate',
    issuer: 'Mock Revenue Office',
    issuedOn: '2026-02-02',
    refMasked: 'MOCK-REV-•••• 7781',
    source: 'DIGILOCKER_MOCK',
    fields: { name: 'Meena Sabannavar', fatherName: 'Ravi Sabannavar' },
  },
  {
    id: 'doc-category',
    ownerId: citizen.id,
    docType: 'CATEGORY_CERT',
    plainName: 'Your category certificate',
    issuer: 'Mock Social Welfare Office',
    issuedOn: '2025-06-14',
    refMasked: 'MOCK-SW-•••• 3390',
    source: 'DIGILOCKER_MOCK',
    fields: { name: 'Meena Sabannavar' },
  },
  {
    id: 'doc-domicile',
    ownerId: citizen.id,
    docType: 'DOMICILE_CERT',
    plainName: 'Your domicile certificate',
    issuer: 'Mock Taluk Office',
    issuedOn: '2025-03-08',
    refMasked: 'MOCK-TAL-•••• 5512',
    source: 'DIGILOCKER_MOCK',
    fields: {
      name: 'Meena Sabannavar',
      address: '14 Station Road, Kalaburagi',
      pincode: '585101',
    },
  },
  {
    id: 'doc-ration',
    ownerId: citizen.id,
    docType: 'RATION_CARD',
    plainName: 'Your ration card',
    issuer: 'Mock Food & Civil Supplies',
    issuedOn: '2023-11-02',
    refMasked: 'MOCK-FCS-•••• 8804',
    // Seeded mismatch: pincode differs from the ID. This is deliberate.
    source: 'DIGILOCKER_MOCK',
    fields: {
      name: 'Meena Sabannavar',
      address: '14 Station Rd, Kalaburagi',
      pincode: '585102',
      phone: '90XXXXXX44',
    },
  },
  {
    id: 'doc-bank',
    ownerId: citizen.id,
    docType: 'BANK_PASSBOOK',
    plainName: 'Your bank passbook',
    issuer: 'Mock Bank',
    issuedOn: '2024-07-19',
    refMasked: 'MOCK-BNK-•••• 6120',
    source: 'DIGILOCKER_MOCK',
    fields: { name: 'M. Sabannavar' },
  },
];

function step(
  schemeId: string,
  order: number,
  plainName: string,
  officeName: string,
  officeId: string,
  slaDays: number,
  requiredDocTypes: WorkflowStep['requiredDocTypes'],
): WorkflowStep {
  return {
    id: `${schemeId}-s${order}`,
    schemeId,
    order,
    plainName,
    officeName,
    officeId,
    slaDays,
    requiredDocTypes,
  };
}

export const schemes: Scheme[] = [
  {
    id: 'ka-post-matric',
    name: 'Post-matric scholarship',
    department: 'Social Welfare',
    state: 'Karnataka',
    plainSummary:
      'Help with college fees for students whose family income is low.',
    steps: [
      step('ka-post-matric', 1, 'Application received', 'Scholarship Cell', 'off-cell', 1, []),
      step('ka-post-matric', 2, 'Checking your ID and bank details', 'Scholarship Cell', 'off-cell', 2, ['MOCK_ID', 'BANK_PASSBOOK']),
      step('ka-post-matric', 3, 'Confirming you live in this district', 'Taluk Office, Sedam', 'off-taluk', 3, ['DOMICILE_CERT', 'RATION_CARD']),
      step('ka-post-matric', 4, 'Checking your family income', 'Revenue Dept, Kalaburagi', 'off-revenue', 5, ['INCOME_CERT']),
      step('ka-post-matric', 5, 'Checking your category certificate', 'Social Welfare Dept', 'off-sw', 3, ['CATEGORY_CERT']),
      step('ka-post-matric', 6, 'Checking your Class 12 marksheet', 'District Education Office, Kalaburagi', 'off-edu', 3, ['MARKSHEET_12']),
      step('ka-post-matric', 7, 'Approving payment', 'Treasury', 'off-treasury', 5, []),
    ],
  },
  {
    // Proof the engine is portable: a different department is rows, not code.
    id: 'income-cert',
    name: 'Income certificate',
    department: 'Revenue',
    state: 'Karnataka',
    plainSummary: 'A certificate stating your family’s yearly income.',
    steps: [
      step('income-cert', 1, 'Application received', 'Taluk Office, Sedam', 'off-taluk', 1, []),
      step('income-cert', 2, 'Checking your ID', 'Taluk Office, Sedam', 'off-taluk', 2, ['MOCK_ID']),
      step('income-cert', 3, 'Village officer inspection', 'Village Accountant, Sedam', 'off-village', 7, ['RATION_CARD']),
      step('income-cert', 4, 'Signing the certificate', 'Revenue Dept, Kalaburagi', 'off-revenue', 3, []),
    ],
  },
];

export const PRIMARY_CODE = 'TRL-4K9-2XQ';
export const FLAGGED_CODE = 'TRL-7M2-8VB';

function instance(
  applicationId: string,
  workflowStepId: string,
  enteredAt?: number,
  firstOpenedAt?: number,
  completedAt?: number,
): ApplicationStep {
  return {
    id: `${applicationId}::${workflowStepId}`,
    applicationId,
    workflowStepId,
    enteredAt: enteredAt === undefined ? undefined : iso(enteredAt),
    firstOpenedAt: firstOpenedAt === undefined ? undefined : iso(firstOpenedAt),
    completedAt: completedAt === undefined ? undefined : iso(completedAt),
  };
}

/**
 * The demo opens in the interesting moment: five steps done, step 6 sitting
 * unopened for four days against a three-day SLA, step 7 not started.
 */
const APP_1 = 'app-1';
export const applications: Application[] = [
  {
    id: APP_1,
    citizenId: citizen.id,
    schemeId: 'ka-post-matric',
    shareCode: PRIMARY_CODE,
    submittedAt: iso(17 * DAY),
    steps: [
      instance(APP_1, 'ka-post-matric-s1', 17 * DAY, 17 * DAY, 16 * DAY),
      instance(APP_1, 'ka-post-matric-s2', 16 * DAY, 15 * DAY, 14 * DAY),
      instance(APP_1, 'ka-post-matric-s3', 14 * DAY, 11 * DAY, 10 * DAY),
      instance(APP_1, 'ka-post-matric-s4', 10 * DAY, 9 * DAY, 6 * DAY),
      instance(APP_1, 'ka-post-matric-s5', 6 * DAY, 5 * DAY, 4 * DAY),
      instance(APP_1, 'ka-post-matric-s6', 4 * DAY, undefined, undefined),
      instance(APP_1, 'ka-post-matric-s7'),
    ],
  },
  {
    id: 'app-2',
    citizenId: citizen.id,
    schemeId: 'income-cert',
    shareCode: FLAGGED_CODE,
    submittedAt: iso(9 * DAY),
    steps: [
      instance('app-2', 'income-cert-s1', 9 * DAY, 9 * DAY, 8 * DAY),
      instance('app-2', 'income-cert-s2', 8 * DAY, 7 * DAY, 6 * DAY),
      instance('app-2', 'income-cert-s3', 6 * DAY, 3 * DAY, undefined),
      instance('app-2', 'income-cert-s4'),
    ],
  },
];

export const shareCodes: ShareCode[] = [
  {
    code: PRIMARY_CODE,
    citizenId: citizen.id,
    applicationId: APP_1,
    purpose: 'Post-matric scholarship application',
    docIds: [
      'doc-id',
      'doc-bank',
      'doc-domicile',
      'doc-ration',
      'doc-income',
      'doc-category',
      'doc-marksheet12',
    ],
    createdAt: iso(17 * DAY),
    expiresAt: new Date(Date.now() + 73 * DAY).toISOString(),
    maxOpens: 50,
  },
  {
    code: FLAGGED_CODE,
    citizenId: citizen.id,
    applicationId: 'app-2',
    purpose: 'Income certificate application',
    docIds: ['doc-id', 'doc-ration'],
    createdAt: iso(9 * DAY),
    expiresAt: new Date(Date.now() + 81 * DAY).toISOString(),
    maxOpens: 50,
  },
];

let eventSeq = 0;
function event(
  eventType: DocEvent['eventType'],
  offsetMs: number,
  extra: Partial<DocEvent> = {},
): DocEvent {
  eventSeq += 1;
  return {
    id: `seed-ev-${eventSeq}`,
    ts: iso(offsetMs),
    eventType,
    actorType: 'OFFICER',
    actorLabel: 'Scholarship Cell',
    ...extra,
  };
}

const s = (n: number) => `${APP_1}::ka-post-matric-s${n}`;

export const events: DocEvent[] = [
  event('SHARE_CODE_CREATED', 17 * DAY, {
    actorType: 'CITIZEN',
    actorLabel: 'Meena Sabannavar',
    shareCode: PRIMARY_CODE,
    applicationId: APP_1,
  }),
  event('STEP_ENTERED', 17 * DAY, { actorType: 'SYSTEM', actorLabel: 'System', applicationId: APP_1, stepId: s(1) }),
  event('DOC_OPENED', 15 * DAY, { documentId: 'doc-id', applicationId: APP_1, stepId: s(2), actorLabel: 'Scholarship Cell', actorOfficeId: 'off-cell' }),
  event('DOC_VERIFIED', 14 * DAY + 4 * HOUR, { documentId: 'doc-id', applicationId: APP_1, stepId: s(2), actorLabel: 'Scholarship Cell', actorOfficeId: 'off-cell' }),
  event('DOC_OPENED', 15 * DAY, { documentId: 'doc-bank', applicationId: APP_1, stepId: s(2), actorLabel: 'Scholarship Cell', actorOfficeId: 'off-cell' }),
  event('DOC_VERIFIED', 14 * DAY + 3 * HOUR, { documentId: 'doc-bank', applicationId: APP_1, stepId: s(2), actorLabel: 'Scholarship Cell', actorOfficeId: 'off-cell' }),
  event('DOC_OPENED', 11 * DAY, { documentId: 'doc-domicile', applicationId: APP_1, stepId: s(3), actorLabel: 'Taluk Office, Sedam', actorOfficeId: 'off-taluk' }),
  event('DOC_VERIFIED', 10 * DAY + 5 * HOUR, { documentId: 'doc-domicile', applicationId: APP_1, stepId: s(3), actorLabel: 'Taluk Office, Sedam', actorOfficeId: 'off-taluk' }),
  event('DOC_OPENED', 11 * DAY, { documentId: 'doc-ration', applicationId: APP_1, stepId: s(3), actorLabel: 'Taluk Office, Sedam', actorOfficeId: 'off-taluk' }),
  event('DOC_VERIFIED', 10 * DAY + 4 * HOUR, { documentId: 'doc-ration', applicationId: APP_1, stepId: s(3), actorLabel: 'Taluk Office, Sedam', actorOfficeId: 'off-taluk' }),
  event('DOC_OPENED', 9 * DAY, { documentId: 'doc-income', applicationId: APP_1, stepId: s(4), actorLabel: 'Revenue Dept, Kalaburagi', actorOfficeId: 'off-revenue' }),
  event('DOC_VERIFIED', 6 * DAY + 2 * HOUR, { documentId: 'doc-income', applicationId: APP_1, stepId: s(4), actorLabel: 'Revenue Dept, Kalaburagi', actorOfficeId: 'off-revenue' }),
  event('DOC_OPENED', 5 * DAY, { documentId: 'doc-category', applicationId: APP_1, stepId: s(5), actorLabel: 'Social Welfare Dept', actorOfficeId: 'off-sw' }),
  event('DOC_VERIFIED', 4 * DAY + 6 * HOUR, { documentId: 'doc-category', applicationId: APP_1, stepId: s(5), actorLabel: 'Social Welfare Dept', actorOfficeId: 'off-sw' }),
  event('STEP_ENTERED', 4 * DAY, { actorType: 'SYSTEM', actorLabel: 'System', applicationId: APP_1, stepId: s(6) }),
  // An office outside this application's workflow opened the ID — allowed, but
  // surfaced to the citizen as unusual. No stepId, so it does not touch status.
  event('DOC_REOPENED', 2 * DAY + 3 * HOUR, {
    documentId: 'doc-id',
    applicationId: APP_1,
    shareCode: PRIMARY_CODE,
    actorType: 'OFFICER',
    actorLabel: 'Data Analytics Cell (not in this application)',
    actorOfficeId: 'off-analytics',
    meta: { unusual: 'Opened by an office that is not part of this application.' },
  }),
  // A blocked attempt: a code no longer covering this document was used.
  event('ACCESS_DENIED_RATE_LIMIT', 8 * DAY + 5 * HOUR, {
    documentId: 'doc-id',
    applicationId: APP_1,
    shareCode: PRIMARY_CODE,
    actorType: 'UNKNOWN',
    actorLabel: 'Unlisted requester',
    meta: { deniedReason: 'This document was not shared under this code. Blocked before anything was shown.' },
  }),
  // Second application: the flag journey, already in progress.
  event('DOC_OPENED', 3 * DAY, { documentId: 'doc-ration', applicationId: 'app-2', stepId: 'app-2::income-cert-s3', actorLabel: 'Village Accountant, Sedam', actorOfficeId: 'off-village' }),
  event('DOC_FLAGGED', 3 * DAY - HOUR, {
    documentId: 'doc-ration',
    applicationId: 'app-2',
    stepId: 'app-2::income-cert-s3',
    actorLabel: 'Village Accountant, Sedam',
    actorOfficeId: 'off-village',
    meta: { reason: 'MISMATCH', comment: 'PIN code on the ration card does not match the ID.' },
  }),
];

export const flags: Flag[] = [
  {
    id: 'flag-1',
    documentId: 'doc-ration',
    applicationId: 'app-2',
    stepId: 'app-2::income-cert-s3',
    officerLabel: 'Village Accountant, Sedam',
    reason: 'MISMATCH',
    comment:
      'PIN code on the ration card is 585102. Your ID says 585101. Please replace the ration card or get the PIN corrected.',
    createdAt: iso(3 * DAY - HOUR),
  },
];

/* -------------------------------------------------------------------------- */
/* Synthetic applications for /insights                                        */
/*                                                                             */
/* CONTEXT.md §13 asks for ~20 synthetic applications so the department        */
/* dashboard shows real distributions and medians, not one data point. These   */
/* are generated deterministically (a seeded RNG) so the demo is stable, and   */
/* every one is fully completed so its per-step waiting/handling split is       */
/* derived from timestamps by the same functions the citizen page uses. No     */
/* aggregate is hardcoded — /insights computes medians from these rows.        */
/* -------------------------------------------------------------------------- */

/** Small deterministic PRNG so seeded timings never drift between loads. */
function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Per-step timing profile in days: how long a file typically waits in the
 * queue before anyone opens it, and how long an officer then handles it.
 * The bottleneck steps (marksheet verification; village-officer inspection)
 * are deliberately queue-dominated — that is the story the dashboard tells.
 */
const TIMING: Record<string, { wait: number; handle: number }[]> = {
  'ka-post-matric': [
    { wait: 0.2, handle: 0.3 }, // 1 received
    { wait: 0.9, handle: 1.0 }, // 2 id + bank
    { wait: 2.6, handle: 1.1 }, // 3 domicile
    { wait: 1.3, handle: 3.1 }, // 4 income
    { wait: 1.1, handle: 1.2 }, // 5 category
    { wait: 6.7, handle: 1.2 }, // 6 marksheet  ← queue-dominated bottleneck
    { wait: 1.6, handle: 1.6 }, // 7 payment
  ],
  'income-cert': [
    { wait: 0.2, handle: 0.3 }, // 1 received
    { wait: 0.8, handle: 1.0 }, // 2 id
    { wait: 5.6, handle: 3.4 }, // 3 village inspection ← bottleneck
    { wait: 1.1, handle: 1.2 }, // 4 signing
  ],
};

function jitter(base: number, rng: () => number): number {
  // ±45% noise, floored so nothing is instantaneous.
  const factor = 0.55 + rng() * 0.9;
  return Math.max(0.05, base * factor);
}

function buildSynthetic(): Application[] {
  const rng = mulberry32(20260829);
  const plan: string[] = [
    ...Array(13).fill('ka-post-matric'),
    ...Array(5).fill('income-cert'),
  ];
  const apps: Application[] = [];

  plan.forEach((schemeId, index) => {
    const scheme = schemes.find((item) => item.id === schemeId)!;
    const profile = TIMING[schemeId];
    // Spread submissions across the last ~120 days.
    let cursorMs = (25 + Math.floor(rng() * 95)) * DAY;
    const id = `synthetic-${schemeId}-${index}`;
    const steps: ApplicationStep[] = scheme.steps.map((wStep, sIndex) => {
      const p = profile[sIndex] ?? { wait: 1, handle: 1 };
      const waitMs = jitter(p.wait, rng) * DAY;
      const handleMs = jitter(p.handle, rng) * DAY;
      const enteredAt = cursorMs;
      const firstOpenedAt = enteredAt - waitMs;
      const completedAt = firstOpenedAt - handleMs;
      cursorMs = completedAt; // next step enters when this one completes
      return {
        id: `${id}::${wStep.id}`,
        applicationId: id,
        workflowStepId: wStep.id,
        enteredAt: iso(enteredAt),
        firstOpenedAt: iso(firstOpenedAt),
        completedAt: iso(completedAt),
      };
    });
    apps.push({
      id,
      citizenId: 'synthetic',
      schemeId,
      shareCode: `SYNTH-${index}`,
      submittedAt: steps[0].enteredAt!,
      steps,
    });
  });

  return apps;
}

/** 18 synthetic + the 2 real applications = 20 the dashboard aggregates over. */
export const syntheticApplications: Application[] = buildSynthetic();
