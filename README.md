# Milaan

Milaan is a responsive, mobile-first citizen record safety prototype for the **Build What Moves India** hackathon. It uses fictional local data to show record differences, benefit-routing concerns, document state and a verification log before a citizen applies.

> Independent prototype — synthetic data. Milaan does not connect to or represent any government system.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Login is simulated with the read-only sample phone and OTP; no real identity or authentication data is accepted. The optional `OPENAI_API_KEY` is not required. Without it, all decisions and explanations use deterministic local logic.

## Current routes

- `/` — two-step simulated login and demo shortcut
- `/home` — privacy-safe identity reveal and attention summary
- `/issues` — ordered concerns, citations and in-memory reporting
- `/records` — deterministic status order, comparisons and correction cascade
- `/activity` — fictional verification history and recognition choices
- `/documents` — issuer, validity, provenance and wallet availability
- `/bundle` — time-limited, self-contained officer bundle
- `/real` — clear capability and limitation disclosure

## Verify

```bash
npm test
npm run build
```

Tests cover conflict detection, citation presence, correction-cascade immutability, required profile data and a complete no-AI-key journey.

## Privacy and architecture

- Next.js 14 App Router and TypeScript.
- Session and reports exist only in React memory; there is no database, cookie, browser storage or persistence.
- Aadhaar is represented only by its final four synthetic digits. Name, address and date of birth are not rendered until the user enters the demo PIN.
- Phone and OTP controls are prefilled and read-only. There are no typeable Aadhaar, PAN, password or payment controls.
- `/lib/engine` contains pure deterministic functions. AI can only rewrite an explanation and has a three-second local fallback.
- Citations are required by validation. Unknown official policy is marked `TODO_CITATION` instead of being invented.

The full source brief is preserved in [`docs/reference/FULL_APP_SPEC.md`](docs/reference/FULL_APP_SPEC.md) and [`docs/reference/CODEX_FULL_APP_PROMPT.md`](docs/reference/CODEX_FULL_APP_PROMPT.md). Earlier P0 and P1 reference files remain under `docs/reference` for traceability.

## Known external checks

- `TODO_CITATION` entries must be replaced with confirmed official scheme sources before presenting the prototype as policy guidance.
- Public deployment and an incognito test on a real phone using mobile data remain manual release checks.
- The brief requires Next.js 14. The app builds with the latest 14.x release, but that major is outside current support and should be upgraded after the hackathon constraint is removed.

This working copy is local only. It has not been pushed back to the emptied GitHub repository.
