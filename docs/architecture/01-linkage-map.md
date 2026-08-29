---
feature: linkage-map
route: /map
status: built
answers_use_case: "What is connected to my Aadhaar, and what is connected to what?"
engine: lib/engine/linkage.ts
seed: lib/seed/linkages.ts
real:
  - Evidence tiering from records and authentication history
  - Obligation classification with citations
  - Probe contracts rendered from the same config that types them
mocked:
  - Every department probe. Nothing calls them.
citations:
  - UIDAI — Aadhaar linkage is not tracked centrally
  - DoT — TAFCOP on Sanchar Saathi
  - PFMS — DBT Validation/Payment Error/Rejection and action thereon
---

# 01 — Linkage map

## The problem

A citizen cannot find out what they are attached to. This is not an oversight.
Departments do not report Aadhaar linkages to UIDAI, and UIDAI does not store
them. It is a deliberate privacy choice with an unintended cost: **the state
cannot show you your own connections, because it chose not to know them.**

Every existing tool answers a narrower question. TAFCOP shows SIMs. myAadhaar
shows who authenticated you. Nothing composes them.

## The design decision

We refuse to fake a registry. Instead every row is **graded by the evidence
behind it**, and the grade is visible to the citizen.

| Tier | Meaning | Source of truth |
|---|---|---|
| `confirmed` | The citizen supplied the record, so we can read and compare it | `Citizen.documents` |
| `probable` | An organisation authenticated this identity, so it very likely holds a record. Proves **contact**, never **content** | Authentication history |
| `unknowable` | No authority publishes this | Nothing — and we say so |

The `unknowable` rows are the feature, not a gap in it. They are where the
argument lives.

## Data model

```ts
interface LinkageDomain {
  domain: string;
  label: string;
  question: string;                 // what the citizen is actually asking
  obligation: 'mandatory' | 'conditional' | 'voluntary' | 'unknown';
  obligationDetail: string;
  source: Citation;
  confirmedBy: RecordSource[];      // records that prove this linkage
  suggestedBy: string[];            // words in an auth-history entry
  probeContract: string;            // the endpoint that would answer it
}

type LinkageTier = 'confirmed' | 'probable' | 'unknowable';

interface MappedLinkage extends LinkageDomain {
  tier: LinkageTier;
  finding: string;                  // plain language, tier-appropriate
  evidence: string;                 // why it is in this tier
  evidenceSource: Citation;
}
```

## Engine contract

```ts
buildLinkageMap(citizen: Citizen, activity: AuthEvent[]): MappedLinkage[]
countByTier(map: MappedLinkage[]): Record<LinkageTier, number>
```

Pure. Deterministic. Sorted `confirmed → probable → unknowable`, then by the
catalogue order. Never alphabetical, never by score.

**Tiering algorithm**

1. If any `confirmedBy` record is present → `confirmed`.
2. Else if any `suggestedBy` word appears in an authentication event's agency
   name → `probable`, carrying that event as evidence.
3. Else → `unknowable`, carrying the UIDAI citation as the explanation.

## Why authentication history is a legitimate signal

If a department authenticated your Aadhaar, it almost certainly holds a record
about you. UIDAI already exposes this to the citizen: AUA name, timestamp,
modality and result, for the **last 6 months, up to 50 records**.

That is a real, citizen-accessible discovery signal requiring **no new
infrastructure**. It is not a registry. It is evidence, and we grade it as such.

## Integration contract

Each domain declares the endpoint a department would expose. The shape is
constant and deliberately narrow:

```http
POST /{domain}/match
Authorization: consent-artefact <signed, scoped, revocable>

{ "field": "name", "value": "Priya Sharma" }

200 { "match": true }
```

**It returns a boolean. It never returns data.** This is the existing
privacy-preserving pattern, extended to a citizen-initiated query.

Where a domain is already served by a citizen-facing tool, the contract says so
and the product links out instead of duplicating. TAFCOP is the worked example:
**no new endpoint is required.**

## Privacy properties

- No linkage is inferred from anything the citizen did not supply or cannot
  already retrieve themselves.
- `probable` never claims to know a record's contents.
- Counts only. No completion percentage, ever.
- Obligation is always rendered with its citation, because misinformation about
  which linkages are compulsory is already widespread.

## Open questions

- Obligation for PAN and UAN is currently `unknown` with `TODO_CITATION`.
  Linking obligations change by notification and we will not assert an
  unverified rule.
- Land records have no national contract. Each state revenue department would
  need to expose its own. The row exists to name that, not to hide it.
