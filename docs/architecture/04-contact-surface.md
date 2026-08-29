---
feature: contact-surface
route: null
status: specified
answers_use_case: "Which phone numbers and contact points were issued against my identity?"
real: []
mocked:
  - Entire feature. Not implemented in the prototype.
citations:
  - DoT — TAFCOP on Sanchar Saathi
  - Telecommunications Act 2023 — connection limits
---

# 04 — Contact surface

## Status: specified, deliberately not built

**This feature already exists as a government service, and we do not rebuild
government services that work.**

TAFCOP, on the Sanchar Saathi portal, lists every mobile connection issued
against your identity and lets you report one for disconnection from the same
screen. The Telecommunications Act 2023 caps connections at **9** (6 in Jammu &
Kashmir, Assam and the North-East), and subscribers over the limit get an
automatic SMS.

Duplicating it would add a second, staler copy of a working tool and spend
build time that belongs elsewhere. **The linkage map links out to TAFCOP and
says why.**

This document exists so the decision is recorded rather than looking like an
omission.

## What the product does instead

In `lib/seed/linkages.ts` the `phone` domain carries:

```ts
obligation: 'voluntary',
obligationDetail:
  'Aadhaar is one accepted KYC document for a connection, not the only one. ' +
  'The Telecommunications Act 2023 caps connections at 9 ' +
  '(6 in Jammu & Kashmir, Assam and the North-East).',
probeContract:
  'TAFCOP already answers this for the citizen. OpenTrail should link out to it, ' +
  'not copy it. No new endpoint is required.',
```

The obligation classification matters more than the list. Misinformation about
which Aadhaar linkages are compulsory is widespread, and telecom is where most
of it lives. Stating **voluntary**, with the instrument, is the useful
contribution.

## The gap TAFCOP does not close

TAFCOP covers SIMs. It does not cover the other contact points issued against
the same identity — a UAN, a PDS household, a scheme registration. Those sit in
separate silos behind separate logins, which is the composition problem the
linkage map (01) addresses.

**If this feature is ever built, it should be as a linkage domain with a probe
contract, not as a screen.**

## If a future version does implement it

```http
GET /telecom/connections
Authorization: consent-artefact <signed, scoped, revocable>

200 {
  "count": 4,
  "limit": 9,
  "connections": [ { "operator": "...", "activatedOn": "...", "status": "active" } ]
}
```

Even then, the citizen-facing action must remain **report**, not **disconnect**.
The product does not take irreversible actions on a citizen's behalf.
