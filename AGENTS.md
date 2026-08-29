# AGENTS.md

Read `docs/CONTEXT.md` before any task. It is the full specification for Nagrik Trail.

## Build order
`lib/trail/derive.ts` → `lib/trail/types.ts` + `lib/trail/seed.ts` → `app/api/trail/doc` endpoint → `/track` → `/officer` → consistency + apply + insights + journey → honesty page.

## Non-negotiable invariants
- **Never add a `status` column to `ApplicationStep`.** Status is derived from the event stream by pure functions in `lib/trail/derive.ts`. See CONTEXT.md §7. Tests in `tests/` guard this.
- **Never generate a 12-digit ID number**, and never use the word "Aadhaar number". References use the masked `MOCK-ID-•••• 4417` format. See CONTEXT.md §13.
- A document is only ever rendered at the end of a **logged fetch** (`/api/trail/doc/[code]/[docId]`). There is no code path that shows a document without writing an event.
- Insights medians are **computed**, never stored. `lib/trail/insights.ts` aggregates the same timestamps the citizen page uses.
- The string "Under Process" appears exactly once, struck through, on the landing page — nowhere else.

## Where OpenAI powers the product
`/journey` → `POST /api/explain` → `lib/ai/explain.ts`. One model call, non-critical path, 3-second timeout, deterministic fallback if no `OPENAI_API_KEY`. Only broad band answers are ever sent — never document contents or anything resembling personal data.

## Verify before shipping
```bash
npm test          # derivation, consistency, insights, no-AI journey
npm run build     # types + production build
```
