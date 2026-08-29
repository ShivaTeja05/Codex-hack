---
feature: document-bundle
route: /bundle
status: partial
answers_use_case: "Submit chosen documents by code, and find out what an officer flagged"
engine: lib/engine/bundle.ts
real:
  - Scoped bundle assembly and self-contained encoding
  - Expiry, QR generation, read-only officer view
specified:
  - Officer flag and comment
  - Response code the citizen redeems for status
mocked:
  - DigiLocker fetch. Documents are named, never fetched or stored.
citations:
  - DigiLocker — requester integration requires an onboarded organisation
  - MeitY — Electronic Consent Framework (consent artefact)
---

# 05 — Document bundle and officer review

## The problem, in two halves

**Going out:** applying means photocopies. The same five documents, attested
again, for every application. DigiLocker solved the storage side and never the
demand side — roughly **2,500 organisations are onboarded to issue** documents
into it, but only around **230 are set up to consume** them.

**Coming back:** *"Under Process."* No deadline, no owner, no reason. When a
defect is finally raised, the citizen learns which document failed only if
somebody phones them, and the correction window is **5–15 days**.

The second half is the one nobody has built. **This document specifies it.**

## The architectural collision

A status channel appears to require a database. It does not, and building one
would break two rules the product is defined by:

| Rule | What a status database would do |
|---|---|
| **Pass-through, never store** | Persist an application record between two sessions |
| **Pull is surveillance, push is service** | Become a registry of who applied for what — the exact thing we refuse to build |

**Resolution: the flag travels on a code, not in a store.** State moves inside
signed envelopes that each party holds. Nothing accumulates anywhere.

## The round trip

```
CITIZEN                          OFFICER
   |                                |
   |  1. selects documents          |
   |     -> CLAIM CODE  ----------> |  2. opens read-only view
   |                                |     decodes from the URL itself
   |                                |     no lookup, no search, no list
   |                                |
   |                                |  3. flags a document, adds a comment
   |  <----------- RESPONSE CODE    |     -> signed envelope
   |                                |
   |  4. redeems the response code  |
   |     sees exactly what failed   |
   |     and what to do next        |
```

Neither code is stored by Milaan. Each is **self-contained, signed and
expiring**. The officer can only ever see a bundle a citizen pushed to them.

## Data model

```ts
interface Bundle {                       // built
  ref: string;
  entitlementId: string;
  documents: RecordSource[];
  conflicts: Conflict[];
  physicalStillRequired: string[];
  expiresAt: string;
}

interface OfficerResponse {              // specified
  bundleRef: string;                     // ties back without a lookup
  reviewedAt: string;
  decision: 'accepted' | 'defect' | 'query';
  flags: DocumentFlag[];
  note?: string;                         // free-text officer comment
  correctionWindowEndsAt?: string;       // the deadline, made explicit
  signature: string;                     // detached, verifiable offline
}

interface DocumentFlag {
  source: RecordSource;
  problem: 'illegible' | 'expired' | 'mismatch' | 'wrongDocument' | 'missing';
  detail: string;
  replaceBy?: string;
}
```

`bundleRef` is derived from the bundle's own content hash, so a response can be
matched to a claim **without either party consulting a registry**.

## Encoding

Both codes use the existing scheme in `lib/engine/bundle.ts`: JSON → UTF-8 →
base64url, stripped of padding. Decoding is total — a malformed or truncated
code renders *"Bundle not readable"* and a route home, never a stack trace.

For production the envelope must be **signed**, not merely encoded. Encoding is
not integrity: today's payload could be edited by hand. The signature is the
one piece that requires a key, and therefore a server.

## Why this is better than a status database

- **Nothing to breach.** No table of who applied for what.
- **Works offline.** A printed QR is a valid envelope. This matters where it is
  needed most.
- **No officer search surface.** An officer sees only what was pushed. There is
  no lookup screen to abuse, by design rather than by permission.
- **The citizen holds their own status.** They cannot be locked out of it.

## What it costs, stated plainly

The citizen must **receive** the response code — SMS, print or QR. There is no
polling. If they lose it, the officer must reissue.

This is a real limitation and the honest trade for holding no database. It is
also how the physical world already works: you keep your own acknowledgement
slip.

## Universal status, without a universal database

Because the envelope carries the department's own decision vocabulary, the same
redeem screen renders a scholarship defect, a certificate query and a PF
demographic flag identically. **The uniformity lives in the format, not in a
central system.** No department has to migrate anything to participate — it only
has to emit a signed envelope.

## Integration contract

```http
POST /officer/response
Authorization: officer-credential <department-issued>

{ "bundleRef": "MLN-…", "decision": "defect",
  "flags": [ { "source": "incomeCertificate", "problem": "mismatch",
               "detail": "Father's name does not match the identity record" } ],
  "correctionWindowEndsAt": "2026-09-12" }

201 { "responseCode": "<signed base64url envelope>" }
```

And on the citizen side, no endpoint at all — redemption is local decoding plus
signature verification.

## Build order, if this is implemented

1. Officer view gains a flag control per document. **(~25 min)**
2. `buildResponse()` and `encodeResponse()` mirroring the bundle functions. **(~20 min)**
3. `/status` screen: paste or scan a response code, see flags, deadline and
   next action. **(~30 min)**
4. Signing. **Requires a key and a server. Out of scope for a no-backend
   prototype, and must be labelled as such on `/real`.**

Steps 1–3 are honest without step 4 **provided the prototype states that codes
are encoded, not signed.** Claiming otherwise would be the one dishonesty this
project cannot afford.
