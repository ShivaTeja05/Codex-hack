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
