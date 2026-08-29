---
feature: benefit-routing
route: /money
status: built
answers_use_case: "Where does scheme money actually land, and why did a payment fail?"
engine: lib/engine/routing.ts
seed: lib/seed/reasonCodes.ts
real:
  - Routing comparison derived from the seeded records
  - Rejection reasons and official remedies quoted from PFMS
mocked:
  - NPCI mapper lookup. The routing record is modelled, not fetched.
citations:
  - PFMS — DBT Validation/Payment Error/Rejection and action thereon (11 March 2024)
---

# 06 — Benefit routing and DBT rejection reasons

## The problem

**One record decides where every scheme's money goes, and no citizen-facing
screen shows it.**

NPCI's mapper holds **one Aadhaar against one account at a time**. The most
recent bank to seed wins, effective in roughly 48 hours. Open an account for a
salary or a loan, and the bank may seed it — silently moving every scheme's
money with it. The account typed on an application form has no say.

This is why a dashboard can read *"Sanctioned"* after the credit has already
bounced. The scheme did its job. The money went somewhere the citizen forgot
about.

Documented consequence: a household's PM-Kisan instalments **and** a
post-matric scholarship were credited to an abandoned account for over a year.
They found out when a CSC operator opened the NPCI portal for them.

## Design decision: derive, do not assert

The routing status is computed from records already in the fixture rather than
stored as a separate claim:

- The **issuer-signed bank record** models what the mapper points at, and its
  `issuedOn` models the seeding date.
- The **application form** models what the citizen believes.

```ts
interface RoutingStatus {
  mapperAccount: string;
  seededOn: string;
  seededYearsAgo: number;
  formAccount?: string;
  agrees: boolean;
  landing: string;      // one sentence answering "where does it go"
}

buildRouting(citizen: Citizen): RoutingStatus | null
```

When they disagree the screen leads with the consequence — *"Money will land in
…2201, not …9914"* — and, where the seeding is old, adds the sentence that
makes it land: **"That routing was set 4 years ago. Nothing has told you
since."**

## The second half: reasons that already exist

PFMS **already publishes** the DBT rejection reasons and their official
remedies, in a PDF dated 11 March 2024. A first-generation applicant will never
find it, and it is written for a department.

So the ask changes shape. It is not *"publish reason codes"* — that is done.
It is **"put the ones you publish where the rejection is shown."**

```ts
interface DbtReason {
  basis: 'account' | 'aadhaar';
  reason: string;          // quoted from PFMS
  plainMeaning: string;    // ours, labelled
  officialRemedy: string;  // quoted from PFMS
  whatYouDo: string[];     // ordered errands, ours
  source: Citation;
}
```

The quoting boundary is enforced by convention and stated on screen: the reason
and the remedy are **quoted**; the plain meaning and the errand list are
**ours**. A reader can always tell which is which.

## Why the errand list matters more than the remedy

The official remedy for an unseeded Aadhaar is *"contact their bank branch for
Aadhaar seeding … and ask the bank to update the same on NPCI mapper."* Correct,
and useless to someone who has never heard the phrase *NPCI mapper*.

The rewritten version names the branch to visit (**the one holding the account
you want the money in, not any branch**), the words to say, the distinction to
insist on (**DBT seeding is not the same as KYC linking**), and the wait.

**Same information. The difference between a sentence and an outcome.**

## Integration contract

```http
GET /dbt/routing-status
Authorization: consent-artefact <signed, scoped, revocable>

200 {
  "bank": "…",
  "seededOn": "2022-06-12",
  "status": "active"
}
```

Returns the **bank name and seeding date only**. No account number, no balance,
no history. That is enough to warn a citizen that their routing is stale, and
not enough to be worth stealing.

## What we would ask for

1. **Expose this to the citizen.** The mapper's seeding date is the single most
   useful unshown number in Indian public service delivery.
2. **Notify on change.** A bank that re-seeds an Aadhaar moves every scheme's
   money. One SMS would close the loop.
3. **Publish the reason mapping as an API**, not a PDF.
