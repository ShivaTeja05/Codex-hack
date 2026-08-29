'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { CitationLink } from '@/components/CitationLink';
import { ScreenIntro } from '@/components/ScreenIntro';
import { SessionGate } from '@/components/SessionGate';
import { buildRouting } from '@/lib/engine/routing';
import { applyChanges, buildCorrections } from '@/lib/engine/verdict';
import { getCitizen } from '@/lib/seed/citizens';
import { POST_MATRIC_SCHOLARSHIP_ID } from '@/lib/seed/entitlements';
import { dbtReasons, PFMS_SOURCE } from '@/lib/seed/reasonCodes';
import { useSession } from '@/lib/state';
import type { Issue } from '@/lib/types';

function MoneyContent({ citizenId, issues }: { citizenId: string; issues: Issue[] }) {
  const { appliedCorrections, applyCorrection } = useSession();
  const base = getCitizen(citizenId);
  const [openReason, setOpenReason] = useState<string | null>(null);

  const correction = useMemo(
    () =>
      buildCorrections(base, POST_MATRIC_SCHOLARSHIP_ID).find(
        (item) => item.field === 'bankAccount',
      ),
    [base],
  );

  const applied = correction ? appliedCorrections.includes(correction.id) : false;

  const routing = useMemo(() => {
    const changes = correction && applied ? correction.changes : [];
    return buildRouting(applyChanges(base, changes));
  }, [base, correction, applied]);

  const cost = issues.find((issue) => issue.cost)?.cost;

  if (!routing) {
    return (
      <main className="page-shell">
        <div className="card empty-state">
          <p>This synthetic record has no bank entry to route from.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="page-shell wide-shell">
      <ScreenIntro step="Where the money goes" title="One record decides this.">
        No citizen-facing screen shows you the routing record today. This one is synthetic, but the
        mechanic it demonstrates is real.
      </ScreenIntro>

      <section className={`verdict ${routing.agrees ? 'verdict-clear' : 'verdict-blocked'}`} role="status">
        <p className="verdict-line">{routing.landing}</p>
        {!routing.agrees && cost ? <p className="verdict-sub">{cost}</p> : null}
      </section>

      <section className="check-section">
        <div className="section-heading">
          <p className="eyebrow">The routing record</p>
          <h2>Your Aadhaar points at exactly one account.</h2>
        </div>
        <div className="value-compare routing-compare">
          <div className="value-row value-agreed">
            <span className="value-src">
              Benefit routing (NPCI mapper)
              <small>seeded {routing.seededOn}</small>
            </span>
            <strong>{routing.mapperAccount}</strong>
          </div>
          {routing.formAccount ? (
            <div className={`value-row ${routing.agrees ? 'value-agreed' : 'value-off'}`}>
              <span className="value-src">
                {routing.formLabel}
                <small>what you wrote on the form</small>
              </span>
              <strong>{routing.formAccount}</strong>
            </div>
          ) : null}
        </div>

        {routing.seededYearsAgo >= 2 && !routing.agrees ? (
          <p className="routing-age">
            That routing was set <strong>{routing.seededYearsAgo} years ago</strong>. Nothing has
            told you since.
          </p>
        ) : null}

        <article className="card mechanic-card">
          <h3>Why the form loses</h3>
          <p>
            The mapper holds <strong>one Aadhaar against one account at a time</strong>. Whichever
            bank seeded your Aadhaar most recently wins, and the change takes effect in about 48
            hours. Open an account for a salary or a loan, and the bank may seed it — silently
            moving every scheme&apos;s money with it.
          </p>
          <p>
            The account you typed on an application form does not override this. That is why money
            can be marked &ldquo;Sanctioned&rdquo; and still never arrive.
          </p>
          <CitationLink citation={PFMS_SOURCE} />
        </article>

        {correction && !routing.agrees ? (
          <div className="fix-actions routing-fix">
            <button
              className="primary-button"
              type="button"
              onClick={() => applyCorrection(correction.id)}
            >
              Point the form at the routed account
            </button>
            <p className="fix-where">
              In real life this is two separate errands: correct the form on the scheme portal, or
              ask your branch to re-seed Aadhaar to the account you actually use.
            </p>
          </div>
        ) : null}
        {applied ? (
          <div className="fix-result" role="status">
            <p className="fix-result-title">Form updated in this session</p>
            <p>
              The form and the routing record now name the same account. Nothing was written to any
              government system.
            </p>
          </div>
        ) : null}
      </section>

      <section className="check-section">
        <div className="section-heading">
          <p className="eyebrow">If a payment already failed</p>
          <h2>What the rejection actually meant.</h2>
        </div>
        <p className="tier-blurb">
          These reasons are published by PFMS today, in a PDF. The reason and the official remedy
          below are quoted from it. Tap one to see what it means and where to go.
        </p>
        <div className="reason-list">
          {dbtReasons.map((item) => {
            const open = openReason === item.id;
            return (
              <article className={`reason-card${open ? ' reason-open' : ''}`} key={item.id}>
                <button
                  className="reason-summary"
                  type="button"
                  aria-expanded={open}
                  onClick={() => setOpenReason(open ? null : item.id)}
                >
                  <span>
                    <span className={`status-pill basis-${item.basis}`}>{item.basis}-based</span>
                    <strong>{item.reason}</strong>
                  </span>
                  <span aria-hidden="true">{open ? '−' : '+'}</span>
                </button>
                {open ? (
                  <div className="reason-body">
                    <p className="reason-plain">{item.plainMeaning}</p>
                    <p className="reason-official">
                      <strong>Official remedy:</strong> {item.officialRemedy}
                    </p>
                    <p className="reason-do-title">What you actually do</p>
                    <ol className="reason-steps">
                      {item.whatYouDo.map((step) => (
                        <li key={step}>{step}</li>
                      ))}
                    </ol>
                    <CitationLink citation={item.source} />
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      </section>

      <section className="card gap-card">
        <p className="eyebrow">What we would ask for</p>
        <h2>These codes exist. They are just not where the citizen is.</h2>
        <p>
          PFMS already publishes this mapping. It sits in a PDF that a first-generation applicant
          will never find, in language written for a department. Nothing new needs to be built —
          the same table, exposed where the rejection is shown, would turn a returned payment into
          an instruction.
        </p>
        <div className="next-actions">
          <Link className="secondary-button" href="/map">
            See the linkage map
          </Link>
          <Link className="secondary-button" href="/real">
            What&apos;s real here
          </Link>
        </div>
      </section>

      <Link className="back-link" href="/home">
        ← Back to home
      </Link>
    </main>
  );
}

export default function MoneyPage() {
  return (
    <SessionGate>
      {(profile) => <MoneyContent citizenId={profile.id} issues={profile.issues} />}
    </SessionGate>
  );
}
