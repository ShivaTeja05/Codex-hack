'use client';

import Link from 'next/link';
import { ScreenIntro } from '@/components/ScreenIntro';
import { buildConflicts } from '@/lib/engine/conflicts';
import { fieldLabels, sourceLabels } from '@/lib/presentation';
import { getCitizen } from '@/lib/seed/citizens';
import { useSession } from '@/lib/state';

export default function ConflictsPage() {
  const { citizenId, goalId } = useSession();
  const conflicts = buildConflicts(getCitizen(citizenId), goalId);
  return (
    <main className="page-shell">
      <ScreenIntro step="4 of 8 · Differences" title={conflicts.length ? `We found ${conflicts.length} details to check.` : 'These records agree.'}>
        Small differences can delay an application. Blocking items need attention first; warnings are worth checking.
      </ScreenIntro>
      {conflicts.length ? (
        <div className="conflict-list">
          {conflicts.map((conflict) => (
            <article className={`card conflict-card ${conflict.severity === 'warning' ? 'warning' : ''}`} key={conflict.id}>
              <div className="card-heading">
                <h2>{fieldLabels[conflict.field]}</h2>
                <span className={`status-pill status-${conflict.severity === 'blocking' ? 'block' : 'warn'}`}>{conflict.severity}</span>
              </div>
              <div className="value-pair">
                {conflict.values.map((item, index) => (
                  <div className="value-box" key={`${item.source}-${index}`}>
                    <small>{sourceLabels[item.source]}</small>
                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>
              <p className="why-line">Why it matters: {conflict.severity === 'blocking' ? 'this mismatch can block the scholarship check.' : 'this may cause a payment or document delay.'}</p>
            </article>
          ))}
        </div>
      ) : <div className="card empty-state"><h2>No mismatches found</h2><p>The same fields match after case, spacing and punctuation are ignored.</p></div>}
      <div style={{ marginTop: 20 }}><Link className="primary-button" href="/fixes">See what to fix first <span aria-hidden="true">→</span></Link></div>
    </main>
  );
}
