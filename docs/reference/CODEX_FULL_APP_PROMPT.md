# Codex prompt — full app

*Attach `FULL_APP_SPEC.md`. Paste the block below. Run tasks one at a time.*

---

## Opening prompt

```
Read the attached FULL_APP_SPEC.md. It is the source of truth. Build
only what it lists. Do not add features.

WHAT WE ARE BUILDING
A web app for a hackathon (Build What Moves India). An Indian citizen
logs in with a simulated OTP, lands on a home screen showing their
masked identity card, and can see: what is wrong with their government
records right now, what is connected to their Aadhaar, who has recently
verified them, and their documents. The core capability is finding
contradictions between records before they cause an application to be
rejected.

WHY IT MATTERS
Indian government applications get rejected because the same person's
name or father's name differs by a letter between documents. A
scholarship is marked defective six weeks after submission over
"Rajeev" vs "Rajiv". The check is computable at submission time and
nothing does it today. The app makes the contradiction visible before
it costs anyone money.

STACK
Next.js 14 App Router, TypeScript, Tailwind. No database, no real auth,
no localStorage. Session state in React context only. One API route for
the AI explain wrapper. Deploy to Vercel as a public URL that opens with
no access request.

HARD CONSTRAINTS — breaking any of these fails the submission
1. NO typeable field for Aadhaar, PAN, OTP, password or payment details
   anywhere in the app. The login phone and OTP fields are pre-filled
   and readOnly. An empty box that looks like an ID field invites
   someone to type a real one — that is the risk we are removing.
2. Masked identity values (name, address, DOB) must be ABSENT FROM THE
   DOM until the user unlocks with the PIN. Gate them behind React
   state, never behind CSS blur, opacity or filter. A reviewer opening
   devtools must not find them.
3. Never render a full Aadhaar number, even a synthetic one. Last four
   digits only, always.
4. NO completion score, progress bar, percentage, or "all clear"
   celebration state anywhere. Counts are fine ("3 things need your
   attention"). A score turns this into a funnel pushing people to link
   things the law does not require. Do not add one even if it seems
   like good UX.
5. Every record shows its Required classification: mandatory,
   conditional, required, voluntary, or "—". Every issue, rule and
   linkage carries a source citation. Add a test that fails the build
   if any source.instrument is empty. NEVER invent an act, section
   number, notification date or statutory deadline — use
   "TODO_CITATION" and list them for me at the end.
6. Deterministic code decides everything. The OpenAI model only
   rewrites already-computed text into plain language, with a 3s
   timeout and a hardcoded fallback. The app must work fully with the
   API key unset. Write a test for this.
7. Nothing persists. No database, no localStorage, no cookies.
8. No government logos or emblems. Persistent banner on every screen:
   "Independent prototype — synthetic data".
9. Mobile-first. Fully usable at 360px width on a slow connection. No
   horizontal scroll at any width, no hidden columns.

TONE
Plain language, short sentences, no jargon, written for someone with
limited digital experience. Never write "you are eligible" — write
"this rule requires X; your record says Y". Where a problem has a real
cost, say the number: "₹47,000 not received" lands, "2 blocked items"
does not.

HOW TO WORK
One task at a time. Show me the diff and wait. All logic lives in /lib
as pure functions — screens contain no business logic. Ask when a
product decision is ambiguous. Do not invent government rules,
thresholds or citations to fill a gap.
```

---

## Tasks

**Task 1 — Types, session, seed data**
> Implement the types in spec section 8 plus the P0 types. Build the session context (`citizenId`, `revealed`, never persisted). Create `demo-priya` and `demo-arun` exactly as specified in section 9 — the issues in that order, the records producing that exact table, the activity entries, the documents. Every name and number obviously fictional. Add the citation validator that fails the build on an empty `source.instrument`.

**Task 2 — Login**
> `/` with the simulated flow from section 2. Phone and OTP fields pre-filled and `readOnly`. Two taps to enter. "Skip to demo" link. The `simulated login · no real Aadhaar or OTP is used` line. Verify sets `citizenId` and routes to `/home`.

**Task 3 — Home and reveal**
> `/home` with the masked identity card. Re-read constraint 2 before building this: the real name, address and DOB must not be in the DOM until unlock. PIN pad (demo PIN `1234`, hinted on screen), wrong PIN shows an inline error with no lockout, "Forgot PIN" runs the same simulated OTP pattern. Add a "Hide again" control. Below the card: the issues count strip, three tap targets, and section links.

**Task 4 — Issues**
> `/issues` with the six issue types from section 4, sorted by severity, each showing what is wrong, what it costs, one action, and its citation. "Report" produces a tracked reference with a status — never a bare helpline number.

**Task 5 — Records table**
> `/records` per section 5. Four columns at ≥768px, two lines per row below that. Fixed sort order: blocked, wrong, expired, clear, unknown, optional — never alphabetical, never user-sortable. Row expansion showing both contradicting values, the cascade sentence computed by `cascade()` (never hardcoded), and the rule with its citation. Only one row open at a time, no modals.

**Task 6 — Honesty page**
> `/real` rendered from a config object listing every capability as real or mocked with a reason, so it cannot drift from the implementation.

**Task 7 — Activity and documents**
> `/activity` translating agency codes into sentences, each entry with Recognise / Don't recognise, where "don't recognise" creates an issue with a reference. State plainly that this shows who verified you, not what is linked to you. Then `/documents` with issuer, dates, provenance badge (issued = issuer-signed, uploaded = a scan with no verified status), and an outbound "Open in DigiLocker" link. Do not build a document viewer.

**Task 8 — AI layer and ship**
> The explain wrapper with the 3s timeout and hardcoded fallback, plus the test proving the app works with the key unset. Then the 360px pass, Vercel config with no auth, and run the definition-of-done checklist in section 12. Report which items fail before fixing anything.
