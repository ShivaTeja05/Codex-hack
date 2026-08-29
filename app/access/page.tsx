import Link from 'next/link';
import { findShareCode, state } from '@/lib/trail/store';
import { PRIMARY_CODE } from '@/lib/trail/seed';
import { RevokeButton } from './RevokeButton';

export const dynamic = 'force-dynamic';

const when = (ts: string) =>
  new Date(ts).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit',
  });

export default function AccessPage({ searchParams }: { searchParams: { code?: string } }) {
  const code = searchParams.code ?? PRIMARY_CODE;
  const store = state();
  const shareCode = findShareCode(code);
  const docName = (id?: string) => store.documents.find((d) => d.id === id)?.plainName ?? 'a document';

  const events = store.events
    .filter(
      (e) =>
        e.documentId &&
        (e.shareCode === code || (shareCode?.applicationId && e.applicationId === shareCode.applicationId)),
    )
    .sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime());

  const blocked = events.filter((e) => e.eventType === 'ACCESS_DENIED_RATE_LIMIT');
  const unusual = events.filter((e) => e.meta && (e.meta as { unusual?: string }).unusual);
  const opens = events.filter(
    (e) => e.eventType === 'DOC_OPENED' || e.eventType === 'DOC_REOPENED',
  );

  const label = (e: (typeof events)[number]) => {
    if (e.eventType === 'ACCESS_DENIED_RATE_LIMIT') return 'Blocked';
    if (e.eventType === 'DOC_VERIFIED') return 'Verified';
    if (e.eventType === 'DOC_FLAGGED') return 'Flagged';
    if (e.eventType === 'DOC_REOPENED') return 'Re-opened';
    if (e.eventType === 'DOC_OPENED') return 'Opened';
    return e.eventType;
  };

  return (
    <main className="tr-shell">
      <p className="tr-eyebrow">Your access log</p>
      <h1 className="tr-h1">Who has looked at your documents</h1>
      <p className="tr-sub">
        Every open, re-open and blocked attempt on code <span className="tr-mono">{code}</span>.
        You have a right to see who looks at your identity documents — so this is on by default.
      </p>

      <section className="tr-now">
        <dl>
          <div><dt>Opens</dt><dd>{opens.length}</dd></div>
          <div><dt>Blocked</dt><dd>{blocked.length}</dd></div>
          <div><dt>Unusual</dt><dd>{unusual.length}</dd></div>
          <div>
            <dt>This code</dt>
            <dd style={{ fontSize: 16 }}>
              <RevokeButton code={code} revoked={Boolean(shareCode?.revokedAt)} />
            </dd>
          </div>
        </dl>
      </section>

      {blocked.length > 0 || unusual.length > 0 ? (
        <section className="tr-card" style={{ borderColor: 'var(--thread)', borderLeftWidth: 4 }}>
          <h2 className="tr-h2">Worth a look</h2>
          <ul className="ac-list">
            {[...blocked, ...unusual].map((e) => (
              <li key={e.id} className="ac-flagged">
                <span className="ac-badge">{label(e)}</span>
                <div>
                  <p className="ac-line">
                    <span className="tr-mono">{when(e.ts)}</span> — {e.actorLabel} · {docName(e.documentId)}
                  </p>
                  <p className="tr-soft">
                    {(e.meta as { deniedReason?: string; unusual?: string })?.deniedReason ??
                      (e.meta as { unusual?: string })?.unusual}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <p className="tr-soft" style={{ marginTop: 12 }}>
            Rate limiting <strong>surfaces</strong> unusual access and caps how often a code is used.
            It does not prevent a first-time misuse of a leaked document — and we do not claim it does.
          </p>
        </section>
      ) : null}

      <section className="tr-card">
        <h2 className="tr-h2">Full log</h2>
        <ul className="ac-list">
          {events.map((e) => (
            <li key={e.id} className={e.eventType === 'ACCESS_DENIED_RATE_LIMIT' ? 'ac-flagged' : ''}>
              <span className={`ac-badge ${e.eventType === 'ACCESS_DENIED_RATE_LIMIT' ? 'ac-badge-block' : ''}`}>{label(e)}</span>
              <div>
                <p className="ac-line">
                  <span className="tr-mono">{when(e.ts)}</span> — {e.actorLabel}
                </p>
                <p className="tr-soft">{docName(e.documentId)}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <div className="tr-actions">
        <Link className="tr-btn tr-btn-ghost" href={`/track/${code}`}>← Back to tracking</Link>
        <Link className="tr-btn tr-btn-ghost" href="/whats-real">What is real here</Link>
      </div>
    </main>
  );
}
