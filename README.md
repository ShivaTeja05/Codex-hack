# OpenTrail

**See where your government application actually is — because the document tells you, not an officer.**

OpenTrail is a mobile-first prototype for the *Build What Moves India* hackathon. Indian public-service portals show one label — **"Under Process"** — for weeks. Nobody is hiding anything; the process just doesn't produce data. OpenTrail fixes that at the source: instead of asking an officer to remember to click *"mark as done,"* it **instruments the document**. Every time an officer opens, re-opens, verifies or flags a document, that action becomes a timestamped event — and the application's status is *computed* from that stream, never *declared* by a human.

> ⚠️ **Independent prototype. Synthetic data only.** OpenTrail is not a government product and is not affiliated with or endorsed by any government body. It never contacts a real government system, DigiLocker, or UIDAI. No real ID numbers exist anywhere in the code, UI, or seed data.

---

## The core idea, in one line

**Status is a computed value, not a database column an officer sets.**

The insight is borrowed from email tracking (MailTracker and the like): a tracking pixel reports when a mail was opened, with zero extra effort from anyone — *the act of consuming the content is the signal.* OpenTrail applies the same principle to document verification:

```
Officer opens the document to do their job  →  the open IS the event  →  status updates
                                                        ↑
                              nobody has to remember to report anything
```

Because a document is only ever rendered at the **end of a logged fetch**, there is no way to view one without producing an event. That single decision is the whole architecture.

### The metric no current system produces

For every step, OpenTrail splits time into two parts nothing else separates:

- **Waiting time** — file reached the desk, nobody has opened it yet *(queue)*
- **Handling time** — an officer is actually working on it

A department told *"your step takes 9 days"* can't act. A department told *"7 of those 9 days are queue time before anyone opens the file"* can — that's a staffing decision, not a training one.

---

## What you can do (the full citizen journey)

| Route | What it is |
| --- | --- |
| **`/`** | Landing — the thesis, demo codes, no login |
| **`/journey`** | GOV.UK-style guided routing: one plain question at a time → the right scheme |
| **`/apply/[schemeId]`** | Pick documents → consistency checks with consequences → generate one share code |
| **`/track/[code]`** | **The hero screen.** Real status, the office holding your file, the waiting-vs-handling bar, flag-and-replace. **English / हिंदी / ಕನ್ನಡ.** |
| **`/officer/[code]`** | Demo affordance: open a document and watch the citizen view change live |
| **`/locker`** | Your documents and how they connect — shared address, shared phone, mismatches |
| **`/access`** | Who has opened your documents; blocked and unusual access surfaced; revoke a code |
| **`/insights`** | Department + public dashboard: per-step turnaround, queue vs handling, bottlenecks |
| **`/whats-real`** | Honesty page — exactly what works and what is mocked |

### Demo codes (no login, pre-filled on the landing page)

- `TRL-4K9-2XQ` — a live post-matric scholarship, currently stuck at step 6
- `TRL-7M2-8VB` — an application that **needs action** (a flagged document to replace)

**To see the architecture work:** open `/officer/TRL-4K9-2XQ` in one tab, open the Class 12 marksheet, then reload `/track/TRL-4K9-2XQ` in another tab. The status moved — and nobody clicked "verified."

---

## Run it locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). No database or API key is required — state lives in server memory and ships pre-seeded, with a **Reset demo** control on `/whats-real`.

The optional `OPENAI_API_KEY` powers one thing only — a plain-language rewrite on the guided journey. Without it, everything falls back to deterministic logic and nothing breaks.

```bash
npm test      # 27 tests: derivation, consistency, insights, no-AI journey
npm run build # types + production build
```

> Tip: don't run `npm run build` while `npm run dev` is live — the build clobbers the dev server's `.next` cache. Restart dev after building.

---

## Architecture

```
/lib/trail
  derive.ts        deriveStepStatus + waiting/handling/SLA maths   ← pure, no DB
  insights.ts      per-step medians across all applications        ← computed, not stored
  consistency.ts   pre-submission checks with consequences
  anomaly.ts       access rules that surface unusual access
  i18n.ts          EN / HI / KN strings for the track screen
  store.ts         in-memory state + share-code / application creation
  seed.ts          citizen, 2 schemes, 20 applications (2 real + 18 synthetic)
/app
  track|officer|apply|journey|locker|access|insights|whats-real
  api/trail/*      the instrumented fetch, verify, flag, sharecode, replace, reset
```

`derive.ts` is **pure functions with no database calls** — input: step config + event array, output: a status object. That's what makes "status is computed" demonstrable to a technical judge rather than merely asserted, and it's guarded by tests. There is deliberately **no `status` column** anywhere in the data model.

**Tech:** Next.js 14 (App Router, TypeScript, server components) · Tailwind CSS · Vitest. `/track` is server-rendered with no client data fetching, so it works on slow connections and even with JavaScript off.

---

## What's real vs mocked (short version — full list on `/whats-real`)

**Real:** the event engine, status derivation, the waiting/handling split, share-code creation / expiry / revocation / open-limits, consistency checks, the insights medians, the access log, and the document-connection graph — all computed from synthetic data by real code.

**Mocked:** DigiLocker (a local look-alike; the real service is never contacted), all identities and reference numbers (invented, never real ID formats), the officer login (a demo affordance), storage (server memory), and submissions (nothing goes to any department).

**Deliberately *not* claimed:** rate limiting *surfaces* unusual access — it does not prevent a first-time misuse of a leaked document, and the copy never says otherwise.

---

## Built with Codex

Per the hackathon brief, an OpenAI-based coding agent (Codex) did real work here — the derivation engine and its tests, the consistency rule set, the synthetic-application generator behind `/insights`, and the timeline component. See [`AGENTS.md`](AGENTS.md) for the invariants it was held to, and [`docs/CONTEXT.md`](docs/CONTEXT.md) for the full specification. An OpenAI model powers the guided journey's plain-language rewrite (non-critical path, deterministic fallback).

The problem framing is written up in [`docs/ESSAY.md`](docs/ESSAY.md).
