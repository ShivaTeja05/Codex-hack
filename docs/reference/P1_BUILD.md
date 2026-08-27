# P1 Build Spec

*Builds on the completed P0. Nothing here replaces P0 code — every item extends an existing module.*

**The rule still governs:** every feature you demo must work. P1 items ship in waves, and an unfinished wave gets deleted, not shipped grey.

---

## 1. What P1 adds, and why in this order

| Wave | Item | Demo value | Build risk | Reuses |
|---|---|---|---|---|
| **P1a** | Cascade check | Very high | **Low** | `buildConflicts()` unchanged |
| **P1a** | Linkage map | Very high | Medium | Adapter pattern from `walletAdapter` |
| **P1b** | Status tracker + clock | Medium | Medium | New pure module |
| **P1b** | Reason-code translation | Medium | Low | Lookup table |
| **P1b** | Appeal draft | Medium | Low | Template + facts |
| **P1c** | Public API spec + mock server | High (credibility) | **Very low** | No UI at all |
| **P1c** | Expiry + update-limit warnings | Low | Very low | Folds into existing screens |

**Do P1a first.** Cascade is the cheapest high-value item you have — it is one extra call to code you already wrote.

**Do P1c even if you skip P1b.** It costs an hour, needs no UI, and it converts your biggest weakness (heavy mocking) into a deliberate position.

---

## 2. Architecture — how P1 attaches

See `architecture-p1.mermaid`. In words:

- **Cascade** adds no new engine. It runs `buildConflicts()` twice — once on the citizen as-is, once on a hypothetical citizen with one field changed — and diffs the results.
- **Linkage** adds a new adapter directory following the exact interface shape of `walletAdapter`. No engine change.
- **Tracker** adds one pure module (`/lib/engine/tracking.ts`) plus a lookup table. No change to conflicts or rules.
- **Spec repo** is a folder plus a static route. No app change at all.

**Nothing in P1 modifies P0 engine code.** If a P1 wave fails, delete its folder and its route; P0 still runs.

---

## 3. New types (append to `/lib/types.ts`)

```ts
// ---------- Linkage map ----------
interface Linkage {
  domain: 'phone' | 'bankDbt' | 'pan' | 'uan' | 'rationCard' | 'land';
  label: string;
  status: 'linked' | 'notLinked' | 'lapsing' | 'unknown';
  obligation: 'mandatory' | 'conditional' | 'voluntary';
  conditionalOn?: string;    // "only to receive DBT scholarship money"
  detail?: string;           // "Seeded to a bank last changed in 2022"
  lapsesOn?: string;
  source: Citation;          // REQUIRED, same rule as rules
}

interface LinkageProbe {
  domain: Linkage['domain'];
  isMocked: true;            // hardcoded — never flips in this build
  contractNote: string;      // "shaped to the published TAFCOP response"
  probe(citizenId: string): Promise<Linkage>;
}

// ---------- Cascade ----------
interface ProposedChange {
  source: RecordSource;
  field: FieldKey;
  newValue: string;
}

interface CascadeResult {
  change: ProposedChange;
  newConflicts: Conflict[];     // introduced by making this change
  resolvedConflicts: Conflict[];// fixed by making this change
  propagateTo: RecordSource[];  // records that must now be updated too
}

// ---------- Tracking ----------
interface Application {
  ref: string;
  entitlementId: string;
  submittedOn: string;
  slaDays: number;
  slaSource: Citation;
  authority: string;            // owning officer / designated authority
  status: 'submitted' | 'underReview' | 'defective' | 'approved' | 'rejected';
  reasonCode?: string;
}

interface ReasonCode {
  code: string;                 // as emitted by the department
  plainMeaning: string;         // one sentence
  fix: FixHint;
  source: Citation;
}

interface AppealDraft {
  applicationRef: string;
  appellateAuthority: string;
  daysOverdue: number;
  body: string;                 // generated from template + facts
  source: Citation;             // the RTS provision creating the right
}
```

---

## 4. P1a — Cascade check

**The screen:** on the Fix queue, each fix gets a "what happens if I do this?" expansion.

> *Correcting your father's name on the income certificate resolves 2 blocking conflicts and unlocks the scholarship. It does not create new mismatches. After the correction, update: bank record, PF record.*

**Implementation — three steps, no new engine:**

```ts
// /lib/engine/cascade.ts
export function cascade(
  citizen: Citizen,
  change: ProposedChange,
  entitlementId: string
): CascadeResult {
  const before = buildConflicts(citizen, entitlementId);
  const after  = buildConflicts(applyChange(citizen, change), entitlementId);
  return {
    change,
    newConflicts:      after.filter(a => !before.some(b => b.id === a.id)),
    resolvedConflicts: before.filter(b => !after.some(a => a.id === b.id)),
    propagateTo:       recordsCarrying(citizen, change.field)
                         .filter(s => s !== change.source),
  };
}
```

`applyChange` returns a **copy** — never mutate the seeded citizen.

**Acceptance:** on `demo-priya`, correcting the income certificate's father's name shows 2 resolved, 0 new, and lists the records to propagate to. Correcting Aadhaar instead shows a different, correct set.

---

## 5. P1a — Linkage map

**The screen:** a list, one row per domain, each showing status, obligation class, detail, and a citation link.

**Rules that cannot be broken:**
- **No completion score, no progress bar, no percentage, no green "all done" state.** Gamifying linkage pushes people past the voluntary line.
- Every row states its obligation class: **mandatory / conditional / voluntary**, each with a citation.
- A domain you cannot check renders as `unknown` with a plain explanation. A blank is information.
- Every row carries the mock chip.

**Ship at least three domains.** Suggested: `bankDbt` (the money one), `pan` (mandatory example), `rationCard` (lapsing example). Add `phone` if time allows.

**File:** `/lib/mock/linkage/{bankDbt,pan,rationCard}.ts`, each exporting a `LinkageProbe`. Same shape as `walletAdapter` so the pattern is obvious to a reviewer reading the repo.

**Acceptance:** the map renders three domains for both demo citizens, `demo-priya` shows a bank seeded to an account she isn't using and a lapsing certificate, and every row has a working citation link.

---

## 6. P1b — Tracker, reason codes, appeal draft

**One screen, three features, in a chain.**

**Tracker:** for a submitted application, show *Day N of M statutory days*, the owning authority, and current status. Overdue state is visually distinct.

```ts
// /lib/engine/tracking.ts
daysElapsed(a: Application, today: Date): number
isOverdue(a: Application, today: Date): boolean
```

**Reason codes:** `/lib/seed/reasonCodes.ts` maps a department code to a plain sentence and a fix. Seed 5–8 real codes. Same citation rule — `TODO_CITATION` if unknown, never invented.

**Appeal draft:** generated when `isOverdue` is true. Template plus facts — application ref, days overdue, authority, the statutory provision. Rendered as copyable text with a "this is a draft you send yourself" note.

**Acceptance:** one seeded application is overdue and produces a draft naming the correct authority and day count. One is on time and shows no appeal option.

---

## 7. P1c — Public API spec (do this even if short on time)

**No UI. One folder, one static route.**

```
/spec
  linkage-match.yaml      → OpenAPI 3.1
  README.md               → the consent model, in plain English
  mock-server/            → minimal Express or Next route implementing it
```

**Design the endpoint as a match, not a retrieval.** The response is yes/no, never data:

```
POST /v1/match
{
  "consentToken": "<citizen-generated, scoped, expiring>",
  "domain": "bankDbt",
  "assertions": [{ "field": "name", "value": "..." }]
}
→ { "matches": [{ "field": "name", "result": "match" | "mismatch" }] }
```

**Document three safeguards in the README:** consent-bound queries only; strict rate limits and no bulk endpoint; match only against values the citizen already holds. Explain the brute-force risk you're mitigating — naming the attack shows you thought harder than most.

Link the spec from the honesty page: *"this capability is mocked because the endpoint does not exist. Here is the specification we propose, and our mock server implementing it."*

---

## 8. P1c — Small warnings (fold into existing screens)

- On the Record screen: expiry badge on any certificate past `validUntil`
- On the Record screen: update-limit note where relevant (name changeable twice in a lifetime; DOB and gender once each), cited

---

## 9. Tests to add

1. `cascade.test.ts` — asserts a correction to `demo-priya` resolves exactly the expected conflicts, introduces none, and does not mutate the seed
2. `linkage.test.ts` — asserts every probe returns a `source.instrument` and an `obligation`
3. Extend `rules.test.ts` — the citation validator now covers linkage rules and reason codes

---

## 10. Cut rules

- Behind on P1a? Ship cascade, drop the linkage map. Cascade is cheaper and demos better.
- Behind on P1b? Drop the whole wave. Tracker without a working appeal draft is a half-story.
- **Never drop P1c.** It is an hour and it is the answer to the hardest question you'll be asked.
- Anything unfinished gets its route deleted before you record the video.

---

## 11. Definition of done (P1)

- [ ] All P0 checks still pass
- [ ] Cascade works from the Fix queue for both demo citizens
- [ ] Linkage map renders 3+ domains with obligation class and citation on every row
- [ ] No completion score, progress bar or percentage anywhere in the linkage UI
- [ ] Spec folder published and linked from the honesty page
- [ ] Honesty page updated with every new mocked capability
- [ ] No `TODO_CITATION` on anything that renders
- [ ] Journey still completes with the OpenAI key removed
- [ ] Retested in incognito on a real phone
