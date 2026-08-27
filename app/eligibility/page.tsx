'use client';

import Link from 'next/link';
import { CitationLink } from '@/components/CitationLink';
import { ScreenIntro } from '@/components/ScreenIntro';
import { evaluateRules } from '@/lib/engine/rules';
import { allRules } from '@/lib/rules';
import { getCitizen } from '@/lib/seed/citizens';
import { useSession } from '@/lib/state';

export default function EligibilityPage() {
  const { citizenId, goalId } = useSession();
  const results = evaluateRules(getCitizen(citizenId), goalId);
  const blocked = results.filter((result) => result.status === 'block').length;
  return (
    <main className="page-shell">
      <ScreenIntro step="6 of 8 · Rule check" title={blocked ? `${blocked} rules are blocked.` : 'The demo rules pass.'}>
        This is not an approval decision. It shows what each configured rule requires and what the synthetic record says.
      </ScreenIntro>
      <div className="rule-list">
        {results.map((result) => {
          const rule = allRules.find((item) => item.id === result.ruleId)!;
          return <article className={`card rule-card ${result.status}`} key={result.ruleId}>
            <div className="card-heading"><h2>{rule.description}</h2><span className={`status-pill status-${result.status}`}>{result.status}</span></div>
            <p className="rule-message">{result.message}</p>
            <CitationLink citation={rule.source} />
          </article>;
        })}
      </div>
      <div style={{ marginTop: 20 }}><Link className="primary-button" href="/bundle">Make a scoped bundle <span aria-hidden="true">→</span></Link></div>
    </main>
  );
}
