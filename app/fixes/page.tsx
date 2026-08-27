'use client';

import Link from 'next/link';
import { ScreenIntro } from '@/components/ScreenIntro';
import { buildConflicts } from '@/lib/engine/conflicts';
import { rankFixes } from '@/lib/engine/ranking';
import { getCitizen } from '@/lib/seed/citizens';
import { entitlements, getEntitlement } from '@/lib/seed/entitlements';
import { useSession } from '@/lib/state';

export default function FixesPage() {
  const { citizenId, goalId } = useSession();
  const fixes = rankFixes(buildConflicts(getCitizen(citizenId), goalId), entitlements);
  const entitlement = getEntitlement(goalId);
  return (
    <main className="page-shell results-shell">
      <ScreenIntro step="5 of 8 · Fix queue" title={fixes.length ? 'Start with the fix that unlocks the most.' : 'Nothing needs correcting.'}>
        Work from the top. This order comes only from the computed record differences.
      </ScreenIntro>
      {fixes.length ? <div className="fix-list">
        {fixes.map((fix, index) => (
          <article className={`card ${index === 0 ? 'hero-fix' : ''}`} key={`${fix.action}-${index}`}>
            <div className="fix-title"><span className="rank-number">{index + 1}</span><h2>{fix.action}</h2></div>
            {index === 0 ? <p className="unlock-line">Fixing this unlocks the {entitlement.name.toLowerCase()} record check.</p> : null}
            <p className="fix-where">Where to act: {fix.where}</p>
          </article>
        ))}
      </div> : <div className="card empty-state"><h2>Your synthetic records match</h2><p>Continue to see the rule-by-rule check.</p></div>}
      <div style={{ marginTop: 20 }}><Link className="primary-button" href="/eligibility">Check the rules <span aria-hidden="true">→</span></Link></div>
    </main>
  );
}
