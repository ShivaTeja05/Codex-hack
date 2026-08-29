'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { CitationLink } from '@/components/CitationLink';
import { ScreenIntro } from '@/components/ScreenIntro';
import { SessionGate } from '@/components/SessionGate';
import { applyChanges, buildCorrections, buildVerdict } from '@/lib/engine/verdict';
import { getCitizen } from '@/lib/seed/citizens';
import { getEntitlement, POST_MATRIC_SCHOLARSHIP_ID } from '@/lib/seed/entitlements';
import { useSession } from '@/lib/state';
import type { Correction } from '@/lib/engine/verdict';

function CorrectionCard({
  correction,
  applied,
  blockingBefore,
  blockingAfter,
  onApply,
  onUndo,
}: {
  correction: Correction;
  applied: boolean;
  blockingBefore: number;
  blockingAfter: number;
  onApply(): void;
  onUndo(): void;
}) {
  const unblocks = correction.clearsBlocking;
  return (
    <article className={`fix-card${applied ? ' fix-applied' : ''}`}>
      <div className="fix-head">
        <div>
          <p className="eyebrow">{correction.fieldLabel}</p>
          <h3>
            {correction.disagreements.length + 1} records disagree on your{' '}
            {correction.fieldLabel.toLowerCase()}
          </h3>
        </div>
        <span className={`status-pill ${unblocks ? 'status-blocked' : 'status-expired'}`}>
          {unblocks
            ? `unblocks ${unblocks} rule${unblocks === 1 ? '' : 's'}`
            : correction.sideEffect ?? 'does not block, worth fixing'}
        </span>
      </div>

      <div className="value-compare">
        <div className="value-row value-agreed">
          <span className="value-src">
            {correction.authorityLabel}
            <small>issuer-signed</small>
          </span>
          <strong>{correction.agreedValue}</strong>
        </div>
        {correction.disagreements.map((item) => (
          <div className="value-row value-off" key={item.source}>
            <span className="value-src">
              {item.label}
              <small>self-declared</small>
            </span>
            <strong>{item.value}</strong>
          </div>
        ))}
      </div>

      <p className="fix-note">
        OpenTrail does not decide {correction.disagreementNoun}. It matches every self-declared record
        to the value an issuer has already signed.
      </p>

      {applied ? (
        <div className="fix-result" role="status">
          <p className="fix-result-title">Correction applied</p>
          <ul className="plain-list">
            <li>
              Rewrote {correction.changes.length} record
              {correction.changes.length === 1 ? '' : 's'}: {correction.touchedLabels.join(', ')}
            </li>
            <li>
              Blocking rules: {blockingBefore} → {blockingAfter}
            </li>
            <li>
              Where you do this for real: <strong>{correction.where}</strong>
            </li>
          </ul>
          <button className="link-button" type="button" onClick={onUndo}>
            Undo this correction
          </button>
        </div>
      ) : (
        <div className="fix-actions">
          <button className="primary-button" type="button" onClick={onApply}>
            Apply this correction
          </button>
          <p className="fix-where">Where you do this for real: {correction.where}</p>
        </div>
      )}
    </article>
  );
}

function CheckContent({ citizenId }: { citizenId: string }) {
  const { appliedCorrections, applyCorrection, undoCorrection, resetCorrections } = useSession();
  const entitlement = getEntitlement(POST_MATRIC_SCHOLARSHIP_ID);
  const base = getCitizen(citizenId);

  const corrections = useMemo(
    () => buildCorrections(base, POST_MATRIC_SCHOLARSHIP_ID),
    [base],
  );
  const startingVerdict = useMemo(
    () => buildVerdict(base, POST_MATRIC_SCHOLARSHIP_ID),
    [base],
  );

  const amended = useMemo(() => {
    const changes = corrections
      .filter((correction) => appliedCorrections.includes(correction.id))
      .flatMap((correction) => correction.changes);
    return applyChanges(base, changes);
  }, [base, corrections, appliedCorrections]);

  const verdict = useMemo(
    () => buildVerdict(amended, POST_MATRIC_SCHOLARSHIP_ID),
    [amended],
  );

  const blockedNow = verdict.blocking.length;
  const blockedAtStart = startingVerdict.blocking.length;
  const fixableLeft = corrections.filter(
    (correction) => !appliedCorrections.includes(correction.id) && correction.clearsBlocking > 0,
  ).length;
  const clear = blockedNow === 0;

  return (
    <main className="page-shell wide-shell">
      <ScreenIntro step="Before you apply" title={entitlement.name}>
        OpenTrail reads the synthetic records you are about to submit and checks them against this
        scheme&apos;s rules — before the portal does.
      </ScreenIntro>

      <section className={`verdict ${clear ? 'verdict-clear' : 'verdict-blocked'}`} role="status">
        <p className="verdict-line">
          {clear ? 'Nothing blocks this application.' : 'This application will be rejected today.'}
        </p>
        <p className="verdict-sub">
          {clear
            ? `All ${verdict.passing.length} rules for this scheme pass on your synthetic records.`
            : `${blockedNow} rule${blockedNow === 1 ? ' blocks' : 's block'} it${
                fixableLeft ? ` · ${fixableLeft} you can fix on this page` : ''
              }.`}
        </p>
        {appliedCorrections.length > 0 ? (
          <p className="verdict-progress">
            You started with {blockedAtStart}. You are now at {blockedNow}.{' '}
            <button className="link-inline" type="button" onClick={resetCorrections}>
              Start over
            </button>
          </p>
        ) : null}
      </section>

      {corrections.length > 0 ? (
        <section className="check-section">
          <div className="section-heading">
            <p className="eyebrow">Fix these</p>
            <h2>Ordered by how much each one unblocks.</h2>
          </div>
          <div className="fix-list">
            {corrections.map((correction) => {
              const applied = appliedCorrections.includes(correction.id);
              const withoutThis = corrections
                .filter(
                  (other) => other.id !== correction.id && appliedCorrections.includes(other.id),
                )
                .flatMap((other) => other.changes);
              const before = buildVerdict(
                applyChanges(base, withoutThis),
                POST_MATRIC_SCHOLARSHIP_ID,
              ).blocking.length;
              return (
                <CorrectionCard
                  key={correction.id}
                  correction={correction}
                  applied={applied}
                  blockingBefore={before}
                  blockingAfter={applied ? blockedNow : before - correction.clearsBlocking}
                  onApply={() => applyCorrection(correction.id)}
                  onUndo={() => undoCorrection(correction.id)}
                />
              );
            })}
          </div>
        </section>
      ) : null}

      {verdict.unfixable.length > 0 ? (
        <section className="check-section">
          <div className="section-heading">
            <p className="eyebrow">Not a paperwork problem</p>
            <h2>No correction on this page changes these.</h2>
          </div>
          {verdict.unfixable.map((rule) => (
            <article className="card unfixable-card" key={rule.ruleId}>
              <h3>{rule.description}</h3>
              <p className="rule-message">{rule.message}</p>
              <p>
                OpenTrail does not decide your case. If the figure on the certificate is out of date or
                wrong, the issuing office reissues it. If it is correct, this scheme is not open to
                you on today&apos;s records, and applying will cost you the processing window.
              </p>
              <CitationLink citation={rule.source} />
            </article>
          ))}
        </section>
      ) : null}

      {verdict.warnings.length > 0 ? (
        <section className="check-section">
          <div className="section-heading">
            <p className="eyebrow">Worth checking</p>
            <h2>These do not block, yet.</h2>
          </div>
          {verdict.warnings.map((rule) => (
            <article className="card warn-card" key={rule.ruleId}>
              <h3>{rule.description}</h3>
              <p className="rule-message">{rule.message}</p>
              <CitationLink citation={rule.source} />
            </article>
          ))}
        </section>
      ) : null}

      <details className="card passing-card">
        <summary className="text-link">
          What already passes ({verdict.passing.length} rules)
        </summary>
        <ul className="plain-list passing-list">
          {verdict.passing.map((rule) => (
            <li key={rule.ruleId}>
              <strong>{rule.description}</strong>
              <span>{rule.message}</span>
            </li>
          ))}
        </ul>
      </details>

      <section className={`next-step ${clear ? 'next-clear' : 'next-hold'}`}>
        {clear ? (
          <>
            <h2>You can apply.</h2>
            <p>
              Take a scoped bundle to the verifying officer so they can check these records without
              photocopies.
            </p>
            <div className="next-actions">
              <Link className="primary-button" href="/bundle">
                Create the officer bundle
              </Link>
              <a
                className="secondary-button"
                href={entitlement.applyUrl}
                target="_blank"
                rel="noreferrer"
              >
                Open the official portal ↗
              </a>
            </div>
          </>
        ) : (
          <>
            <h2>Do not submit yet.</h2>
            <p>
              Submitting today spends your one application on a defect cycle. Clear the blocking
              rules above first — each correction here shows you where to make it for real.
            </p>
            <div className="next-actions">
              <Link className="secondary-button" href="/records">
                See every connected record
              </Link>
            </div>
          </>
        )}
      </section>

      <p className="ownership-note">
        Corrections apply to this session&apos;s in-memory copy only. OpenTrail cannot write to any
        government record — see{' '}
        <Link className="text-link" href="/real">
          what&apos;s real
        </Link>
        .
      </p>
      <Link className="back-link" href="/home">
        ← Back to home
      </Link>
    </main>
  );
}

export default function CheckPage() {
  return <SessionGate>{(profile) => <CheckContent citizenId={profile.id} />}</SessionGate>;
}
