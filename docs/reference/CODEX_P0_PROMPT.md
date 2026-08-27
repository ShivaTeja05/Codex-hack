# Codex prompt — P0

*Attach `P0_BUILD.md` and `architecture.mermaid` to the session. Paste the block below. Then run the tasks one at a time.*

---

## Opening prompt

```
Read the attached P0_BUILD.md and architecture.mermaid. They are the
source of truth. Build only what P0_BUILD.md lists. Do not add features.

WHAT WE ARE BUILDING
A web app for a hackathon (Build What Moves India). An Indian citizen
applying for a government scheme uploads or connects their documents.
The app compares the same fields across those documents, finds the
contradictions that cause application rejections, ranks the single fix
that unlocks the most, and produces a scoped share code an officer can
open to verify. Eight screens, one journey, start to finish.

THE PROBLEM IT SOLVES
Indian government applications are commonly rejected because the same
person's name, father's name, DOB or income differs slightly between
documents. A one-letter difference between Aadhaar and an income
certificate gets a scholarship marked defective six weeks after
submission. The check is computable at the moment of typing. Nothing
does it. We do it before submission.

STACK
Next.js 14 App Router, TypeScript, Tailwind. No database, no auth, no
localStorage. One API route (/api/explain). Deploy to Vercel as a public
URL that opens with no access request.

HARD CONSTRAINTS — breaking any of these fails the submission
1. No real personal data. There must be NO input field anywhere for
   Aadhaar, PAN, OTP, password or payment details. Users pick a
   pre-seeded synthetic citizen by display name.
2. No calls to real government systems, no scraping. The wallet is a
   local mock adapter, clearly labelled in the UI.
3. No government logos, emblems or official-looking styling. A
   persistent banner reads "Independent prototype — synthetic data".
4. Every rule object must have a non-empty source.instrument. Add a test
   that fails if any rule lacks one. If you do not know the real legal
   citation for a rule, set it to "TODO_CITATION" and list it for me at
   the end. NEVER invent an act, section number or notification date.
5. Deterministic code decides everything — conflicts, eligibility,
   ranking. The OpenAI model ONLY rewrites already-computed text into
   plain language, with a 3 second timeout and a hardcoded fallback.
   The whole journey must work with the API key unset. Test this.
6. Nothing persists. No DB, no localStorage, no server-side profile.
   The bundle reference is a self-contained payload.
7. Mobile-first. Must be usable at 360px width on a slow connection.
   No blocking network call on the critical path.

OUTPUT TONE
Plain language, short sentences, no jargon, written for someone with
limited digital experience. Never write "you are eligible" — always
"this rule requires X; your record says Y".

HOW TO WORK
- Follow the task list in order. Finish each task completely before the
  next. Show me the diff and wait.
- Keep engine logic in /lib/engine as pure functions with no network or
  React imports. Screens must contain no business logic.
- Write the three tests specified in P0_BUILD.md section 11.
- Ask me when a product decision is ambiguous. Do not invent government
  rules, thresholds, or citations to fill a gap.
```

---

## Tasks — one at a time

**Task 1 — Skeleton and types**
> Scaffold the Next.js + TypeScript + Tailwind project with the file tree in P0_BUILD.md section 4. Implement every type in section 5 in `/lib/types.ts`. Create `/lib/rules/index.ts` with a validator that throws at build time if any rule has an empty `source.instrument`. No UI yet.

**Task 2 — Seed data**
> Create the two synthetic citizens described in section 8, in `/lib/seed/citizens.ts`, and the post-matric scholarship entitlement in `/lib/seed/entitlements.ts`. Every name and number must be obviously fictional. Include the deliberate conflicts exactly as specified.

**Task 3 — Rulebook**
> Implement the eight rules in section 9 across `/lib/rules/`. Each needs a plain-language `description` and a `source` citation. Use `TODO_CITATION` where you don't know the real source and list them all at the end.

**Task 4 — Engine**
> Implement the five functions in section 6 as pure TypeScript in `/lib/engine/`. Then write the three tests from section 11. Critical: `normaliseField` must collapse case, spacing and punctuation but must NOT treat `Rajeev` and `Rajiv` as the same. Include that exact assertion in the test.

**Task 5 — Shell and screens 1–3**
> Build the persistent banner, MockChip, ProvenanceBadge and CitationLink components. Then screens 1 (Goal), 2 (Connect) and 3 (Record). Mobile-first, 360px minimum. Screen 2 must be visibly labelled as a simulated wallet.

**Task 6 — Screens 4–6**
> Conflicts, Fix queue and Eligibility. The Fix queue is the most important screen in the product — the top item must state in one sentence what fixing it unlocks. Every rule shown on the Eligibility screen needs a working "why does this apply?" link revealing its citation.

**Task 7 — Screen 7**
> The bundle: scoped document list, generated reference code, QR, prominent expiry, and the "still bring these physically" list. The code must encode a self-contained payload, not a database row. Add a read-only route at /bundle/[code] that renders what an officer would see — no search, no lookup, no list of other bundles.

**Task 8 — Screen 8 and AI layer**
> The honesty page, rendered from a config object listing every capability as real or mocked with a reason. Then `/api/explain` and the wrapper in `/lib/ai/explain.ts` with the 3s timeout and fallback. Confirm the no-AI test passes.

**Task 9 — Ship**
> Mobile pass at 360px, remove any blocking network call on the critical path, add Vercel deploy config with no auth. Then run the definition-of-done checklist in section 13 and report which items fail.
