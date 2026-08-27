# Build Spec — Full app

*Replaces earlier screen specs. Engine, rules, types and seed data from P0 carry over unchanged.*

---

## 1. Routes

| Route | Screen | Priority |
|---|---|---|
| `/` | Simulated login (phone → OTP) | P0 |
| `/home` | Identity card + issues + quick sections | P0 |
| `/records` | Records table — what's connected, what disagrees | P0 |
| `/issues` | Problems with your Aadhaar | P0 |
| `/activity` | Who checked your details | P1 |
| `/documents` | Document list, opens out to DigiLocker | P1 |
| `/bundle` | Share code + QR + expiry | P1 |
| `/real` | What's real, what's mocked | P0 |

---

## 2. `/` — Simulated login

**Nothing is typeable. Two taps to get in.**

- Phone field: pre-filled `98••••••32`, `readOnly`, with a "sample data" chip
- "Send OTP" button
- OTP boxes: pre-filled `123456`, `readOnly`
- "Verify" button
- "Skip to demo" link below
- Small line: `simulated login · no real Aadhaar or OTP is used`

**Why read-only:** an empty phone or Aadhaar box invites someone to type a real one. That is the actual risk, and read-only removes it.

Verify sets `citizenId` in session context and routes to `/home`.

---

## 3. `/home` — Identity card, masked by default

### The card, locked state

```
Aadhaar          XXXX XXXX 4417
Name             hidden
Address          hidden
Date of birth    hidden
                          [ Reveal ]
```

Only the last four digits show. Everything else renders as a muted `hidden` — not blurred text, not a CSS filter. **The real values must not exist in the DOM until unlock**, or "hidden" is theatre a reviewer can defeat with devtools. Gate them behind state, not styling.

### Unlock

- Tap Reveal → 4-digit PIN pad. Demo PIN is `1234`, shown as a hint on screen.
- Wrong PIN → inline error, no lockout.
- "Forgot PIN" → simulated OTP to the masked number, same pre-filled read-only pattern as login.
- Unlocked state lasts for the session only. Never persisted.
- Once unlocked, show a "Hide again" control.

### Below the card

Three things, in this order:

1. **Issues strip** — `3 things need your attention`, tapping goes to `/issues`
2. **What you can do** — three tap targets: *Applying for a scholarship* / *Money didn't arrive* / *Just show me my records*
3. **Sections** — Records · Issues · Activity · Documents

**No score, no progress bar, no percentage anywhere.** Counts only.

---

## 4. `/issues` — Problems with your Aadhaar

One list, sorted by severity. Each issue is a card with: what's wrong, what it's costing, and one action.

| Issue type | Example detail | Action |
|---|---|---|
| `unknown_sim` | A connection you don't recognise | Report it |
| `sim_suspended` | Registered number no longer active | How to update |
| `mismatch` | Father's name differs across two records | See the fix |
| `expired` | Certificate lapsed 4 months ago | How to renew |
| `wrong_routing` | Benefits routed to an unused account | How to reseed |
| `lapsing` | Re-KYC due in 11 days | What to do |

Every issue carries the rule or provision it comes from. Reporting produces a tracked reference with a status — never a bare helpline number.

---

## 5. `/records` — The table

Unchanged from the table spec.

**Desktop ≥768px:** four columns — Connected to | What it says | Required | Status
**Mobile <768px:** two lines — name + badge, then detail · required class

**Fixed sort:** blocked → wrong → expired → clear → unknown → optional. Never alphabetical.

**Row expansion** shows: both contradicting values with their sources; the cascade sentence computed by `cascade()`; the action plus the rule and citation.

Statuses: Blocked, Wrong, Expired, Clear, Optional, Unknown. The `Required` column always renders including `Voluntary` and `—`.

---

## 6. `/activity` — Who checked your details

A log, not a dashboard. Each entry: who, when, what they verified, and whether the citizen recognises it.

- Translate agency codes into a sentence: *a telecom operator verified you on 3 August*
- Each entry gets **Recognise** / **Don't recognise**
- "Don't recognise" creates an issue on `/issues` with a reference and a status
- State plainly that this shows *who verified you*, not *what is linked to you* — those are different things and the distinction is the point

---

## 7. `/documents` — Wallet passthrough

List of documents with issuer, issue date, expiry, and a provenance badge.

- **Issued** (green) = issuer-signed, legally at par with the original
- **Uploaded** (grey) = a scan, carries no verified status

Each row has "Open in DigiLocker" — an outbound link, not an embedded viewer. Documents in progress or applied-for render with a `pending` state.

**Do not build a document viewer.** You cannot legally fetch the real file, and a link is honest about who owns it.

---

## 8. Data model additions

```ts
interface Session {
  citizenId: string;
  revealed: boolean;          // session only, never persisted
}

interface IdentityCard {
  aadhaarLast4: string;       // "4417" — never a full number, even synthetic
  name: string;
  address: string;
  dob: string;
}

interface Issue {
  id: string;
  type: 'unknown_sim' | 'sim_suspended' | 'mismatch'
      | 'expired' | 'wrong_routing' | 'lapsing';
  severity: 'high' | 'medium' | 'low';
  title: string;
  detail: string;
  cost?: string;              // "₹47,000 not received" — use where true
  action: { label: string; href?: string };
  source: Citation;           // REQUIRED
}

interface AuthEvent {
  id: string;
  agency: string;             // plain language, not a code
  when: string;
  purpose: string;
  recognised?: boolean;
}

interface WalletDoc {
  source: RecordSource;
  label: string;
  issuer: string;
  provenance: 'issued' | 'uploaded';
  state: 'available' | 'pending' | 'applied';
  issuedOn: string;
  validUntil?: string;
  digilockerUrl: string;      // outbound link
}
```

---

## 9. Seed data — `demo-priya`

**Identity:** Aadhaar ending `4417`, name Priya Sharma, an address, a DOB. All obviously fictional. PIN `1234`.

**Issues, in order:**
1. `wrong_routing` — benefits routed to an account last used in 2022, cost `₹47,000 not received`
2. `mismatch` — father's name `Rajeev` on Aadhaar vs `Rajiv` on the income certificate
3. `unknown_sim` — one connection she doesn't recognise
4. `expired` — caste certificate lapsed 4 months ago

**Records table** produces exactly: income certificate (blocked) → bank (wrong) → caste certificate (expired) → PAN (clear) → land record (unknown) → voter roll (optional)

**Activity:** 4 entries, one of which is the unrecognised telecom check

**Documents:** 3 issued, 1 uploaded, 1 pending

`demo-arun` is clean except one unknown and one optional.

---

## 10. Hard rules

1. No typeable field for Aadhaar, PAN, OTP, password or payment anywhere. All demo inputs are `readOnly` and pre-filled.
2. Hidden identity values are **absent from the DOM** until unlock. State-gated, never CSS-gated.
3. Full Aadhaar numbers never appear, even synthetic ones. Last four digits only.
4. No completion score, progress bar, percentage or "all clear" celebration state.
5. `Required` classification renders on every record: mandatory / conditional / required / voluntary / —, each with a citation.
6. Every issue, rule and linkage carries `source.instrument`. Build fails if any is empty. `TODO_CITATION` where unknown — never invent an act, section or date.
7. Deterministic code decides everything. AI only rewrites computed text, 3s timeout, hardcoded fallback. App works fully with the key unset.
8. Nothing persists. No database, no localStorage. Session state only.
9. No government logos or emblems. Persistent banner: *Independent prototype — synthetic data*.
10. Mobile-first. Usable at 360px on a slow connection. No horizontal scroll.

---

## 11. Build order

1. Session context, identity card with PIN reveal, `/` login
2. `/home` — card, issues strip, three tap targets, section links
3. `/issues` — the list with actions
4. `/records` — table, desktop then mobile breakpoint
5. `/real` — honesty page from a config object
6. `/activity`, `/documents`, `/bundle`
7. 360px pass, deploy, incognito test on a real phone

**Cut line:** steps 1–5 are the submission. Step 6 is bonus. If `/records` and `/issues` work end to end with the reveal flow, you have a complete product.

---

## 12. Definition of done

- [ ] Two taps from landing to `/home`; "Skip to demo" also works
- [ ] Reveal requires the PIN; hidden values absent from DOM until unlocked
- [ ] Wrong PIN shows an inline error, no lockout
- [ ] Aadhaar shows last four digits only, everywhere
- [ ] `/issues` sorted by severity, each with an action and a citation
- [ ] `/records` correct at 360px and 1280px, correct sort order
- [ ] Row expansion shows the computed cascade sentence
- [ ] No score, progress bar or percentage in the codebase
- [ ] No typeable ID/OTP field anywhere
- [ ] Journey completes with the OpenAI key unset
- [ ] Banner on every screen
- [ ] Tested in incognito on a real phone
