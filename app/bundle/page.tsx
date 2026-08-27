'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import { ScreenIntro } from '@/components/ScreenIntro';
import { buildBundle, encodeBundle } from '@/lib/engine/bundle';
import { buildConflicts } from '@/lib/engine/conflicts';
import { sourceLabels } from '@/lib/presentation';
import { getCitizen } from '@/lib/seed/citizens';
import { useSession } from '@/lib/state';

export default function BundlePage() {
  const { citizenId, goalId } = useSession();
  const citizen = getCitizen(citizenId);
  const bundle = useMemo(() => buildBundle(citizen, goalId, buildConflicts(citizen, goalId)), [citizen, goalId]);
  const payload = useMemo(() => encodeBundle(bundle), [bundle]);
  const [qr, setQr] = useState('');
  useEffect(() => {
    const url = `${window.location.origin}/bundle/${payload}`;
    QRCode.toDataURL(url, { width: 440, margin: 1, color: { dark: '#17221f', light: '#fffdf8' } }).then(setQr).catch(() => setQr(''));
  }, [payload]);
  return (
    <main className="page-shell bundle-shell">
      <ScreenIntro step="7 of 8 · Share bundle" title="Share only what this check needs.">
        The long link contains the complete bundle. There is no database, lookup page or list of other bundles.
      </ScreenIntro>
      <section className="card bundle-hero">
        <p className="eyebrow">Bundle reference</p>
        <p className="reference">{bundle.ref}</p>
        <p className="expiry">Expires {new Date(bundle.expiresAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
        {qr ? <img className="qr" src={qr} alt="QR code for the read-only officer bundle" /> : <p>Preparing QR…</p>}
        <Link className="secondary-button" href={`/bundle/${payload}`} style={{ marginTop: 18 }}>Open officer view</Link>
      </section>
      <div className="bundle-columns">
        <section className="card"><h2>Included records</h2><ul className="plain-list">{bundle.documents.map((source) => <li key={source}>{sourceLabels[source]}</li>)}</ul></section>
        <section className="card"><h2>Still bring physically</h2><ul className="plain-list">{bundle.physicalStillRequired.map((item) => <li key={item}>{item}</li>)}</ul></section>
      </div>
      <details className="card" style={{ marginTop: 14 }}><summary className="text-link">Show self-contained payload</summary><p className="long-code">{payload}</p></details>
      <div style={{ marginTop: 20 }}><Link className="primary-button" href="/real">See what is real and mocked <span aria-hidden="true">→</span></Link></div>
    </main>
  );
}
