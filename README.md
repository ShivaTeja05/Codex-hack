# Milaan

Milaan is a responsive, mobile-first Phase 0 prototype for the **Build What Moves India** hackathon. It checks the same fields across fictional records, names the differences that may block a post-matric scholarship check, ranks the first fix, and creates a scoped read-only bundle. The same journey adapts from compact phones to tablets, laptops and wide desktop screens.

> Independent prototype — synthetic data. Milaan does not connect to or represent any government system.

## Run it

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. The optional `OPENAI_API_KEY` is not required. Without it, all decisions and explanations use deterministic local logic.

## Verify it

```bash
npm test
npm run build
```

The required tests cover spelling-sensitive conflict detection, non-empty rule sources, and the complete journey with the model key removed.

## Architecture

- Next.js 14 App Router, TypeScript and Tailwind.
- React context holds session state in memory. There is no database, auth, `localStorage` or `sessionStorage`.
- `/lib/engine` contains pure deterministic functions with no React or network imports.
- `/lib/mock/walletAdapter.ts` exposes two clearly fictional local profiles.
- `/api/explain` can rewrite deterministic text with a three-second timeout. It cannot decide a conflict, rule result, rank or citation.
- The officer bundle route decodes a self-contained base64url payload. It performs no lookup and lists no other bundles.

The attached build source is preserved in [`docs/reference/P0_BUILD.md`](docs/reference/P0_BUILD.md), [`docs/reference/architecture.mermaid`](docs/reference/architecture.mermaid), and [`docs/reference/CODEX_P0_PROMPT.md`](docs/reference/CODEX_P0_PROMPT.md).

## Intentional P0 modelling decision

The supplied type model did not include the scholarship form even though the seed specification requires comparing its bank account with the connected bank record. `RecordSource` therefore adds `applicationForm`. It is seeded, synthetic, read-only and is not a new user input.

## Citation gaps — do not ship as verified policy

No legal instrument was invented. These configured sources remain `TODO_CITATION` until the official scheme rules are confirmed:

- `eligibility.income`
- `eligibility.category`
- `document.required`
- `document.validity`
- the 30-day SLA source

The four rule citations are deliberately visible in the eligibility screen. The non-empty-source validator passes, while the P0 definition-of-done item requiring no rendered `TODO_CITATION` remains open.

## Definition of done status

| Item | Status |
| --- | --- |
| Public phone URL opens without login | Pending deployment and real-device check |
| Both demo citizens complete the journey | Passed in browser automation |
| Every visible control works | Passed for the complete journey |
| All three required test files pass | Passed |
| Journey works without `OPENAI_API_KEY` | Passed |
| No rendered `TODO_CITATION` remains | Open — official sources required |
| Banner is visible on every screen | Passed |
| No Aadhaar, PAN, OTP, password or payment input exists | Passed by source scan |
| Incognito on a real phone using mobile data | Pending manual device check |

Responsive browser checks pass at 360×800, 768×900, 1280×800 and 1440×900 with no horizontal overflow.

## Dependency note

The P0 brief requires Next.js 14. The latest 14.x release used here builds correctly, but current npm advisories still flag the unsupported major line. The app does not use image optimization, middleware, rewrites or Server Actions, which removes several affected surfaces. Move to a supported patched Next.js major immediately after the judged P0 unless the event rules require version 14 exactly.
