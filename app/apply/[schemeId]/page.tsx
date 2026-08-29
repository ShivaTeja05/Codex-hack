import Link from 'next/link';
import { findScheme, state } from '@/lib/trail/store';
import type { DocType } from '@/lib/trail/types';
import { ApplyForm } from './ApplyForm';

export const dynamic = 'force-dynamic';

export default function ApplyPage({ params }: { params: { schemeId: string } }) {
  const scheme = findScheme(params.schemeId);

  if (!scheme) {
    return (
      <main className="tr-shell">
        <div className="tr-card" style={{ marginTop: 0 }}>
          <h1 className="tr-h1">That scheme is not in the demo</h1>
          <p className="tr-sub">This prototype carries two schemes. Start from the guided journey.</p>
          <Link className="tr-btn" href="/journey">Find the right scheme</Link>
        </div>
      </main>
    );
  }

  const store = state();
  const requiredTypes = Array.from(
    new Set(scheme.steps.flatMap((s) => s.requiredDocTypes)),
  ) as DocType[];

  return (
    <main className="tr-shell">
      <p className="tr-eyebrow">{scheme.department} · {scheme.state}</p>
      <h1 className="tr-h1">Apply — {scheme.name}</h1>
      <p className="tr-sub">{scheme.plainSummary}</p>

      <ApplyForm scheme={scheme} documents={store.documents} requiredTypes={requiredTypes} />

      <div className="tr-actions">
        <Link className="tr-btn tr-btn-ghost" href="/journey">← Back to the journey</Link>
        <Link className="tr-btn tr-btn-ghost" href="/whats-real">What is real here</Link>
      </div>
    </main>
  );
}
