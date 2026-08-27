'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import { ScreenIntro } from '@/components/ScreenIntro';
import { SessionGate } from '@/components/SessionGate';
import { buildBundle, encodeBundle } from '@/lib/engine/bundle';
import { buildConflicts } from '@/lib/engine/conflicts';
import { sourceLabels } from '@/lib/presentation';
import { getCitizen } from '@/lib/seed/citizens';
import { POST_MATRIC_SCHOLARSHIP_ID } from '@/lib/seed/entitlements';

function BundleContent({ citizenId }: { citizenId: string }) {
  const citizen = getCitizen(citizenId);
  const bundle = useMemo(
    () =>
      buildBundle(
        citizen,
        POST_MATRIC_SCHOLARSHIP_ID,
        buildConflicts(citizen, POST_MATRIC_SCHOLARSHIP_ID),
      ),
    [citizen],
  );
  const payload = useMemo(() => encodeBundle(bundle), [bundle]);
  const [qr, setQr] = useState('');

  useEffect(() => {
    const url = `${window.location.origin}/bundle/${payload}`;
    QRCode.toDataURL(url, {
      width: 440,
      margin: 1,
      color: { dark: '#17221f', light: '#fffdf8' },
    })
      .then(setQr)
      .catch(() => setQr(''));
  }, [payload]);

  return (
    <main className="page-shell bundle-shell">
      <ScreenIntro step="Share bundle" title="Share only what this check needs.">
        The link contains the complete synthetic bundle. There is no database, lookup page or list of other bundles.
      </ScreenIntro>
      <section className="card bundle-hero">
        <p className="eyebrow">Bundle reference</p>
        <p className="reference">{bundle.ref}</p>
        <p className="expiry">Expires {new Date(bundle.expiresAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
        {qr ? <img className="qr" src={qr} alt="QR code for the read-only officer bundle" /> : <p>Preparing QR…</p>}
        <Link className="secondary-button bundle-open" href={`/bundle/${payload}`}>Open read-only view</Link>
      </section>
      <div className="bundle-columns">
        <section className="card"><h2>Included records</h2><ul className="plain-list">{bundle.documents.map((source) => <li key={source}>{sourceLabels[source]}</li>)}</ul></section>
        <section className="card"><h2>Still bring physically</h2><ul className="plain-list">{bundle.physicalStillRequired.map((item) => <li key={item}>{item}</li>)}</ul></section>
      </div>
      <details className="card payload-card"><summary className="text-link">Show self-contained payload</summary><p className="long-code">{payload}</p></details>
      <Link className="back-link" href="/home">← Back to home</Link>
    </main>
  );
}

export default function BundlePage() {
  return <SessionGate>{(profile) => <BundleContent citizenId={profile.id} />}</SessionGate>;
}
