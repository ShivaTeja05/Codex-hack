---
feature: consistency-check
route: /check
status: built
answers_use_case: "Is any information mismatched across my documents?"
engine: lib/engine/verdict.ts
supporting: [lib/engine/conflicts.ts, lib/engine/normalise.ts, lib/rules/]
real:
  - Field normalisation and conflict detection
  - Rule evaluation with citations
  - Correction ranking and the cascade
mocked:
  - DigiLocker fetch. Records are local synthetic fixtures.
citations:
  - EPFO — demographic matching is exact, not approximate
---

# 03 — Record consistency and the pre-submission check

## The problem

An Indian citizen exists as slightly different people across a dozen databases,
and **nobody owns the disagreement**. Aadhaar says *Rajeev*. The certificate
says *Rajiv*. The passbook says *R. Kumar*. Every portal accepts all three
without comment, then one rejects the application with a code instead of a
sentence — often after the 5–15 day correction window has closed.

This is measurable. EPFO received roughly **796 lakh claims in 2024-25 and
rejected about 174 lakh** — close to one in five — and demographic mismatch is
among the leading causes. EPFO's matching is **exact, not fuzzy**: a missing
middle name blocks a claim.

## Why existing tools cannot catch it

- **myScheme** asks you questions and trusts your answers. It has never seen
  your income certificate.
- **DigiLocker** stores issued documents. It never compares them against each
  other.

**Nobody reads your records against each other.** That is this feature.

## The core insight

Every conflict needs an arbiter, and inventing one would mean adjudicating.
So the arbiter is structural, not editorial:

> **The issuer-signed record is the value to match. Self-declared records are
> corrected to it.**

`provenance: 'issued'` beats `provenance: 'uploaded'`. When two *issued*
records disagree, **no automatic correction is offered** — the citizen must go
back to an issuer, and the product says so rather than guessing.

## Data model

```ts
interface Correction {
  id: string;
  field: FieldKey;
  agreedValue: string;         // the issuer-signed value
  authorityLabel: string;      // which issuer signed it
  changes: ProposedChange[];   // every record this rewrites
  disagreements: { source: RecordSource; label: string; value: string }[];
  clearsRuleIds: string[];
  clearsBlocking: number;
  where: string;               // where you do this for real
  disagreementNoun: string;    // "which spelling is correct"
  sideEffect?: string;         // consequence when it unblocks nothing
}

interface Verdict {
  blocking: VerdictRule[];
  warnings: VerdictRule[];
  passing: VerdictRule[];
  unfixable: VerdictRule[];    // blocks no correction here can clear
}
```

## Engine contract

```ts
buildVerdict(citizen, entitlementId): Verdict
buildCorrections(citizen, entitlementId): Correction[]   // ranked
applyChanges(citizen, changes): Citizen                  // pure
```

**Ranking** is deterministic: blocking rules cleared, then records touched,
then field order. Never alphabetical.

**The cascade** is computed, not asserted. `buildCorrections` evaluates the full
rulebook twice — once as-is, once against `applyChanges(citizen, changes)` — and
reports the difference. That is why "unblocks 1 rule" is a fact rather than a
label.

## Normalisation

Comparison happens on normalised values, so cosmetic differences do not
generate noise:

| Field | Rule |
|---|---|
| `name`, `fatherName` | lowercase, strip honorifics, collapse punctuation and whitespace |
| `dob` | digits only — `14-08-2005` equals `14/08/2005` |
| `annualIncome` | digits only — `₹2,80,000` equals `280000` |
| `bankAccount` | alphanumeric only |

Normalisation decides *whether* records disagree. It never rewrites what is
shown to the citizen.

## The honest ending

Some blocks are not paperwork problems. An income of ₹2,80,000 against a
₹2,50,000 threshold cannot be corrected by matching records, and the product
says exactly that: *"No correction on this page changes these."*

It then offers the only two honest paths — reissue if the figure is wrong, or
do not spend your application if it is right — and it never says *"you are
ineligible."* It says **"this rule requires X; your record says Y."**

## Integration contract

```http
POST /{issuer}/field-match
Authorization: consent-artefact <signed, scoped, revocable>

{ "field": "fatherName", "value": "Rajeev Kumar" }

200 { "match": false }
```

A `false` is enough to warn the citizen. The stored value never leaves the
issuer, so the check is possible without the tool ever reading the record.
