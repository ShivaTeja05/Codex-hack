# OpenTrail — how it works

Three diagrams. The first is the whole argument; the other two are the plumbing
around it.

---

## 1. Why status breaks today, and what we do instead

```mermaid
flowchart TB
    subgraph OLD["Today — status is declared"]
        direction TB
        A1["Officer finishes the work"] --> A2["Officer remembers<br/>to open the portal"]
        A2 --> A3["Officer clicks<br/>'mark as verified'"]
        A3 --> A4["Status updates"]
        A2 -.->|"this step<br/>never happens"| X(("✕"))
    end

    subgraph NEW["OpenTrail — status is computed"]
        direction TB
        B1["Officer opens the document<br/>to do their job"] --> B2["The open IS the event"]
        B2 --> B3["Status is derived<br/>from the event stream"]
    end

    OLD ~~~ NEW
```

**Nobody has to remember anything.** A document is only rendered at the end of a
logged fetch, so there is no way to view one without producing an event.

---

## 2. The officer request, end to end

This is the path every document view takes. Note the order: the event is written
**before** the document is returned.

```mermaid
sequenceDiagram
    autonumber
    participant O as Officer
    participant API as GET /api/trail/doc/:code/:docId
    participant AN as anomaly.ts
    participant ST as store + cookie delta
    participant D as derive.ts
    participant C as Citizen · /track/:code

    O->>API: opens a document
    API->>AN: validate share code
    Note over AN: revoked? expired? over limit?<br/>document actually in this code?
    alt refused
        AN-->>API: deny + reason
        API->>ST: write ACCESS_DENIED_RATE_LIMIT
        API-->>O: 403, and the citizen still sees the attempt
    else allowed
        AN-->>API: allow (+ unusual flag)
        API->>ST: write DOC_OPENED
        API->>ST: stamp step.firstOpenedAt
        API-->>O: render the document
    end

    C->>D: loads the track page
    D->>ST: read events + flags
    D-->>C: WAITING → IN_REVIEW
    Note over C: nobody marked anything as done
```

---

## 3. Service architecture

```mermaid
flowchart LR
    subgraph CITIZEN["Citizen"]
        J["/journey<br/>find my scheme"]
        AP["/apply<br/>pick docs · checks · code"]
        TR["/track/:code<br/>status + timeline"]
        AC["/access<br/>who opened what"]
        RP["/track/:code/replace<br/>swap one document"]
    end

    subgraph OFFICER["Officer · demo affordance"]
        OF["/officer/:code<br/>open · verify · flag"]
    end

    subgraph API["Instrumented API"]
        DOC["doc/:code/:docId"]
        VER["verify"]
        FLG["flag"]
        REP["replace"]
    end

    subgraph CORE["Deterministic core — pure functions"]
        DER["derive.ts<br/>status · waiting vs handling"]
        CON["consistency.ts<br/>pre-submission checks"]
        ANO["anomaly.ts<br/>access rules"]
        INS["insights.ts<br/>bottlenecks by office"]
    end

    subgraph STATE["State — no database"]
        SEED["seed.ts<br/>synthetic fixtures"]
        DELTA["cookie delta<br/>survives serverless"]
    end

    J --> AP --> TR
    TR --> AC
    TR --> RP
    OF --> DOC & VER & FLG
    RP --> REP
    DOC & VER & FLG & REP --> DELTA
    DOC --> ANO
    AP --> CON
    TR --> DER
    DER --> SEED & DELTA
    INS --> SEED
```

**The dependency rule:** screens may import the core; the core imports nothing
from the screens. No React, no `window`, no `fetch` in `derive.ts` — which is
what makes "status is computed" testable rather than asserted.

---

## 4. One share code, both directions

```mermaid
flowchart LR
    C1["Citizen picks<br/>documents"] -->|"consistency checks run"| C2["Share code<br/>TRL-4K9-2XQ"]
    C2 -->|"submit"| OFF["Officer opens it"]
    OFF -->|"flags one document<br/>+ comment"| C3["Citizen sees the flag<br/>on the same code"]
    C3 -->|"replaces that document"| C4["Same code, still valid"]
    C4 --> OFF
    C2 -.->|"track anytime"| C5["/track/:code"]
```

**The same code is the submission and the tracker.** A flag never restarts an
application — one document is replaced, and the code stays valid.
