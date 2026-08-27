# Codex prompt — P1

*Continue in the same Codex session as P0 if possible. Attach `P1_BUILD.md` and `architecture-p1.mermaid`. Paste the block below, then run tasks in order.*

---

## Opening prompt

```
P0 is complete and working. We are now adding P1. Read the attached
P1_BUILD.md and architecture-p1.mermaid — they are the source of truth
for this wave. Build only what is listed. Do not add features.

CRITICAL RULE FOR THIS WAVE
Do NOT modify existing P0 engine code, types that P0 depends on, or P0
screens except where P1_BUILD.md explicitly says to extend them. Every
P1 item must attach as a new module. If a P1 feature is deleted, P0 must
still run unchanged. Before editing any existing file, tell me which
file and why, and wait.

WHAT P1 ADDS
1. Cascade check — "if I correct this field, what does it resolve, what
   does it break, and what else must I update?" This runs the EXISTING
   buildConflicts() twice and diffs the results. No new engine logic.
2. Linkage map — a screen showing what is attached to this citizen
   (bank benefit routing, PAN, ration card), each labelled mandatory,
   conditional or voluntary, each with a legal citation.
3. Tracker, reason-code translation and appeal draft — the "no dead
   ends" chain for an application already submitted.
4. A published OpenAPI spec and mock server for the linkage endpoint we
   are proposing to government. No UI.

ALL P0 HARD CONSTRAINTS STILL APPLY, plus these:

5. LINKAGE UI: no completion score, no progress bar, no percentage, no
   "all linked" success state, no gamification of any kind. Showing a
   citizen a score encourages them to link things the law does not
   require. Show status only.
6. Every Linkage object needs an `obligation` of mandatory, conditional
   or voluntary, AND a non-empty source.instrument. Extend the existing
   citation validator to cover linkage probes and reason codes.
7. The linkage API we specify is a MATCH endpoint, not a retrieval one.
   It answers "does this value match your record: yes/no". It never
   returns data. This is deliberate and must not be changed.
8. Never invent a legal citation, act, section number, notification date
   or statutory deadline. Use "TODO_CITATION" and list them for me.

HOW TO WORK
- One task at a time. Show me the diff and wait.
- Keep all P1 engine code pure — no network, no React imports.
- Write the tests in P1_BUILD.md section 9.
- Do not mutate seeded citizen objects. applyChange returns a copy.
```

---

## Tasks — in order

**Task 1 — Types**
> Append the P1 types from `P1_BUILD.md` section 3 to `/lib/types.ts`. Extend the existing citation validator so it also fails the build if any `Linkage` or `ReasonCode` lacks `source.instrument`. Do not change any existing type.

**Task 2 — Cascade engine**
> Create `/lib/engine/cascade.ts` implementing `cascade()` exactly as specified in section 4. It must call the existing `buildConflicts()` twice and diff. `applyChange` must return a deep copy — add a test asserting the seeded citizen is not mutated. Then write `cascade.test.ts` per section 9.

**Task 3 — Cascade UI**
> Extend the existing Fix queue screen with a "what happens if I do this?" expansion per fix. Show resolved conflicts, newly introduced conflicts, and the list of records to propagate the change to. Plain language, one short paragraph. Do not restructure the Fix queue screen — add to it.

**Task 4 — Linkage probes**
> Create `/lib/mock/linkage/` with three probes: `bankDbt`, `pan`, `rationCard`. Follow the exact interface shape of the existing `walletAdapter` so the pattern is legible to someone reading the repo. Each returns a `Linkage` with obligation class, detail, and citation. `demo-priya` must show a benefit account seeded to a bank she is not using, and a lapsing certificate. Write `linkage.test.ts`.

**Task 5 — Linkage map screen**
> New route `/linkage`. One row per domain: status, obligation class, detail, mock chip, and a working citation link. Re-read constraint 5 before you build this — no score, no progress bar, no percentage, no success state. A domain that cannot be checked renders as `unknown` with a plain explanation. Mobile-first at 360px.

**Task 6 — Tracker chain**
> Create `/lib/engine/tracking.ts` with `daysElapsed` and `isOverdue`, and `/lib/seed/reasonCodes.ts` with 5–8 entries mapping a department code to a plain sentence and a fix. Then the `/tracker` route showing day N of M statutory days, the owning authority, status, and translated reason where present. When overdue, generate the appeal draft from a template plus facts, rendered as copyable text labelled clearly as a draft the citizen sends themselves. Seed one overdue application and one on time.

**Task 7 — Public spec**
> Create `/spec/` with `linkage-match.yaml` (OpenAPI 3.1), a minimal mock server implementing it, and a `README.md` explaining the consent-token model in plain English. Document the three safeguards from section 7, including the brute-force risk a match oracle creates and how consent-binding, rate limits and citizen-held-values-only mitigate it.

**Task 8 — Small warnings**
> On the Record screen, add an expiry badge on any document past `validUntil`, and a cited note about Aadhaar update limits where relevant. Fold into the existing screen — do not create new routes.

**Task 9 — Honesty page and ship**
> Update the honesty page config with every new capability from P1, marked real or mocked with a reason, and link the published spec. Then run the P1 definition-of-done checklist in section 11 and report which items fail. Do not fix them silently — report first.
