import Link from 'next/link';
import { state } from '@/lib/trail/store';
import { checkConsistency, normPhone } from '@/lib/trail/consistency';
import type { TrailDocument } from '@/lib/trail/types';

export const dynamic = 'force-dynamic';

function group<T>(items: T[], key: (item: T) => string | undefined) {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const k = key(item);
    if (!k) continue;
    map.set(k, [...(map.get(k) ?? []), item]);
  }
  return Array.from(map.entries()).filter(([, list]) => list.length > 1);
}

export default function LockerPage() {
  const store = state();
  const docs = store.documents;

  const findings = checkConsistency(docs);
  // A document is "in conflict" if its plain name appears in a warning/blocker.
  const conflicted = new Set(
    findings
      .filter((f) => f.severity !== 'INFO')
      .flatMap((f) => f.docs),
  );

  const byPin = group(docs, (d) => d.fields.pincode);
  const byPhone = group(docs, (d) => (d.fields.phone ? normPhone(d.fields.phone) : undefined));

  const names = (list: TrailDocument[]) => list.map((d) => d.plainName).join(', ');

  return (
    <main className="tr-shell">
      <p className="tr-eyebrow">Your locker</p>
      <h1 className="tr-h1">Your documents, and how they connect</h1>
      <p className="tr-sub">
        Everything in your mock DigiLocker, plus anything you have scanned in. We derive the
        links between them at runtime by comparing the fields — so a contradiction shows up
        before an officer ever sees it.
      </p>

      <section className="tr-card" style={{ marginTop: 0 }}>
        <h2 className="tr-h2">How they connect</h2>
        <ul className="lk-conn">
          {byPin.map(([pin, list]) => (
            <li key={`pin-${pin}`}>
              <span className="lk-conn-tag">Same address</span>
              <span>PIN {pin}: {names(list)}</span>
            </li>
          ))}
          {byPhone.map(([phone, list]) => (
            <li key={`ph-${phone}`}>
              <span className="lk-conn-tag">Same phone</span>
              <span>{names(list)}</span>
            </li>
          ))}
          {findings
            .filter((f) => f.severity !== 'INFO')
            .map((f, i) => (
              <li key={`mm-${i}`}>
                <span className="lk-conn-tag lk-conn-warn">Disagree</span>
                <span>{f.docs.join(' and ')}: {f.title.toLowerCase()}</span>
              </li>
            ))}
        </ul>
      </section>

      <div className="lk-grid">
        {docs.map((doc) => (
          <article className="lk-doc" key={doc.id}>
            <div className="lk-doc-top">
              <h2>{doc.plainName}</h2>
              {conflicted.has(doc.plainName) ? <span className="lk-badge">Mismatch</span> : null}
            </div>
            <p className="tr-soft tr-mono">{doc.refMasked}</p>
            <dl className="lk-fields">
              <div><dt>Issuer</dt><dd>{doc.issuer}</dd></div>
              <div><dt>Source</dt><dd>{doc.source === 'DIGILOCKER_MOCK' ? 'From locker (mock)' : 'Scanned upload'}</dd></div>
              {doc.fields.pincode ? <div><dt>PIN</dt><dd className="tr-mono">{doc.fields.pincode}</dd></div> : null}
            </dl>
          </article>
        ))}
      </div>

      <p className="tr-soft" style={{ marginTop: 16 }}>
        These are synthetic fixtures. No real DigiLocker is contacted. Reference numbers use a
        mock format and are never real ID numbers.
      </p>

      <div className="tr-actions">
        <Link className="tr-btn tr-btn-ghost" href="/apply/ka-post-matric">Use these in an application</Link>
        <Link className="tr-btn tr-btn-ghost" href="/access">Who has opened them</Link>
      </div>
    </main>
  );
}
