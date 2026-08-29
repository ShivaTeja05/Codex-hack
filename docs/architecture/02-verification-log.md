---
feature: verification-log
route: /activity
status: built
answers_use_case: "Where was my Aadhaar used, and who checked my profile?"
seed: lib/seed/profiles.ts
engine: lib/engine/issues.ts
real:
  - Recognition choices and the issue they raise
  - Deterministic ordering of raised issues
mocked:
  - The log itself. UIDAI authentication history is not fetched.
citations:
  - UIDAI — Aadhaar Authentication History (6 months, up to 50 records)
---

# 02 — Verification log

## The problem

People learn their identity was used only when something breaks. The credit
bureaus solved the equivalent problem years ago: an enquiry on your credit file
triggers a message. **Identity authentication has no such reflex.**

UIDAI does log it. Authentication history shows the AUA name, date and time,
modality and result — for the last 6 months, capped at 50 records. But the
citizen has to know it exists, go looking, and read it.

**The log is not the missing piece. The notification is.**

## The distinction that matters

This screen answers *"who checked me"*. It does **not** answer *"what am I
linked to"*. Those are different questions and conflating them is the single
most common misunderstanding about Aadhaar.

- An organisation can authenticate you **without** holding a durable record.
- An organisation can hold a record **without** ever authenticating you.

The screen says this in plain language, because the product's credibility rests
on not overclaiming here. The linkage map (01) consumes this same data as a
*probable* signal, and labels it as inference.

## Data model

```ts
interface AuthEvent {
  id: string;
  agency: string;      // the AUA, as it identifies itself
  when: string;
  purpose: string;     // what was checked
  recognised?: boolean;
}
```

## Citizen journey

1. Read the log, newest first.
2. For each entry, answer one question: **do you recognise this?**
3. `Don't recognise` immediately raises a tracked issue with a reference,
   visible on `/issues`. No form, no typing.

The recognition control is two taps. No Indic keyboard is required anywhere in
this flow — an explicit constraint from the tone rules.

## Engine contract

```ts
issueFromActivity(event: AuthEvent): Issue
sortIssues(issues: Issue[]): Issue[]     // by severity, deterministic
```

An unrecognised verification becomes a `medium` severity issue. It is never
auto-escalated and never characterised as fraud — the product does not
adjudicate. It states what happened and offers the report.

## What would make this real

```http
GET /uidai/authentication-history
Authorization: consent-artefact <signed, scoped, revocable>

200 {
  "window": "6 months",
  "events": [ { "aua": "...", "at": "...", "modality": "otp", "result": "success" } ]
}
```

This endpoint effectively exists — UIDAI serves it to a logged-in citizen
through myAadhaar. What does not exist is a consented, machine-readable form a
citizen can point at a tool of their choosing.

**The ask is not new data. It is the same data, delegable by the citizen.**

## The feature that does not exist anywhere

A **push**. UIDAI shows the log if you go looking; nothing tells you an
authentication happened. A single SMS — *"X authenticated your Aadhaar today.
Reply NO if this wasn't you"* — would convert a passive audit log into a
functioning safety net, using infrastructure that already runs.

## Privacy properties

- Recognition choices live in React state and die with the tab.
- Reports are references, not submissions. Nothing is sent to a department.
- The prototype never contacts UIDAI, a telecom operator, or any live system.
