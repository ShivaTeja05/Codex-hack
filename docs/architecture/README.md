# Milaan — feature architecture

One document per feature. Each is written so it can be built without reading
the others, and each ends with the integration a department would have to
expose for the feature to stop being a mock.

Read `00-system-architecture.md` last: it is the only document that describes
how the features compose.

| # | Feature | Route | Status |
|---|---|---|---|
| 01 | [Linkage map](01-linkage-map.md) | `/map` | Built |
| 02 | [Verification log](02-verification-log.md) | `/activity` | Built (mock data) |
| 03 | [Record consistency & pre-submission check](03-consistency-check.md) | `/check` | Built |
| 04 | [Contact surface](04-contact-surface.md) | — | Specified |
| 05 | [Document bundle & officer review](05-document-bundle.md) | `/bundle` | Partial |
| 06 | [Benefit routing & DBT reasons](06-benefit-routing.md) | `/money` | Built |
| 07 | [Access receipts & turnaround](07-access-receipts.md) | — | Specified |
| 00 | [System architecture](00-system-architecture.md) | — | — |

## Status vocabulary

- **Built** — works in the deployed prototype against synthetic data.
- **Partial** — the citizen half works; the counterparty half is specified.
- **Specified** — designed and typed, not implemented.

Nothing in this repository claims a status it does not hold. The same
vocabulary drives `/real`, which is rendered from `lib/seed/capabilities.ts`
so the disclosure cannot drift from the code.

## Rules every feature obeys

1. **Cite or don't show.** Every rule, obligation and linkage carries the
   instrument it comes from. No citation, no render.
2. **Deterministic decides, AI explains.** Eligibility, conflicts, ordering and
   validation are pure typed functions. A model may only rewrite computed
   output. The app works fully with no API key set.
3. **Pass-through, never store.** No database. Session state only.
4. **Never adjudicate.** Output is always *"this rule requires X; your record
   says Y."*
5. **No completion score.** Counts are fine. A score turns a correction tool
   into a funnel.
6. **Classify every linkage.** Mandatory / conditional / voluntary, each cited.
7. **No dead ends.** Every terminal state has a next action.
8. **Pull is surveillance, push is service.** No officer search or browse.
