import Link from 'next/link';

const rows: { thing: string; status: 'real' | 'mocked'; detail: string }[] = [
  { thing: 'Status derivation', status: 'real', detail: 'Every status on the track page is computed from the event stream by pure functions in lib/trail/derive.ts. There is no status column anywhere in the data model. Deliberately.' },
  { thing: 'The instrumented fetch', status: 'real', detail: 'A document is only rendered at the end of a logged fetch. Opening one in the officer view writes a DOC_OPENED event and stamps the step, which changes the citizen view. Nobody marks anything as done.' },
  { thing: 'Waiting vs handling split', status: 'real', detail: 'Queue time and handling time are computed separately from enteredAt, firstOpenedAt and completedAt. No current system separates these.' },
  { thing: 'Flag and comment', status: 'real', detail: 'An officer flags one document with a reason and a comment. The citizen sees it verbatim under the same share code, and does not restart the application.' },
  { thing: 'Access log', status: 'real', detail: 'Every open, re-open and denied attempt is listed for the citizen. The denial rules surface unusual access; they do not prevent a first-time misuse, and we do not claim they do.' },
  { thing: 'DigiLocker', status: 'mocked', detail: 'No real DigiLocker is contacted. Requester integration requires being an onboarded organisation with a signed agreement, and there is no tier for a citizen-chosen tool. Documents here are local synthetic fixtures.' },
  { thing: 'Identity and reference numbers', status: 'mocked', detail: 'All people are fictional. No 12-digit numbers exist anywhere in the UI, the code or the seed data. References use the format MOCK-ID-•••• 4417.' },
  { thing: 'Officer identity', status: 'mocked', detail: 'The officer view is a demo affordance so a reviewer can see the architecture work. There is no authentication and no real officer account.' },
  { thing: 'Storage', status: 'mocked', detail: 'Demo state lives in server memory, not a database. It resets on a cold start, which is why the demo ships pre-seeded and why the reset control below exists.' },
  { thing: 'Submissions', status: 'mocked', detail: 'Nothing is submitted to any department. No live government system is contacted, called or tested.' },
];

export default function WhatsReal() {
  return (
    <main className="tr-shell">
      <p className="tr-eyebrow">Honesty</p>
      <h1 className="tr-h1">What works, and what is simulated.</h1>
      <p className="tr-sub">
        This is an independent prototype built for a hackathon. It is not a government product and is not affiliated with any government body.
      </p>

      {rows.map((row) => (
        <article className="tr-card" key={row.thing} style={{ marginTop: 12 }}>
          <div className="tr-step-head">
            <h2 className="tr-h2" style={{ margin: 0 }}>{row.thing}</h2>
            <span className={`tr-pill ${row.status === 'real' ? 'tr-pill-done' : 'tr-pill-waiting'}`}>{row.status}</span>
          </div>
          <p style={{ margin: '9px 0 0', fontSize: 14.5, lineHeight: 1.5 }}>{row.detail}</p>
        </article>
      ))}

      <form action="/api/trail/reset" method="post" className="tr-actions">
        <button className="tr-btn tr-btn-ghost" type="submit">Reset the demo data</button>
        <Link className="tr-btn tr-btn-ghost" href="/track">Back to tracking</Link>
      </form>
    </main>
  );
}
