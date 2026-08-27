import Link from 'next/link';
import { decodeBundle } from '@/lib/engine/bundle';
import { sourceLabels } from '@/lib/presentation';

export default function OfficerBundlePage({ params }: { params: { code: string } }) {
  const bundle = decodeBundle(params.code);
  if (!bundle) return <main className="page-shell"><div className="card empty-state"><h1>Bundle not readable</h1><p>The self-contained reference is incomplete or changed.</p><Link href="/" className="secondary-button" style={{ marginTop: 16 }}>Return home</Link></div></main>;
  const expired = new Date(bundle.expiresAt).getTime() < Date.now();
  return (
    <main className="page-shell">
      <div className="screen-intro"><p className="eyebrow">Read-only officer view</p><h1>Scoped synthetic record bundle</h1><p>This page decoded the URL itself. No search or database lookup was used.</p></div>
      <section className="card bundle-hero"><span className={`status-pill status-${expired ? 'block' : 'pass'}`}>{expired ? 'Expired' : 'Active'}</span><p className="reference">{bundle.ref}</p><p className="expiry">Expires {new Date(bundle.expiresAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p></section>
      <section className="card"><h2>Records in scope</h2><ul className="plain-list">{bundle.documents.map((source) => <li key={source}>{sourceLabels[source]}</li>)}</ul></section>
      <section className="card"><h2>Pre-computed differences</h2>{bundle.conflicts.length ? <ul className="plain-list">{bundle.conflicts.map((conflict) => <li key={conflict.id}><strong>{conflict.field}</strong> · {conflict.severity} · {conflict.values.map((item) => item.value).join(' / ')}</li>)}</ul> : <p>No differences in this bundle.</p>}</section>
      <section className="card"><h2>Physical records still required</h2><ul className="plain-list">{bundle.physicalStillRequired.map((item) => <li key={item}>{item}</li>)}</ul></section>
    </main>
  );
}
