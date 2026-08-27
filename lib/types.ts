export type FieldKey =
  | 'name'
  | 'fatherName'
  | 'dob'
  | 'annualIncome'
  | 'category'
  | 'bankAccount';

export type RecordSource =
  | 'aadhaar'
  | 'pan'
  | 'bank'
  | 'marksheet12'
  | 'incomeCertificate'
  | 'casteCertificate'
  | 'applicationForm';

export interface Citation {
  instrument: string;
  notifiedOn?: string;
  url?: string;
}

export interface DocumentRecord {
  source: RecordSource;
  label: string;
  issuer: string;
  provenance: 'issued' | 'uploaded';
  issuedOn: string;
  validUntil?: string;
  fields: Partial<Record<FieldKey, string>>;
}

export interface Citizen {
  id: string;
  displayName: string;
  documents: DocumentRecord[];
}

export interface Rule {
  id: string;
  kind: 'consistency' | 'eligibility' | 'document';
  appliesTo: string[];
  description: string;
  source: Citation;
  evaluate(c: Citizen): RuleResult;
}

export interface RuleResult {
  ruleId?: string;
  status: 'pass' | 'block' | 'warn';
  message: string;
  fix?: FixHint;
}

export interface Conflict {
  id: string;
  field: FieldKey;
  values: { source: RecordSource; value: string }[];
  severity: 'blocking' | 'warning';
  blocks: string[];
  fix: FixHint;
}

export interface FixHint {
  action: string;
  where: string;
  unlocks: string[];
}

export interface Entitlement {
  id: string;
  name: string;
  authority: string;
  requiredDocuments: RecordSource[];
  ruleIds: string[];
  slaDays: number;
  slaSource: Citation;
  applyUrl: string;
}

export interface Bundle {
  ref: string;
  entitlementId: string;
  documents: RecordSource[];
  conflicts: Conflict[];
  physicalStillRequired: string[];
  expiresAt: string;
}

export interface CapabilityDisclosure {
  capability: string;
  status: 'real' | 'mocked';
  reason: string;
}

// ---------- Linkage map ----------
export interface Linkage {
  domain: 'phone' | 'bankDbt' | 'pan' | 'uan' | 'rationCard' | 'land';
  label: string;
  status: 'linked' | 'notLinked' | 'lapsing' | 'unknown';
  obligation: 'mandatory' | 'conditional' | 'voluntary';
  conditionalOn?: string;
  detail?: string;
  lapsesOn?: string;
  source: Citation;
}

export interface LinkageProbe {
  domain: Linkage['domain'];
  isMocked: true;
  contractNote: string;
  probe(citizenId: string): Promise<Linkage>;
}

// ---------- Cascade ----------
export interface ProposedChange {
  source: RecordSource;
  field: FieldKey;
  newValue: string;
}

export interface CascadeResult {
  change: ProposedChange;
  newConflicts: Conflict[];
  resolvedConflicts: Conflict[];
  propagateTo: RecordSource[];
}

// ---------- Tracking ----------
export interface Application {
  ref: string;
  entitlementId: string;
  submittedOn: string;
  slaDays: number;
  slaSource: Citation;
  authority: string;
  status: 'submitted' | 'underReview' | 'defective' | 'approved' | 'rejected';
  reasonCode?: string;
}

export interface ReasonCode {
  code: string;
  plainMeaning: string;
  fix: FixHint;
  source: Citation;
}

export interface AppealDraft {
  applicationRef: string;
  appellateAuthority: string;
  daysOverdue: number;
  body: string;
  source: Citation;
}

// ---------- Full app ----------
export interface Session {
  citizenId: string;
  revealed: boolean;
}

export interface IdentityCard {
  aadhaarLast4: string;
  name: string;
  address: string;
  dob: string;
}

export interface Issue {
  id: string;
  type:
    | 'unknown_sim'
    | 'sim_suspended'
    | 'mismatch'
    | 'expired'
    | 'wrong_routing'
    | 'lapsing';
  severity: 'high' | 'medium' | 'low';
  title: string;
  detail: string;
  cost?: string;
  action: { label: string; href?: string };
  source: Citation;
}

export interface AuthEvent {
  id: string;
  agency: string;
  when: string;
  purpose: string;
  recognised?: boolean;
}

export interface WalletDoc {
  source: RecordSource;
  label: string;
  issuer: string;
  provenance: 'issued' | 'uploaded';
  state: 'available' | 'pending' | 'applied';
  issuedOn: string;
  validUntil?: string;
  digilockerUrl: string;
}

export type RecordStatus =
  | 'blocked'
  | 'wrong'
  | 'expired'
  | 'clear'
  | 'unknown'
  | 'optional';

export type RequirementClass =
  | 'mandatory'
  | 'conditional'
  | 'required'
  | 'voluntary'
  | '—';

export interface RecordOverview {
  id: string;
  connectedTo: string;
  detail: string;
  required: RequirementClass;
  status: RecordStatus;
  source: Citation;
  values?: { source: RecordSource; label: string; value: string }[];
  proposedChange?: ProposedChange;
  action: string;
}

export interface CitizenProfile {
  id: string;
  displayName: string;
  demoPin: string;
  identity: IdentityCard;
  issues: Issue[];
  records: RecordOverview[];
  activity: AuthEvent[];
  documents: WalletDoc[];
}

export interface TrackedReport {
  ref: string;
  status: 'received';
}
