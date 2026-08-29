'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

interface DocRow {
  id: string;
  plainName: string;
  issuer: string;
  refMasked: string;
}

interface OfficerData {
  code: string;
  purpose: string;
  office: string;
  documents: DocRow[];
}

export default function OfficerPage({ params }: { params: { code: string } }) {
  const [data, setData] = useState<OfficerData | null>(null);
  const [ticker, setTicker] = useState<string[]>([]);
  const [openDoc, setOpenDoc] = useState<Record<string, unknown> | null>(null);
  const [flagFor, setFlagFor] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [reason, setReason] = useState('MISMATCH');

  useEffect(() => {
    fetch(`/api/trail/officer/${params.code}`)
      .then((response) => response.json())
      .then(setData)
      .catch(() => setData(null));
  }, [params.code]);

  const log = useCallback((line: string) => {
    setTicker((current) => [`${new Date().toLocaleTimeString('en-IN')} ${line}`, ...current].slice(0, 6));
  }, []);

  async function open(doc: DocRow) {
    const response = await fetch(
      `/api/trail/doc/${params.code}/${doc.id}?office=${encodeURIComponent(data?.office ?? 'Reviewing office')}`,
    );
    const body = await response.json();
    if (!response.ok) {
      log(`ACCESS_DENIED — ${body.error}`);
      return;
    }
    setOpenDoc(body.document);
    log(`${body.loggedAs} — ${doc.plainName}`);
  }

  async function verify(doc: DocRow) {
    await fetch('/api/trail/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: params.code, docId: doc.id, office: data?.office }),
    });
    log(`DOC_VERIFIED — ${doc.plainName}`);
  }

  async function submitFlag(docId: string) {
    if (!comment.trim()) return;
    await fetch('/api/trail/flag', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: params.code, docId, reason, comment, office: data?.office }),
    });
    log(`DOC_FLAGGED — ${reason}`);
    setFlagFor(null);
    setComment('');
  }

  if (!data) {
    return (
      <main className="tr-shell">
        <div className="tr-card"><p>Loading the review pane…</p></div>
      </main>
    );
  }

  return (
    <main className="tr-shell">
      <p className="tr-eyebrow">Officer review — demo affordance</p>
      <h1 className="tr-h1">{data.purpose}</h1>
      <p className="tr-note">
        Opening a document here logs an event. Nothing else is required from the officer.
        Open <Link className="tr-link" href={`/track/${params.code}`}>the citizen view</Link> in another tab and watch it change.
      </p>

      <div className="tr-officer-grid">
        <section>
          {data.documents.map((doc) => (
            <article className="tr-doc" key={doc.id}>
              <div>
                <h2>{doc.plainName}</h2>
                <p className="tr-soft tr-mono">{doc.refMasked} · {doc.issuer}</p>
              </div>
              <div className="tr-doc-actions">
                <button className="tr-btn tr-btn-small" type="button" onClick={() => open(doc)}>Open</button>
                <button className="tr-btn tr-btn-small tr-btn-ghost" type="button" onClick={() => verify(doc)}>Verify</button>
                <button className="tr-btn tr-btn-small tr-btn-ghost" type="button" onClick={() => setFlagFor(flagFor === doc.id ? null : doc.id)}>Flag</button>
              </div>
              {flagFor === doc.id ? (
                <div className="tr-flag-form">
                  <label>
                    <span>Reason</span>
                    <select value={reason} onChange={(e) => setReason(e.target.value)}>
                      <option value="MISMATCH">Details do not match</option>
                      <option value="ILLEGIBLE">Cannot read it</option>
                      <option value="EXPIRED">Out of date</option>
                      <option value="WRONG_DOC">Wrong document</option>
                    </select>
                  </label>
                  <label>
                    <span>Comment to the citizen</span>
                    <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} placeholder="Say what is wrong and what to send instead." />
                  </label>
                  <button className="tr-btn tr-btn-small" type="button" onClick={() => submitFlag(doc.id)}>Send flag</button>
                </div>
              ) : null}
            </article>
          ))}
        </section>

        <aside className="tr-ticker">
          <h2 className="tr-h2">Event log</h2>
          {ticker.length === 0 ? <p className="tr-soft">Nothing yet. Open a document.</p> : null}
          <ul>{ticker.map((line) => <li className="tr-mono" key={line}>{line}</li>)}</ul>
        </aside>
      </div>

      {openDoc ? (
        <section className="tr-card tr-preview">
          <h2 className="tr-h2">{String((openDoc as { plainName?: string }).plainName)}</h2>
          <dl className="tr-fields">
            {Object.entries(((openDoc as { fields?: Record<string, string> }).fields) ?? {}).map(([key, value]) => (
              <div key={key}><dt>{key}</dt><dd className="tr-mono">{value}</dd></div>
            ))}
          </dl>
          <p className="tr-soft">Rendered from mock data. No real document exists.</p>
        </section>
      ) : null}
    </main>
  );
}
