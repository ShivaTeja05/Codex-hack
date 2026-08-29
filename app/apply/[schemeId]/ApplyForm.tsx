'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { checkConsistency, type Severity } from '@/lib/trail/consistency';
import type { DocType, Scheme, TrailDocument } from '@/lib/trail/types';

const severityClass: Record<Severity, string> = {
  BLOCKER: 'ap-blocker',
  WARNING: 'ap-warning',
  INFO: 'ap-info',
};
const severityLabel: Record<Severity, string> = {
  BLOCKER: 'Will be rejected',
  WARNING: 'Usually sent back',
  INFO: 'Good to know',
};

export function ApplyForm({
  scheme,
  documents,
  requiredTypes,
}: {
  scheme: Scheme;
  documents: TrailDocument[];
  requiredTypes: DocType[];
}) {
  const router = useRouter();
  const requiredDocIds = useMemo(
    () => documents.filter((d) => requiredTypes.includes(d.docType)).map((d) => d.id),
    [documents, requiredTypes],
  );
  const [selected, setSelected] = useState<string[]>(requiredDocIds);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedDocs = documents.filter((d) => selected.includes(d.id));
  const findings = useMemo(() => checkConsistency(selectedDocs), [selectedDocs]);
  const missing = requiredTypes.filter(
    (type) => !selectedDocs.some((d) => d.docType === type),
  );

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  async function generate() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/trail/sharecode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schemeId: scheme.id,
          docIds: selected,
          purpose: `${scheme.name} application`,
        }),
      });
      const data = (await res.json()) as { code?: string; error?: string };
      if (!res.ok || !data.code) throw new Error(data.error ?? 'Could not create code.');
      router.push(`/track/${data.code}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
      setBusy(false);
    }
  }

  const whichStep = (type: DocType) =>
    scheme.steps.find((s) => s.requiredDocTypes.includes(type))?.plainName;

  return (
    <>
      <section className="tr-card" style={{ marginTop: 0 }}>
        <h2 className="tr-h2">1. Pick your documents</h2>
        <p className="tr-soft" style={{ marginBottom: 14 }}>
          Required documents are ticked. Each one shows the step it is used for, so you know why.
        </p>
        <ul className="ap-doclist">
          {documents.map((doc) => {
            const step = whichStep(doc.docType);
            const required = requiredTypes.includes(doc.docType);
            return (
              <li key={doc.id}>
                <label className="ap-doc">
                  <input
                    type="checkbox"
                    checked={selected.includes(doc.id)}
                    onChange={() => toggle(doc.id)}
                  />
                  <span className="ap-doc-body">
                    <span className="ap-doc-name">{doc.plainName}</span>
                    <span className="tr-soft ap-doc-meta">
                      {step ? `Needed for: ${step}` : 'Not required for this scheme'}
                      {required ? ' · required' : ''}
                    </span>
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
        {missing.length > 0 ? (
          <p className="tr-note" style={{ background: '#FCF6F2', borderLeftColor: 'var(--thread)', marginBottom: 0 }}>
            You have unticked a required document. This step will not be able to start until you add it back.
          </p>
        ) : null}
      </section>

      <section className="tr-card">
        <h2 className="tr-h2">2. Checks before you submit</h2>
        {findings.length === 0 ? (
          <p className="ap-ok">No problems found across your selected documents.</p>
        ) : (
          <ul className="ap-findings">
            {findings.map((f, i) => (
              <li key={i} className={`ap-finding ${severityClass[f.severity]}`}>
                <div className="ap-finding-head">
                  <span className="ap-finding-title">{f.title}</span>
                  <span className="ap-finding-pill">{severityLabel[f.severity]}</span>
                </div>
                <p className="ap-finding-msg">{f.message}</p>
                <p className="tr-soft">On: {f.docs.join(' and ')}</p>
              </li>
            ))}
          </ul>
        )}
        <p className="tr-soft" style={{ marginTop: 12 }}>
          Nothing here blocks you. Government systems that hard-block are part of the original
          problem — you can submit anyway, knowing exactly what may come back.
        </p>
      </section>

      <section className="tr-card">
        <h2 className="tr-h2">3. Generate your code</h2>
        <p className="tr-soft" style={{ marginBottom: 14 }}>
          One code is both your submission and your status tracker. Officers open your
          documents through it; every open becomes an event you can see.
        </p>
        {error ? <p className="tr-note" style={{ background: '#FCF6F2', borderLeftColor: 'var(--thread)' }}>{error}</p> : null}
        <button type="button" className="tr-btn" onClick={generate} disabled={busy || selected.length === 0}>
          {busy ? 'Creating…' : 'Generate my code and submit'}
        </button>
      </section>
    </>
  );
}
