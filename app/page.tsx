import Link from 'next/link';
import { PRIMARY_CODE, FLAGGED_CODE } from '@/lib/trail/seed';

export default function Landing() {
  return (
    <main className="tr-shell">
      <p className="tr-eyebrow">Nagrik Trail — independent prototype, synthetic data</p>
      <h1 className="tr-h1">Your file is not lost. It is at a desk. We can tell you which one.</h1>

      <div className="tr-card" style={{ marginTop: 18 }}>
        <p className="tr-soft" style={{ marginBottom: 8 }}>What a scholarship applicant sees for eleven weeks:</p>
        <p style={{ margin: 0, fontSize: 20, textDecoration: 'line-through', color: '#6E6E68' }}>Under Process</p>
        <p style={{ margin: '14px 0 0', fontSize: 17, fontWeight: 600, lineHeight: 1.35 }}>
          Checking your Class 12 marksheet · District Education Office, Kalaburagi · 4 days
          <span className="tr-soft" style={{ display: 'block', marginTop: 4 }}>this step usually takes 3</span>
        </p>
      </div>

      <p className="tr-note" style={{ marginTop: 18 }}>
        Status systems fail because they need an officer to remember to click &ldquo;mark as done&rdquo;.
        So we instrument the document, not the officer. A document is only rendered at the end of a
        logged fetch — <strong>opening it is the event</strong>. Status is computed from that stream,
        never declared by a human.
      </p>

      <div className="tr-actions">
        <Link className="tr-btn" href={`/track/${PRIMARY_CODE}`}>See a live application</Link>
        <Link className="tr-btn tr-btn-ghost" href={`/officer/${PRIMARY_CODE}`}>Review as an officer</Link>
        <Link className="tr-btn tr-btn-ghost" href={`/track/${FLAGGED_CODE}`}>See one that needs action</Link>
      </div>

      <div className="tr-card">
        <h2 className="tr-h2">Demo details — no login needed</h2>
        <ul style={{ display: 'grid', gap: 7, margin: 0, paddingLeft: 18, fontSize: 14 }}>
          <li>Tracking code: <strong className="tr-mono">{PRIMARY_CODE}</strong></li>
          <li>Needs-action code: <strong className="tr-mono">{FLAGGED_CODE}</strong></li>
          <li>Citizen: Meena Sabannavar (fictional)</li>
        </ul>
        <p className="tr-soft" style={{ marginTop: 12 }}>
          To see the architecture work: open the officer view in one tab, open a document, then
          reload the citizen view in another tab. Nobody marked anything as done.
        </p>
      </div>

      <div className="tr-card">
        <h2 className="tr-h2">Don&apos;t know where to start?</h2>
        <p style={{ margin: '0 0 12px', fontSize: 14.5, lineHeight: 1.5 }}>
          A rural student should not need to know which form to fill. Answer a few plain
          questions and we route you to the right scheme — then into an application whose
          documents are checked against each other before you submit, and which you can track
          from the first day.
        </p>
        <div className="tr-actions" style={{ marginTop: 0 }}>
          <Link className="tr-btn" href="/journey">Find my scheme</Link>
          <Link className="tr-btn tr-btn-ghost" href="/apply/ka-post-matric">Make a new application</Link>
        </div>
      </div>

      <div className="tr-card">
        <h2 className="tr-h2">For departments and the public</h2>
        <p style={{ margin: '0 0 12px', fontSize: 14.5, lineHeight: 1.5 }}>
          The same event stream shows where the days go across every office — how much is
          queue time before anyone opens a file versus real hands-on review. That is a
          decision a department can act on.
        </p>
        <div className="tr-actions" style={{ marginTop: 0 }}>
          <Link className="tr-btn tr-btn-ghost" href="/insights">See the bottleneck dashboard</Link>
          <Link className="tr-btn tr-btn-ghost" href="/whats-real">What is real and what is mocked</Link>
        </div>
      </div>

      <p className="tr-soft" style={{ marginTop: 22 }}>
        Independent prototype. Not a government product, not affiliated with any government body.
        All data is synthetic. No live government system is contacted.
      </p>
    </main>
  );
}
