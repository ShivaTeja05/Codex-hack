# P0 Build Spec

*Everything here must work by Aug 28, 8:00 PM IST. Anything not listed here is not being built.*

**Rule that governs the next 24 hours:** every feature you demo must work. If a screen isn't finished, delete it — do not ship it grey.

---

## 1. What P0 is

One journey, one entitlement, one synthetic citizen, eight screens.

```
Goal → Connect → Record → Conflicts → Fix queue → Eligibility → Bundle → Honesty page
```

**Anchor entitlement:** post-matric scholarship (change in one config file if you prefer ration card).

---

## 2. Architecture

See `architecture.mermaid`. In words:

- **Screens** hold no logic. They read session state and call engine functions.
- **Session state** is React context. In-memory only. Nothing persists, no database, no localStorage.
- **Engine** is pure TypeScript — no network, no side effects, fully unit testable.
- **Typed data** (seed citizens, rules, entitlements) is validated at build time.
- **Mock adapters** are labelled and shaped to real published contracts.
- **AI layer** only rewrites deterministic output into plain language, with a hardcoded fallback.

**The load-bearing property:** remove the OpenAI key and every screen still works. Write a test for it.

---

## 3. Stack

```
Next.js 14 App Router + TypeScript + Tailwind
No database. No auth. No localStorage.
One API route: /api/explain
Deploy: Vercel, public URL, opens with no access request
```

---

## 4. File tree

```
/app
  page.tsx                  → S1 Goal
  connect/page.tsx          → S2
  record/page.tsx           → S3
  conflicts/page.tsx        → S4
  fixes/page.tsx            → S5
  eligibility/page.tsx      → S6
  bundle/page.tsx           → S7
  bundle/[code]/page.tsx    → officer read-only view (P1, stub route in P0)
  real/page.tsx             → S8 honesty
  api/explain/route.ts
/lib
  types.ts
  state.tsx                 → session context
  engine/
    normalise.ts
    conflicts.ts
    rules.ts
    ranking.ts
    bundle.ts
  rules/
    consistency.ts
    eligibility.ts
    documents.ts
    sla.ts
    index.ts                → exports all + validates citations
  seed/
    citizens.ts
    entitlements.ts
  mock/
    walletAdapter.ts
  ai/
    explain.ts              → wrapper with timeout + fallback
/components
  Banner.tsx                → persistent "Independent prototype — synthetic data"
  MockChip.tsx              → orange chip on anything simulated
  ProvenanceBadge.tsx       → issued (green) vs uploaded (grey)
  CitationLink.tsx          → "why does this apply?"
/tests
  conflicts.test.ts
  rules.test.ts
  no-ai.test.ts
```

---

## 5. Data model (P0 subset)

```ts
type FieldKey = 'name' | 'fatherName' | 'dob' | 'annualIncome'
              | 'category' | 'bankAccount';

type RecordSource = 'aadhaar' | 'pan' | 'bank' | 'marksheet12'
                  | 'incomeCertificate' | 'casteCertificate';

interface Citation {
  instrument: string;      // required, non-empty
  notifiedOn?: string;
  url?: string;
}

interface DocumentRecord {
  source: RecordSource;
  label: string;
  issuer: string;
  provenance: 'issued' | 'uploaded';
  issuedOn: string;
  validUntil?: string;
  fields: Partial<Record<FieldKey, string>>;
}

interface Citizen {
  id: string;              // 'demo-priya' — never an Aadhaar number
  displayName: string;
  documents: DocumentRecord[];
}

interface Rule {
  id: string;
  kind: 'consistency' | 'eligibility' | 'document';
  appliesTo: string[];     // entitlement ids
  description: string;     // plain language, shown to user
  source: Citation;        // REQUIRED
  evaluate(c: Citizen): RuleResult;
}

interface RuleResult {
  status: 'pass' | 'block' | 'warn';
  message: string;         // deterministic fallback text
  fix?: FixHint;
}

interface Conflict {
  id: string;
  field: FieldKey;
  values: { source: RecordSource; value: string }[];
  severity: 'blocking' | 'warning';
  blocks: string[];        // entitlement ids
  fix: FixHint;
}

interface FixHint {
  action: string;          // "Correct father's name on the income certificate"
  where: string;           // "MeeSeva → Revenue → Certificate Correction"
  unlocks: string[];       // entitlement ids — drives ranking
}

interface Entitlement {
  id: string;
  name: string;
  authority: string;
  requiredDocuments: RecordSource[];
  ruleIds: string[];
  slaDays: number;
  slaSource: Citation;
  applyUrl: string;        // we deep-link out, we never submit
}

interface Bundle {
  ref: string;             // "MLN-4K7Q-2R9" — call it a reference, never an ID
  entitlementId: string;
  documents: RecordSource[];
  conflicts: Conflict[];   // pre-computed for the officer
  physicalStillRequired: string[];
  expiresAt: string;
}
```

---

## 6. Engine contracts

```ts
normaliseField(key: FieldKey, raw: string): string
// Collapses whitespace, case, punctuation, honorifics.
// MUST NOT normalise away real spelling differences.
// 'Rajeev' !== 'Rajiv'. That is the conflict we exist to catch.

buildConflicts(c: Citizen, entitlementId: string): Conflict[]
// For each FieldKey, gather every document carrying it, normalise, compare.
// severity = 'blocking' if the field appears in a rule for this entitlement.

evaluateRules(c: Citizen, entitlementId: string): RuleResult[]

rankFixes(conflicts: Conflict[], entitlements: Entitlement[]): FixHint[]
// Sort by unlocks.length DESC. This produces the hero screen.

buildBundle(c: Citizen, entitlementId: string, conflicts: Conflict[]): Bundle
// Scoped to requiredDocuments only. Self-contained payload, not a DB row.
```

---

## 7. Screens and acceptance criteria

| # | Screen | Done when |
|---|---|---|
| 1 | **Goal** | Free-text input plus 3 tappable chips. Resolves to an entitlement id. Works with AI off (keyword fallback). |
| 2 | **Connect** | Consent copy, orange mock chip, pick one of two demo citizens by name. No ID field of any kind. |
| 3 | **Record** | Every field shown across every source. Provenance badge on each document. Readable on a 360px screen. |
| 4 | **Conflicts** | Each mismatch shows both values, which source each came from, and why it matters. Blocking vs warning visually distinct. |
| 5 | **Fix queue** | Ranked list. Top item states what it unlocks in one sentence. **This is the hero — spend your polish here.** |
| 6 | **Eligibility** | Per entitlement: pass or blocked. Never the words "you are eligible". Every rule has a working "why does this apply?" citation link. |
| 7 | **Bundle** | Reference code, QR, prominent expiry, scoped document list, "still bring these physically" list. |
| 8 | **What's real** | Table rendered from a config object so it cannot drift from the implementation. |

**Global:** persistent banner on every screen. No government logos. No emblem-style colours.

---

## 8. Seed data

**`demo-priya`** — carries the demo.
- Aadhaar: father's name `Rajeev Kumar`
- Income certificate: father's name `Rajiv Kumar` ← **blocking conflict**
- Income certificate: annual income `₹2,80,000` vs entitlement threshold `₹2,50,000` ← **second blocking conflict**
- Bank: account seeded 2022, different from the one on her form
- Caste certificate: expired 4 months ago ← **warning**

**`demo-arun`** — clean, passes everything. Proves the engine isn't just always failing.

All names, numbers and IDs obviously fictional. No real identifiers anywhere.

---

## 9. Rules to seed (minimum viable set)

| id | kind | What it checks |
|---|---|---|
| `consistency.fatherName` | consistency | father's name across Aadhaar / income certificate |
| `consistency.name` | consistency | applicant name across Aadhaar / marksheet / bank |
| `consistency.dob` | consistency | DOB across Aadhaar / marksheet |
| `consistency.income` | consistency | income figure across form / certificate |
| `eligibility.income` | eligibility | income under threshold |
| `eligibility.category` | eligibility | category matches scheme |
| `document.required` | document | all required documents present |
| `document.validity` | document | no required certificate expired |

**Every rule needs a `source`.** Where you don't know the real citation, use `TODO_CITATION` and list them — never invent one. A fabricated citation in a product whose claim is "nothing outside government rules" is fatal in a way a missing feature is not.

---

## 10. AI boundary

**Used for:** parsing the goal text; rewriting `RuleResult.message` into plain language.

**Never used for:** deciding eligibility, detecting conflicts, ordering fixes, producing citations.

```ts
// lib/ai/explain.ts
export async function explain(deterministic: string): Promise<string> {
  try {
    const r = await withTimeout(callOpenAI(deterministic), 3000);
    return r ?? deterministic;
  } catch { return deterministic; }
}
```

---

## 11. Tests (three, non-negotiable)

1. `conflicts.test.ts` — asserts `Rajeev` vs `Rajiv` **is** a conflict, and `RAJEEV KUMAR` vs `Rajeev  Kumar` **is not**.
2. `rules.test.ts` — asserts every exported rule has a non-empty `source.instrument`.
3. `no-ai.test.ts` — asserts the full journey resolves with the API key unset.

---

## 12. Hour plan

| Hours | Work |
|---|---|
| 0–3 | Project setup, `types.ts`, rule validator, seed citizens |
| 3–7 | Rulebook + engine + all three tests passing |
| 7–12 | Screens 1, 2, 3 |
| 12–17 | Screens 4, 5, 6 ← **the demo spine** |
| 17–20 | Screen 7 + screen 8 |
| 20–23 | Mobile pass, slow-connection pass, deploy, incognito test on a real phone |
| 23–26 | Record video, write the 250-word summary, submit with buffer |

**If you are behind at hour 17:** cut screen 7, keep 1–6 and 8. A working six-screen journey beats a broken eight.

---

## 13. Definition of done

- [ ] Live public URL opens on a phone with no login and no access request
- [ ] Both demo citizens complete the full journey
- [ ] Every button on every visible screen does something
- [ ] All three tests pass
- [ ] Journey completes with the OpenAI key removed
- [ ] No `TODO_CITATION` remains on any rule that renders
- [ ] Banner visible on every screen
- [ ] No real Aadhaar/PAN/OTP/payment field exists anywhere in the codebase
- [ ] Tested in incognito on a real phone on mobile data
