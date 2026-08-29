import Link from 'next/link';
import { findDocument, findShareCode, state } from '@/lib/trail/store';
import { ReplaceForm } from './ReplaceForm';

export const dynamic = 'force-dynamic';

export default function ReplacePage({
  params,
  searchParams,
}: {
  params: { code: string };
  searchParams: { doc?: string };
}) {
  const shareCode = findShareCode(params.code);
  const docId = searchParams.doc;
  const document = findDocument(docId);
  const flag = state().flags.find(
    (item) =>
      item.documentId === docId &&
      item.applicationId === shareCode?.applicationId &&
      !item.resolvedAt,
  );

  if (!shareCode || !document) {
    return (
      <main className="tr-shell">
        <div className="tr-card" style={{ marginTop: 0 }}>
          <h1 className="tr-h1">Nothing to replace</h1>
          <Link className="tr-btn" href={`/track/${params.code}`}>Back to tracking</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="tr-shell">
      <p className="tr-eyebrow">Fix one document</p>
      <h1 className="tr-h1">Replace {document.plainName.toLowerCase()}</h1>
      <p className="tr-sub">
        You are replacing one document under the same code <span className="tr-mono">{shareCode.code}</span>.
        You are not starting your application again.
      </p>

      {flag ? (
        <section className="tr-card" style={{ marginTop: 0 }}>
          <h2 className="tr-h2">What the officer asked for</h2>
          <p className="tr-flag-title" style={{ marginBottom: 8 }}>{flag.officerLabel}</p>
          <p className="tr-flag-comment">“{flag.comment}”</p>
        </section>
      ) : (
        <p className="tr-note">This document is not currently flagged. It may already be resolved.</p>
      )}

      <section className="tr-card">
        <h2 className="tr-h2">Resubmit the corrected copy</h2>
        <p className="tr-soft" style={{ marginBottom: 14 }}>
          In the real product you would re-fetch the corrected document from your locker or
          upload a fresh scan. In this demo, confirming resubmits it under the same code and
          sends the step back for review. Your code stays valid.
        </p>
        <ReplaceForm code={shareCode.code} docId={document.id} />
      </section>

      <div className="tr-actions">
        <Link className="tr-btn tr-btn-ghost" href={`/track/${shareCode.code}`}>← Back to tracking</Link>
      </div>
    </main>
  );
}
