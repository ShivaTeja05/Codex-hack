# CONTEXT.md — OpenTrail

**Read this fully before writing any code. Follow it exactly. Do not add features that are not listed here.**

This file is the single source of truth for the build. If something is ambiguous, pick the option that makes the citizen journey work end to end, and write down what you assumed in `/whats-real`.

---

## 0. Deadline and scope discipline

Submission closes **10:00 PM IST, 29 August 2026**. There is no grace period.

This is not a "build everything" plan. It is a plan to ship one journey that works completely.

**The cut line.** If you are running out of time, ship P0 only. A P0-only build that works beats a P0+P1 build that breaks on the reviewer's phone. Reviewers open a link, tap through, and judge. Anything that errors is worth zero.

| Priority | What | Ship if you have |
| --- | --- | --- |
| **P0** | Event engine, share code, track page, officer review page, honesty page, seed data | 3 hours |
| **P1** | Document wallet + mismatch checks, access log + rate limits | 5 hours |
| **P2** | Guided journey (OpenAI-powered), department insights dashboard, second scheme | 7+ hours |

---

## 1. What we are building, in one paragraph

Indian government portals show one label — "Under Process" — for weeks. Nobody is hiding anything; the process just does not produce data. Existing status systems fail because they need an officer to manually click "mark as done," and officers do not. **So we instrument the document, not the officer.** Documents are never attached as files. They are fetched live from a mock DigiLocker through a single share code, and every fetch, open, re-open, verification and flag becomes a timestamped event. Application status is then *derived* from that event stream instead of being *declared* by a human. One stream gives the citizen a real status, gives the department true turnaround time per step per office, and gives everyone an access log showing who looked at their documents.

**Say this out loud once so you hold it while building: status is a computed value, not a database column an officer sets.**

---

## 2. Hard rules from the hackathon brief

These are non-negotiable. Breaking any of them can disqualify the entry.

**Must do**
- The prototype must be **built with Codex** as a meaningful part of the process, or powered by an OpenAI model. We do both (see §16).
- One **live public link** that opens in a browser with **no access request**. No login wall the reviewer can't pass. Include mock credentials on the landing page itself.
- The **main journey must work start to finish**. Not a static mockup.
- Designed for **real Indian users**: mobile first, slow connections, low digital literacy.
- **All data mock or synthetic.**
- **Clearly disclose** what works and what is mocked.

**Must not do**
- Do **not** touch, call, scrape or test any live government system, including real DigiLocker, UIDAI, NSP, or any state portal. Everything is a local mock.
- Do **not** use real Aadhaar numbers, PAN, OTPs, payment details or health data. Not even in a code comment.
- Do **not** use government logos (no Ashoka emblem, no Digital India logo, no state emblems, no DigiLocker logo). Not in the UI, not in the video.
- Do **not** present this as official. Every page carries the disclaimer in §17.
- Do **not** ship anything that looks like a real ID number. Aadhaar-format numbers are forbidden even if fake. Use the format in §13.

**How it is judged.** Six criteria: Problem, Working build, Usability, Product thinking, End-to-end thinking, Honesty. Note that **Honesty is a scored criterion** — the `/whats-real` page is not optional politeness, it earns points. And **End-to-end thinking** explicitly asks about backend, infrastructure and process, not just interface — that is what §7 and §20 are for.

---

## 3. The core technical idea

Read this section twice. Everything else is plumbing around it.

### 3.1 The problem with existing status
```
Officer finishes work  →  Officer remembers to open portal  →  Officer clicks "Verified"  →  Status updates
                                        ↑
                              this step never happens
```

### 3.2 What we do instead
```
Officer opens the document to do their job  →  the open IS the event  →  status updates
                                                        ↑
                              nobody has to remember anything
```

The insight borrowed from email tracking: a tracking pixel reports when a mail was opened without the sender doing extra work. The act of consuming the content is itself the signal. We apply the same principle to document verification.

### 3.3 How this is implemented concretely

Documents are **never** sent as attachments or static files. An officer reviewing an application gets a share code. Opening it calls a tokenised endpoint:

```
GET /api/doc/:shareCode/:documentId
```

That endpoint does four things, in order:
1. Validates the share code (not expired, not revoked, under open limit)
2. **Writes a `DocEvent`** with actor, timestamp, purpose, application step
3. Runs the anomaly check (§9)
4. Streams the rendered document

Because the document only exists at the end of a logged fetch, **there is no way to view a document without producing an event.** That is the whole architecture. Write it in the video script.

### 3.4 The one metric that makes this valuable

For every step we can now split time into two parts that no current system separates:

- **Waiting time** = `firstOpenedAt − enteredAt` → the file sat in a queue, untouched
- **Handling time** = `completedAt − firstOpenedAt` → an officer was actually working on it

This matters because a department told "your step takes 9 days" cannot act. A department told "8 of those 9 days are queue time before anyone opens the file, so you have a staffing problem, not a training problem" **can** act. Surface this split prominently on the insights page and say it in the video.

---

## 4. Tech stack

Pick these. Do not deliberate.

| Layer | Choice | Why |
| --- | --- | --- |
| Framework | **Next.js 15, App Router, TypeScript** | Server components keep JS payload small for slow connections |
| Styling | **Tailwind CSS** | Speed |
| DB | **Postgres on Neon** (free tier) via **Prisma** | Serverless-safe. SQLite will not persist on Vercel. |
| Hosting | **Vercel** | Public link in one command |
| AI | **OpenAI API** (`gpt-4o-mini`) for the guided journey only | Cheap, fast, non-critical path |
| Fonts | IBM Plex Sans, IBM Plex Mono, IBM Plex Sans Devanagari, Noto Sans Kannada | Self-hosted via `next/font` |

**Fallback if Neon setup eats time:** use a single seeded JSON file plus a server-side in-memory store, and add a visible "Reset demo" button. State resetting on cold start is acceptable *if* the reset button exists and `/whats-real` says so. Prefer Neon.

**Performance budget.** Track page must render under 2s on simulated 3G. No client-side data fetching on the track page — render it server-side. Total JS under 100KB on `/track`.

---

## 5. File structure

```
/app
  /page.tsx                       Landing + demo credentials
  /journey/page.tsx               Guided journey (P2)
  /locker/page.tsx                Document wallet + graph + mismatches (P1)
  /apply/[schemeId]/page.tsx      Pick docs → checks → generate share code (P0)
  /track/page.tsx                 Enter code (P0)
  /track/[code]/page.tsx          THE HERO SCREEN (P0)
  /access/page.tsx                Who accessed my documents (P1)
  /officer/[code]/page.tsx        Officer review pane (P0, demo affordance)
  /insights/page.tsx              Department + public dashboard (P2)
  /whats-real/page.tsx            Honesty disclosure (P0)
  /api
    /doc/[code]/[docId]/route.ts  The instrumented fetch endpoint
    /events/route.ts              Event write + read
    /verify/route.ts              Officer verify action
    /flag/route.ts                Officer flag action
    /sharecode/route.ts           Create / revoke
    /journey/route.ts             OpenAI call (P2)
    /reset/route.ts               Reseed demo
/lib
  /derive.ts                      deriveStepStatus + TAT maths  ← core logic
  /consistency.ts                 Mismatch rules
  /anomaly.ts                     Rate limit rules
  /seed.ts                        Seed data
  /db.ts                          Prisma client
/prisma/schema.prisma
```

Keep `derive.ts` as **pure functions with no DB calls**. Input: step config + event array. Output: status object. This makes it testable and makes the "status is computed" claim demonstrable to a technical judge.

---

## 6. Data model

```prisma
model Citizen {
  id            String   @id @default(cuid())
  name          String
  mockLockerId  String   @unique        // format: "MOCK-LOCKER-0001"
  phoneMasked   String                  // "90XXXXXX01"
  dob           DateTime
  documents     Document[]
  applications  Application[]
  shareCodes    ShareCode[]
}

model Document {
  id          String   @id @default(cuid())
  ownerId     String
  owner       Citizen  @relation(fields: [ownerId], references: [id])
  docType     String   // see enum list below
  issuer      String   // "Mock Issuing Authority - Education"
  issuedOn    DateTime
  refMasked   String   // "MOCK-ID-•••• 4417"  NEVER Aadhaar-shaped
  source      String   // DIGILOCKER_MOCK | UPLOADED_SCAN
  fields      Json     // { name, dob, address, pincode, phone, fatherName }
  events      DocEvent[]
}

model Scheme {
  id           String @id
  name         String
  department   String
  state        String
  plainSummary String            // one sentence, 8th-grade reading level
  steps        WorkflowStep[]
}

model WorkflowStep {
  id               String @id @default(cuid())
  schemeId         String
  scheme           Scheme @relation(fields: [schemeId], references: [id])
  order            Int
  name             String        // internal: "Marksheet verification"
  plainName        String        // citizen-facing: "Checking your Class 12 marksheet"
  officeName       String        // "District Education Office, Kalaburagi"
  officeId         String
  slaDays          Int
  requiredDocTypes String[]
}

model Application {
  id          String   @id @default(cuid())
  citizenId   String
  schemeId    String
  shareCodeId String?
  submittedAt DateTime
  steps       ApplicationStep[]
  events      DocEvent[]
}

model ApplicationStep {
  id             String    @id @default(cuid())
  applicationId  String
  workflowStepId String
  enteredAt      DateTime?
  firstOpenedAt  DateTime?
  completedAt    DateTime?
  // NOTE: no `status` column. Status is derived. This is deliberate.
}

model ShareCode {
  id            String   @id @default(cuid())
  code          String   @unique   // "TRL-4K9-2XQ"
  citizenId     String
  applicationId String?
  purpose       String             // "Post-matric scholarship application"
  docIds        String[]
  createdAt     DateTime @default(now())
  expiresAt     DateTime
  revokedAt     DateTime?
  maxOpens      Int      @default(50)
}

model DocEvent {
  id            String   @id @default(cuid())
  ts            DateTime @default(now())
  eventType     String
  documentId    String?
  applicationId String?
  stepId        String?
  shareCodeId   String?
  actorType     String   // CITIZEN | OFFICER | SYSTEM | UNKNOWN
  actorLabel    String   // "District Education Office, Kalaburagi"
  actorOfficeId String?
  meta          Json     // { dwellMs, comment, reason, deniedReason }
}

model Flag {
  id             String    @id @default(cuid())
  documentId     String
  applicationId  String
  stepId         String
  officerLabel   String
  reason         String    // ILLEGIBLE | MISMATCH | EXPIRED | WRONG_DOC
  comment        String
  createdAt      DateTime  @default(now())
  resolvedAt     DateTime?
  replacementDocId String?
}
```

**Document types:** `MOCK_ID`, `MOCK_PAN`, `MARKSHEET_10`, `MARKSHEET_12`, `INCOME_CERT`, `CATEGORY_CERT`, `DOMICILE_CERT`, `RATION_CARD`, `BANK_PASSBOOK`

**Event types:** `SHARE_CODE_CREATED`, `SHARE_CODE_OPENED`, `DOC_FETCHED`, `DOC_OPENED`, `DOC_REOPENED`, `DOC_VERIFIED`, `DOC_FLAGGED`, `DOC_REPLACED`, `STEP_ENTERED`, `DECISION_MADE`, `ACCESS_DENIED_RATE_LIMIT`, `SHARE_CODE_REVOKED`

---

## 7. The derivation engine (`lib/derive.ts`)

This is the most important file in the repo. Write it first, before any UI.

```ts
type StepStatus =
  | 'NOT_STARTED'   // file has not reached this step
  | 'WAITING'       // reached the office, nobody has opened it
  | 'IN_REVIEW'     // an officer has opened at least one required document
  | 'ACTION_NEEDED' // a required document is flagged and unresolved
  | 'DONE';         // every required document has a verify event

function deriveStepStatus(step, stepInstance, events, flags): StepStatus {
  const stepEvents = events.filter(e => e.stepId === stepInstance.id);
  const openFlags  = flags.filter(f => f.stepId === stepInstance.id && !f.resolvedAt);

  if (!stepInstance.enteredAt) return 'NOT_STARTED';
  if (openFlags.length > 0)    return 'ACTION_NEEDED';

  const verified = new Set(
    stepEvents.filter(e => e.eventType === 'DOC_VERIFIED').map(e => e.documentId)
  );
  const allVerified = step.requiredDocTypes.every(t =>
    [...verified].some(id => docTypeOf(id) === t)
  );
  if (allVerified) return 'DONE';

  const opened = stepEvents.some(e =>
    e.eventType === 'DOC_OPENED' || e.eventType === 'DOC_REOPENED'
  );
  return opened ? 'IN_REVIEW' : 'WAITING';
}
```

**Timing functions — implement all of these:**

```ts
waitingMs(s)   = (s.firstOpenedAt ?? now) - s.enteredAt        // queue time
handlingMs(s)  = s.firstOpenedAt ? (s.completedAt ?? now) - s.firstOpenedAt : 0
totalMs(s)     = (s.completedAt ?? now) - s.enteredAt
slaBreached(s) = totalMs(s) > s.slaDays * 86400000
overdueDays(s) = max(0, ceil(totalMs(s)/86400000) - s.slaDays)
```

**Application-level status** is derived too:
- any step `ACTION_NEEDED` → `Action needed from you`
- all steps `DONE` → `Approved`
- otherwise → name the current step in plain language, never "Under Process"

**Rule: the string "Under Process" must not appear anywhere in the UI except on the landing page, where it appears once, crossed out, as the thing we are replacing.**

---

## 8. Consistency checks (`lib/consistency.ts`)

Runs before submission, on the documents the citizen selected. Pure functions, no AI.

**Normalisation**
```
normName(s)  → uppercase, strip Mr/Ms/Shri/Smt, collapse whitespace, remove . and ,
normAddr(s)  → uppercase, expand common abbreviations (RD→ROAD, ST→STREET, NR→NEAR),
               extract 6-digit pincode separately, tokenise remainder
normDob(d)   → ISO date
normPhone(p) → strip +91, spaces, leading 0 → last 10 digits
```

**Rules and severity**

| Check | Severity | Message shown |
| --- | --- | --- |
| DOB differs across any two documents | **BLOCKER** | "Your date of birth is different on two documents. Applications are rejected at the identity check for this. Fix it before you submit." |
| Name differs beyond initials/order | **BLOCKER** | "Your name is spelled differently on your marksheet and your ID." |
| Pincode differs | **WARNING** | "Your ration card shows PIN 585102. Your ID shows 585101. This is usually caught at the domicile check and sent back." |
| Address tokens overlap < 50% | **WARNING** | "Your address does not match across documents." |
| Phone differs | **INFO** | "Two different phone numbers are on file. Updates may go to the wrong one." |

**Do this bit, it is what separates you from other entries:** each message must state **which step it will fail at and what happens then.** Not "mismatch detected." The consequence is the useful information.

Blockers do not hard-block submission — show a clear "Submit anyway" with the consequence spelled out. Government systems that hard-block are a big part of the original problem.

---

## 9. Access log and anomaly rules (`lib/anomaly.ts`)

Runs inside the document fetch endpoint, before streaming.

```
DENY and log ACCESS_DENIED_RATE_LIMIT if:
  - share code revoked
  - share code expired
  - opens on this code > maxOpens
  - document requested is not in shareCode.docIds

FLAG AS UNUSUAL (allow, but surface to citizen) if:
  - same document opened by > 3 distinct offices in 24h
  - opened by an office that is not in this application's workflow
  - opened more than 30 days after the application closed
  - > 10 opens of the same document in 1 hour
```

Present it to the citizen on `/access` as a plain list:

> **Today, 2:14 PM** — District Education Office, Kalaburagi opened your Class 12 marksheet. Step 6 of your scholarship application.
> **Yesterday, 11:02 AM** — Taluk Office, Sedam opened your ration card. Step 3.
> **⚠ 21 Aug, 4:41 PM** — An office outside this application tried to open your ID. Blocked. [Why this happened]

Every share code has a **Revoke** button. Revoking is instant and writes an event.

**Be precise in the copy.** Rate limiting slows and surfaces repeated access; it does not stop a single first-time misuse. Say "surfaces unusual access" not "prevents misuse." A technical judge will notice the overclaim.

---

## 10. Share code spec

- Format: `TRL-XXX-XXX`, uppercase, no ambiguous characters (no O, 0, I, 1)
- Created by the citizen at the end of `/apply`
- Scoped: only the selected documents, only the stated purpose
- Default expiry: 90 days
- One code covers submission **and** status checking. Same code, both directions. This is the "universal status" claim — do not create separate tracking IDs.
- `/track/[code]` is public and needs no login. Add a soft check: enter the code plus the last 4 of the mock locker ID. Keep the demo code and check pre-filled via a link on the landing page so reviewers never get stuck.

---

## 11. API routes

| Route | Method | Does |
| --- | --- | --- |
| `/api/sharecode` | POST | Create code from selected docIds + purpose. Writes `SHARE_CODE_CREATED`. |
| `/api/sharecode` | DELETE | Revoke. Writes `SHARE_CODE_REVOKED`. |
| `/api/doc/[code]/[docId]` | GET | **The instrumented endpoint.** Validate → log → anomaly check → stream. |
| `/api/verify` | POST | Officer marks a doc verified. Writes `DOC_VERIFIED`. Recomputes step. |
| `/api/flag` | POST | Officer flags one doc with reason + comment. Writes `DOC_FLAGGED`, creates `Flag`. |
| `/api/events` | GET | Event stream for an application (used by track + insights) |
| `/api/journey` | POST | OpenAI call for the guided journey (P2) |
| `/api/reset` | POST | Reseed demo data. Link it from `/whats-real`. |

---

## 12. Screens

### 12.1 `/` — Landing (P0)

Job: get the reviewer into the demo in under 10 seconds.

- One headline stating the thesis. Suggested: *"Your file is not lost. It is at a desk. We can tell you which one."*
- Below it, the crossed-out `~~Under Process~~` replaced by a real status line, animated once.
- Three big buttons, each a complete entry point:
  - **See a live application** → `/track/TRL-4K9-2XQ` (pre-filled, no login)
  - **Make a new application** → `/apply/ka-post-matric`
  - **Review as an officer** → `/officer/TRL-4K9-2XQ`
- Demo credentials printed in plain text on the page. No hunting.
- Link to `/whats-real` in the footer of every page.
- Disclaimer banner (§17).

### 12.2 `/track/[code]` — The hero screen (P0)

This is the screen the whole submission rests on. Build it well.

**Above the fold, before any timeline:**
```
Post-matric scholarship
Submitted 12 August 2026

  Now at:   Checking your Class 12 marksheet
  Sitting at: District Education Office, Kalaburagi
  For:      4 days   (this step usually takes 3)
  You need to do: nothing right now
```

That block answers the four questions a citizen actually has. Put it first, in large type.

**Then the timeline.** Vertical, one step per row, each showing:
- Plain-language step name (not the internal name)
- Office holding it
- Status pill
- **Two-part time bar**: grey segment = waiting in queue, blue segment = officer actually working. This is the signature visual (§14).
- For done steps: "Done in 2 days"
- For the current step: live count and SLA comparison
- For a flagged step: the officer's comment verbatim, the document named, and a **"Replace this document"** button that goes back to the locker and re-issues the *same* code

**Critical UX rule for flags:** the citizen replaces one document under the same share code. They never restart the application. Show the old code still valid after replacement. This is the "flag one document, not the whole application" claim — make it visibly true.

**Bottom of page:** "Who has opened your documents" → link to `/access`.

**Language toggle:** English / हिंदी / ಕನ್ನಡ. At minimum translate the status block and step names on this page. Partial translation is fine if `/whats-real` says which parts are translated.

### 12.3 `/officer/[code]` — Officer review (P0)

The brief says reviewers test the citizen experience, not an admin panel. But you need this for the demo to be *live* — the reviewer plays officer, then flips back to `/track` and watches the status change. That is the moment that proves the build works. Keep it minimal and label it clearly as a demo affordance.

- List of documents in the share code
- Clicking a document opens it — **this fires `DOC_OPENED` and the track page changes immediately**
- Per document: **Verify** and **Flag** buttons
- Flag opens a small form: reason dropdown + free-text comment
- A visible note: *"Opening a document here logs an event. Nothing else is required from the officer."*

Add a small live event ticker in the corner showing events as they fire. Cheap to build, and it makes the architecture visible in the video.

### 12.4 `/apply/[schemeId]` (P0)

Three steps on one page, no wizard:
1. **Pick documents** — checklist showing which are required for which step. Show the step name next to each required document so the citizen understands *why*.
2. **Checks run** — consistency results appear inline with severity and consequence (§8)
3. **Generate code** — big mono share code, copy button, "This code is both your submission and your status tracker."

### 12.5 `/locker` (P1)

- Grid of mock documents from the mock DigiLocker
- Toggle: "Show connections" → renders the document graph. Derive links at runtime by comparing normalised field values. Draw as a simple node diagram (SVG, no library) or as a grouped list on mobile: *"These 4 documents share the same address. These 3 share the same phone number."*
- Mismatch badges on documents that disagree with others
- "Upload a scan" option that adds an `UPLOADED_SCAN` document, for documents not in the locker

### 12.6 `/access` (P1)
See §9.

### 12.7 `/insights` (P2)

Public and department view of the same event data.

- **Bottleneck table:** every step of every scheme, sorted by median total time, with the waiting/handling split. Highlight the step where waiting time > 60% of total — that is a queue problem the department can staff for.
- One line of interpretation per row, generated from the data: *"Step 6 averages 9 days. 7 of those are queue time before any officer opens the file."*
- SLA breach count per office
- A note: computed from N synthetic applications, seeded to look realistic

This page answers "end-to-end thinking." Do not skip it if you have time.

### 12.8 `/journey` (P2)

Guided journey: one plain-language question at a time.

```
Are you studying right now?        [Yes] [No]
What class or year?                [dropdown]
Which state do you live in?        [dropdown]
What is your family's yearly income, roughly?   [3 broad bands, not exact rupees]
```

Then: "Based on your answers, 2 schemes fit. Here is the one with the fastest average processing time." → routes straight into `/apply/[schemeId]`.

Use `gpt-4o-mini` to (a) rewrite scheme rules into plain language for the answers given, and (b) explain in one sentence why they qualify. **Always have a deterministic rules fallback** so the page never breaks if the API key fails. Never send anything resembling personal data to the API — send only the band answers.

### 12.9 `/whats-real` (P0) — see §17

---

## 13. Seed data

**Naming and ID safety.** All people are clearly fictional. All reference numbers use the format `MOCK-ID-•••• 4417`. **Never generate a 12-digit number.** Never use the words "Aadhaar number." The document type is displayed as "Government ID (mock)."

### Citizen
```
name: Meena Sabannavar
mockLockerId: MOCK-LOCKER-0001
phoneMasked: 90XXXXXX01
dob: 2006-04-11
```

### Documents
| Type | Issuer (mock) | Notable field |
| --- | --- | --- |
| MOCK_ID | Mock Identity Authority | address PIN **585101** |
| MARKSHEET_12 | Mock Board of Secondary Education | name "MEENA SABANNAVAR" |
| INCOME_CERT | Mock Revenue Office | issued 2026-02-02 |
| CATEGORY_CERT | Mock Social Welfare Office | — |
| DOMICILE_CERT | Mock Taluk Office | — |
| RATION_CARD | Mock Food & Civil Supplies | address PIN **585102** ← seeded mismatch |
| BANK_PASSBOOK | Mock Bank | — |

The pincode mismatch is deliberate. It makes the consistency check demo real instead of theoretical.

### Scheme 1 — `ka-post-matric` (7 steps)

| # | Plain name | Office | SLA | Required docs |
| --- | --- | --- | --- | --- |
| 1 | Application received | Scholarship Cell | 1 | — |
| 2 | Checking your ID and bank details | Scholarship Cell | 2 | MOCK_ID, BANK_PASSBOOK |
| 3 | Confirming you live in this district | Taluk Office, Sedam | 3 | DOMICILE_CERT, RATION_CARD |
| 4 | Checking your family income | Revenue Dept, Kalaburagi | 5 | INCOME_CERT |
| 5 | Checking your category certificate | Social Welfare Dept | 3 | CATEGORY_CERT |
| 6 | Checking your Class 12 marksheet | District Education Office, Kalaburagi | 3 | MARKSHEET_12 |
| 7 | Approving payment | Treasury | 5 | — |

### Scheme 2 — `income-cert` (4 steps, Revenue Dept)
Add this even if you have to strip its UI. It is the evidence for "portable across departments." Same engine, different workflow rows, zero code change. Say exactly that in the video: **"Adding a department is a row in a table, not a rebuild."**

### Demo application state
Seeded so the demo opens in the interesting moment:
- Steps 1–5: `DONE`, with realistic per-step waiting/handling splits
- **Step 6: `WAITING` for 4 days**, SLA is 3 → breached by 1 day, nobody has opened the file yet
- Step 7: `NOT_STARTED`

Plus **20 synthetic applications** across both schemes with varied timings, so `/insights` has real distributions and medians rather than one data point.

**Include a second seeded application** already in `ACTION_NEEDED` with a flagged income certificate and an officer comment, so the flag-and-replace journey is demonstrable without waiting.

---

## 14. Design direction

Do not use a cream background with a serif display and a terracotta accent. Do not use near-black with acid green. Those are AI-default looks and reviewers see dozens of them.

**Concept: the red tape thread.** Indian government files are literally tied with red cloth tape. The timeline thread running down the track page *is* that tape. It is the one bold element; everything else stays quiet.

**Tokens**
```css
--paper:  #F7F7F4;   /* light warm grey, not cream */
--ink:    #16161A;
--muted:  #6E6E68;
--rule:   #DEDDD6;
--thread: #C2323C;   /* red tape — timeline thread, SLA breach only */
--stamp:  #2C4A7C;   /* stamp-pad indigo — verified, handling time */
--queue:  #C9C8C1;   /* waiting time bars */
```

**Type**
- Headings: **IBM Plex Serif**, used sparingly
- Body: **IBM Plex Sans**
- **IBM Plex Mono** for share codes, timestamps, event log rows, and TAT numbers — the mono treatment is what makes the app read as an instrument rather than a brochure
- Devanagari: IBM Plex Sans Devanagari. Kannada: Noto Sans Kannada.

**Signature element.** The vertical thread on `/track`. It runs stamp-indigo through completed steps, thickens at the current step, and turns `--thread` red the moment SLA is breached. One line carries the entire argument. Everything else is plain.

**Motion.** One thing only: timeline steps stagger in top to bottom over ~400ms on load. Respect `prefers-reduced-motion`. Nothing else animates.

**Copy rules**
- Sentence case everywhere
- Name things by what the person recognises: "Your Class 12 marksheet," not "MARKSHEET_12"
- Buttons say what happens: "Generate my code," not "Submit"
- Empty and error states give direction, not apology
- Never use the word "portal"

**Mobile floor.** 360px wide must work. Tap targets 44px minimum. Visible keyboard focus. Test with the browser throttled to Slow 3G before you ship.

---

## 15. Accessibility and low-bandwidth

- Server-render `/track`. Zero client fetching on that route.
- No web fonts blocking first paint — use `next/font` with `display: swap`
- Document previews are small SVG/PNG renders, not real scans. Lazy load.
- Every status also has a text label, never colour alone
- Works with JavaScript off for `/track` read-only view
- Semantic HTML, real `<button>`s, proper heading order

---

## 16. Using Codex and OpenAI

The brief says Codex must be a meaningful part of how you build, not bolted on for the submission. Do this genuinely and be able to describe it.

**Set up an `AGENTS.md`** at the repo root that points to this file:
```md
# AGENTS.md
Read CONTEXT.md before any task. It is the full specification.
Build order: lib/derive.ts → prisma schema + seed → /api/doc endpoint → /track → /officer → everything else.
Never add a `status` column to ApplicationStep. Status is derived. See CONTEXT.md §7.
Never generate 12-digit ID numbers. See CONTEXT.md §13.
```

**Where Codex does real work:** the derivation engine and its tests, the consistency rule set, the seed generator producing 20 realistic synthetic applications, and the timeline component. Keep the commit history — it is evidence.

**Where an OpenAI model powers the product:** the guided journey (§12.8). One `gpt-4o-mini` call, non-critical path, deterministic fallback. Send only broad band answers, never document contents.

---

## 17. Honesty page — `/whats-real`

Honesty is a scored criterion. Write this page carefully and link it from every footer.

**Site-wide banner, on every page:**
> Prototype built for a hackathon. Not a government product, not affiliated with or endorsed by any government body. All data shown is synthetic.

**Page content:**

**What actually works**
- The event engine. Every document open, verify and flag writes a real timestamped event to a real database.
- Status is genuinely computed from those events. No status field is set by hand anywhere in the code.
- Turnaround times, SLA breaches and the waiting/handling split are calculated from the event stream, not hardcoded.
- Share codes, expiry, revocation and open limits work.
- Consistency checks run real string comparison on the seeded document fields.

**What is mocked**
- DigiLocker. We built a local mock with the same shape as a document wallet. We never contacted the real service.
- All identity documents, issuers and reference numbers are invented. No real ID formats are used anywhere.
- The officer interface exists so you can see the trail update live. A real deployment would instrument the department's existing software instead of asking officers to use a new screen.
- Insights are computed from 20 synthetic applications we generated.
- Translations cover the status and timeline screens, not the whole app.

**What we would need to go real**
- A DigiLocker partner integration for live document fetch
- Departments to route document access through this layer rather than emailing attachments
- A published event schema so each department maps its own steps once

**What we deliberately did not claim**
- Rate limiting surfaces unusual access. It does not prevent a first-time misuse of a leaked document.
- We cannot make a slow department faster. We can only show exactly where the time goes.

That last section is unusual and will be noticed. Keep it.

---

## 18. Build order — hour by hour

Do not build in a different order. Each block leaves you with something shippable.

| Hour | Do | Done means |
| --- | --- | --- |
| **0:00–0:30** | Repo, Next.js, Tailwind, Vercel deploy of a blank page, Neon connected | A public URL exists |
| **0:30–1:15** | Prisma schema + `lib/derive.ts` + seed script | `npx prisma db seed` produces the demo application |
| **1:15–2:00** | `/api/doc` instrumented endpoint + verify + flag routes | Hitting the endpoint writes events |
| **2:00–3:00** | `/track/[code]` — the hero screen | Reviewer can see a live status |
| **3:00–3:40** | `/officer/[code]` | Opening a doc in one tab changes `/track` in another |
| **3:40–4:00** | `/whats-real` + landing page + disclaimers | **P0 COMPLETE. Deploy. You are submittable from here.** |
| 4:00–4:45 | `/apply` with consistency checks | New code generation works |
| 4:45–5:30 | `/locker` + `/access` | P1 complete |
| 5:30–6:15 | `/insights` | P2 partial |
| 6:15–7:00 | `/journey` with OpenAI + fallback | P2 complete |
| **Last 90 min** | **Stop building.** Record video, write summary, test the link on a phone on mobile data, fill the form | Submitted |

**Deploy after every block.** Never leave deployment to the end.

---

## 19. Two-minute video script

The brief is strict: minute one demos as a citizen, minute two explains how you built it and why.

**0:00–0:10** — Open a real government portal status page showing "Under Process." Say: "This is what a scholarship applicant sees for eleven weeks."

**0:10–0:50** — Open `/track/TRL-4K9-2XQ` on a phone. Read the status block out loud: the step, the office, the four days, the SLA. Scroll the timeline. Point at the two-colour bars: "Grey is the file waiting in a queue. Blue is an officer actually working. No system today separates those."

**0:50–1:05** — Split screen. Open the officer tab, click the marksheet. Flip to the citizen tab. The status has changed. Say: **"Nobody clicked 'mark as verified.' Opening the document was the event."**

**1:05–1:20** — Show a flag with a comment, then the citizen replacing one document under the same code. "One document, not the whole application. Same code, still valid."

**1:20–1:45** — `/insights`. "Step 6 averages nine days. Seven are queue time. That is a staffing decision, not a training one." Then: "Adding a second department was a row in a table. Same engine."

**1:45–2:00** — `/whats-real` on screen. State plainly what is mocked. Say you built it with Codex and name one thing Codex wrote. End.

Do not use government logos in the video. Blur any emblem in the opening screen recording.

---

## 20. Submission checklist

- [ ] Live link opens in an incognito window with **no access request**
- [ ] Tested on a real phone on mobile data, not just desktop
- [ ] Demo credentials printed on the landing page
- [ ] Every page has the "not a government product" disclaimer
- [ ] No government logos anywhere, including the video
- [ ] No 12-digit numbers, no real ID formats, in UI or code or seed data
- [ ] `/whats-real` complete and linked from every footer
- [ ] `/api/reset` works, in case a reviewer breaks the demo state
- [ ] Video is **under 2:00**, first minute citizen demo, second minute build
- [ ] Summary is **under 250 words** (you have this already)
- [ ] Partner's registered email ready, or blank if solo
- [ ] Same email used everywhere — they cannot move an entry between addresses
- [ ] Submitted before **10:00 PM IST, 29 August 2026**

---

## 21. Things that will sink this build

- **Building the officer panel first.** The brief says reviewers test the citizen experience. `/track` is the product.
- **Adding a `status` column.** The moment status is stored rather than derived, the core claim is false and a technical judge will find it.
- **A login wall.** If the reviewer has to request access, the entry scores zero on "working build."
- **Overclaiming on security.** Say "surfaces unusual access," not "prevents fraud."
- **Real-looking ID numbers.** This is a disqualification risk, not a style issue.
- **Beautiful static screens with no working journey.** Explicitly called out in the brief.
- **Building all three schemes.** Two is enough to prove portability. Three is vanity.
- **Skipping `/whats-real` for time.** It is a scored criterion and takes fifteen minutes.

---

## 22. If you make the 250 (Round 2, resubmit by 7 Sept)

You get a week of mentorship. Priorities in order:

1. **Publish the event schema** as a small open spec with a versioned JSON contract. This converts the project from an app into an integration layer, which is the actual pitch.
2. **Build the ingestion adapter** — show a department pushing events from its own system with a five-line webhook, no UI change. This kills the objection "departments will never adopt a new screen."
3. **Consent and privacy model** — who can see the access log, retention period, what the department can and cannot see about the citizen. Add a written privacy note.
4. **Anonymised public dashboard** — district-level TAT with no personal data, so citizens and journalists can see performance.
5. **Real user testing** — two rural students, two officers if you can reach them. Quote them in the resubmission. Nothing else moves a judge like that.
6. **Load and failure story** — what happens when the event write fails, idempotency keys, replay from the log.
