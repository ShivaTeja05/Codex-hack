export type DocType =
  | 'MOCK_ID'
  | 'MOCK_PAN'
  | 'MARKSHEET_10'
  | 'MARKSHEET_12'
  | 'INCOME_CERT'
  | 'CATEGORY_CERT'
  | 'DOMICILE_CERT'
  | 'RATION_CARD'
  | 'BANK_PASSBOOK';

export type EventType =
  | 'SHARE_CODE_CREATED'
  | 'SHARE_CODE_OPENED'
  | 'DOC_FETCHED'
  | 'DOC_OPENED'
  | 'DOC_REOPENED'
  | 'DOC_VERIFIED'
  | 'DOC_FLAGGED'
  | 'DOC_REPLACED'
  | 'STEP_ENTERED'
  | 'DECISION_MADE'
  | 'ACCESS_DENIED_RATE_LIMIT'
  | 'SHARE_CODE_REVOKED';

export type StepStatus =
  | 'NOT_STARTED'
  | 'WAITING'
  | 'IN_REVIEW'
  | 'ACTION_NEEDED'
  | 'DONE';

export type FlagReason = 'ILLEGIBLE' | 'MISMATCH' | 'EXPIRED' | 'WRONG_DOC';

export interface DocFields {
  name?: string;
  dob?: string;
  address?: string;
  pincode?: string;
  phone?: string;
  fatherName?: string;
}

export interface TrailDocument {
  id: string;
  ownerId: string;
  docType: DocType;
  /** What the citizen calls it. Never the enum. */
  plainName: string;
  issuer: string;
  issuedOn: string;
  /** Masked. Never a 12-digit number. */
  refMasked: string;
  source: 'DIGILOCKER_MOCK' | 'UPLOADED_SCAN';
  fields: DocFields;
}

export interface WorkflowStep {
  id: string;
  schemeId: string;
  order: number;
  plainName: string;
  officeName: string;
  officeId: string;
  slaDays: number;
  requiredDocTypes: DocType[];
}

export interface Scheme {
  id: string;
  name: string;
  department: string;
  state: string;
  plainSummary: string;
  steps: WorkflowStep[];
}

export interface ApplicationStep {
  id: string;
  applicationId: string;
  workflowStepId: string;
  enteredAt?: string;
  firstOpenedAt?: string;
  completedAt?: string;
}

export interface Application {
  id: string;
  citizenId: string;
  schemeId: string;
  shareCode: string;
  submittedAt: string;
  steps: ApplicationStep[];
}

export interface ShareCode {
  code: string;
  citizenId: string;
  applicationId?: string;
  purpose: string;
  docIds: string[];
  createdAt: string;
  expiresAt: string;
  revokedAt?: string;
  maxOpens: number;
}

export interface DocEvent {
  id: string;
  ts: string;
  eventType: EventType;
  documentId?: string;
  applicationId?: string;
  stepId?: string;
  shareCode?: string;
  actorType: 'CITIZEN' | 'OFFICER' | 'SYSTEM' | 'UNKNOWN';
  actorLabel: string;
  actorOfficeId?: string;
  meta?: Record<string, unknown>;
}

export interface Flag {
  id: string;
  documentId: string;
  applicationId: string;
  stepId: string;
  officerLabel: string;
  reason: FlagReason;
  comment: string;
  createdAt: string;
  resolvedAt?: string;
  replacementDocId?: string;
}

export interface Citizen {
  id: string;
  name: string;
  mockLockerId: string;
  phoneMasked: string;
  dob: string;
}
