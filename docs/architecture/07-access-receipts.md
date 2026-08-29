---
feature: access-receipts
route: null
status: specified
answers_use_case: "Who opened my bundle, when, and how long is this office taking?"
depends_on: [05-document-bundle.md]
real: []
specified:
  - Mutual access receipts
  - Citizen-set use limits
  - Turnaround measured from first open
  - Aggregate turnaround benchmark
rejected:
  - Covert tracking beacon embedded in the shared document
citations:
  - MeitY — Electronic Consent Framework (consent artefact)
  - DEPA — ORGANS principles, "A" for auditable
---

# 07 — Access receipts and turnaround

## The rejected design, and why it is recorded here

The first version of this feature was an **invisible element embedded in the
shared document** that would call home when opened, giving the citizen a hidden
view count.

**It is not built, and it should not be.**

| Objection | Detail |
|---|---|
| It surveils the officer | Collects a government employee's access time, device and address without their knowledge or consent |
| It contradicts the product | This project argues *pull is surveillance, push is service*, and treats honesty as a feature. A covert beacon is the counter-example to its own case |
| It does not work | Printed QR, offline viewing, blocked remote content and air-gapped networks all defeat it. A systematically undercounted number is worse than no number, and far worse if anything is rate-limited on it |

The idea underneath was sound. **Only the covertness was wrong.** Everything
below keeps the value and drops the deception.

## Design principle

> **Every party to an access knows the access is recorded, before it happens.**

This is not a constraint bolted on. It is the *auditable* property of the
consent-artefact pattern this project already builds on, applied honestly.

## 1. Mutual access receipts

When an officer opens a bundle, the read-only view states plainly, before
showing anything:

> *This is an access-receipted bundle. Opening it records the time and the
> reviewing office, and the citizen who shared it can see that record.*

The officer may decline and request the documents another way. **Disclosure
before access is what separates a receipt from a beacon.**

Receipts are recorded **per document**, not per bundle. Which documents an
officer opened — and which they never touched — is the fallback signal when no
reason is given at all.

```ts
interface AccessReceipt {
  bundleRef: string;
  openedAt: string;
  office: string;              // the office, never the individual
  documentsOpened: RecordSource[];
  documentsUntouched: RecordSource[];
  sequence: number;            // 1st, 2nd, 3rd open
}
```

### Show the fact, never the inference

The citizen sees the list. The product does **not** interpret it.

> Opened: income certificate (3), category certificate (1)
> Not opened: Class 12 marksheet
>
> *An open count does not indicate a problem. Documents are opened for many
> reasons, including refreshes and interruptions.*

Rendering *"opened 3 times — likely an issue"* would be inferring intent from
telemetry, which is the same adjudication this product refuses everywhere else.
The rule holds here or it holds nowhere.

### The signal degrades once it is used

An officer who knows the citizen reads their access pattern will open every
document once, mechanically, to produce a clean trail. Goodhart's law applies:
the measure stops measuring as soon as it becomes a target.

This is a reason to publish the pattern as **evidence of contact**, never as a
quality score for a reviewer — and a reason never to rank offices by it.

Note `office`, not `officer`. The citizen needs to know *which desk* has their
file, not who the person is. Naming individuals would create a pressure surface
on public servants, which is not this product's business.

## 2. Citizen-set limits

The limits live **inside the envelope**, so the citizen sets them at share time:

```ts
interface BundleLimits {
  expiresAt: string;     // enforceable offline, today
  maxUses?: number;      // advisory offline, enforceable with a server
  singleOffice?: boolean;
}
```

**Honest split, and it must be stated on screen:**

- **Expiry** is enforceable by any verifier with a clock. Already built.
- **Use count** cannot be enforced by a self-contained envelope — nothing stops
  a second decode. It is *advisory* until a server holds the counter.

The direction of control matters. An earlier framing had government rate-limiting
citizens based on access telemetry. **Inverted, the same mechanism becomes a
consent control the citizen holds** — which is the only version worth building.

## 3. Turnaround measured from first open

This is the substantial idea.

**Today:** the clock starts when a department logs the file in its own system.
The citizen cannot see that moment, and the cheapest way to stop the clock is
not to log the file.

**Proposed:** the clock starts at the **first access receipt**. The citizen
holds that timestamp in their own envelope.

```ts
interface TurnaroundClock {
  bundleRef: string;
  firstOpenedAt: string;      // held by the citizen
  slaDays: number;            // from the scheme's own published SLA
  dueAt: string;              // computed, not asserted
  responseReceivedAt?: string;
}
```

That single change converts *"Under Process"* into a deadline with an owner —
the exact failure this project exists to remove. It creates no new database:
the citizen already holds the receipt.

**Stated plainly:** this measures *time from officer opening to officer
response*. It does not measure queue time before opening, and it must not be
presented as total processing time.

## 4. Aggregate benchmark

Receipts are individually private and collectively useful.

```http
GET /benchmark/turnaround?scheme=post-matric&state=TS

200 {
  "medianDays": 34,
  "sampleSize": 1281,
  "period": "2026-Q2"
}
```

Aggregate, anonymised, k-anonymity floor before publication, **office-level
never officer-level**. Nothing in India currently shows a citizen that one
office takes 34 days and another takes 9.

This is the §8 ask — *measure the requester side* — made concrete. India
digitised the supply of documents and never the demand. Nobody reports the gap,
so nobody closes it.

## What this costs

Receipts require a server. A self-contained envelope cannot record its own
opening — that is exactly the property that makes it privacy-preserving.

There is no stateless workaround. An officer who cooperates could return an
"what I opened" code by hand, but the case worth solving is the officer who
explains nothing, and that case needs a logged receipt or it needs nothing.

So this feature is the **first** that genuinely needs infrastructure, and it
should be built only if the accountability is worth the store. The counter-
argument is strong: a table of `(bundleRef, office, timestamp)` holds no
personal data, no documents and no identity, and can be pruned aggressively.

**If it is built, `/real` must say so, and the "no database" claim must be
amended rather than quietly retired.**

## Build order

1. Disclosure banner on the officer view. **(~10 min, honest with no backend)**
2. `BundleLimits` in the envelope, expiry enforced, use-count labelled advisory. **(~20 min)**
3. Receipts, turnaround clock and benchmark. **Requires a server. Out of scope
   for this prototype.**

Steps 1–2 ship today without dishonesty. Step 3 is the roadmap.
