import Link from 'next/link';
import { days, deriveSteps, summarise } from '@/lib/trail/derive';

const dayLabel = (value: number) => `${value} day${value === 1 ? '' : 's'}`;
import {
  findApplication,
  findScheme,
  findShareCode,
  state,
} from '@/lib/trail/store';
import type { DerivedStep } from '@/lib/trail/derive';
import type { StepStatus } from '@/lib/trail/types';

export const dynamic = 'force-dynamic';

const statusLabel: Record<StepStatus, string> = {
  NOT_STARTED: 'Not started',
  WAITING: 'Waiting in queue',
  IN_REVIEW: 'Being checked',
  ACTION_NEEDED: 'Action needed from you',
  DONE: 'Done',
};

function TimeBar({ item }: { item: DerivedStep }) {
  const total = Math.max(item.waitingMs + item.handlingMs, 1);
  const waitPct = Math.round((item.waitingMs / total) * 100);
  const handlePct = 100 - waitPct;
  if (item.status === 'NOT_STARTED') return null;

  return (
    <div className="tr-bar-wrap">
      <div className="tr-bar" role="img" aria-label={`Waiting ${days(item.waitingMs)} days, being checked ${days(item.handlingMs)} days`}>
        {waitPct > 0 ? <span className="tr-bar-wait" style={{ width: `${waitPct}%` }} /> : null}
        {handlePct > 0 ? <span className="tr-bar-handle" style={{ width: `${handlePct}%` }} /> : null}
      </div>
      <p className="tr-bar-key">
        <span><i className="tr-key-wait" /> waiting {days(item.waitingMs)}d</span>
        <span><i className="tr-key-handle" /> being checked {days(item.handlingMs)}d</span>
      </p>
    </div>
  );
}

export default function TrackPage({ params }: { params: { code: string } }) {
  const shareCode = findShareCode(params.code);
  const application = findApplication(shareCode?.applicationId);
  const scheme = findScheme(application?.schemeId);

  if (!shareCode || !application || !scheme) {
    return (
      <main className="tr-shell">
        <div className="tr-card">
          <h1 className="tr-h1">That code does not open anything</h1>
          <p>Check the code and try again. Codes look like TRL-4K9-2XQ.</p>
          <Link className="tr-btn" href="/track">Try another code</Link>
        </div>
      </main>
    );
  }

  const store = state();
  const derived = deriveSteps(
    scheme.steps,
    application.steps,
    store.events,
    store.flags,
    store.documents,
  );
  const summary = summarise(derived);
  const current = summary.current;

  return (
    <main className="tr-shell">
      <p className="tr-eyebrow">{scheme.name}</p>
      <p className="tr-sub">
        Submitted {new Date(application.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
        {' · '}<span className="tr-mono">{shareCode.code}</span>
      </p>

      <section className={`tr-now ${summary.needsCitizen ? 'tr-now-action' : ''}`}>
        <dl>
          <div><dt>Now at</dt><dd>{summary.headline}</dd></div>
          {current ? (
            <>
              <div><dt>Sitting at</dt><dd>{current.step.officeName}</dd></div>
              <div>
                <dt>For</dt>
                <dd>
                  {dayLabel(days(current.totalMs))}{' '}
                  <span className="tr-soft">(this step usually takes {current.step.slaDays})</span>
                </dd>
              </div>
            </>
          ) : null}
          <div>
            <dt>You need to do</dt>
            <dd>{summary.needsCitizen ? 'Replace one document — see below' : 'nothing right now'}</dd>
          </div>
        </dl>
        {current?.slaBreached ? (
          <p className="tr-breach">Past its usual time by {current.overdueDays} day{current.overdueDays === 1 ? '' : 's'}.</p>
        ) : null}
      </section>

      <ol className="tr-timeline">
        {derived.map((item, index) => (
          <li className={`tr-step tr-${item.status.toLowerCase()}`} key={item.step.id} style={{ animationDelay: `${index * 55}ms` }}>
            <span className="tr-dot" aria-hidden="true" />
            <div className="tr-step-body">
              <div className="tr-step-head">
                <h2>{item.step.plainName}</h2>
                <span className={`tr-pill tr-pill-${item.status.toLowerCase()}`}>{statusLabel[item.status]}</span>
              </div>
              <p className="tr-office">{item.step.officeName}</p>

              {item.status === 'DONE' ? (
                <p className="tr-done">Done in {dayLabel(days(item.totalMs))}</p>
              ) : null}
              <TimeBar item={item} />

              {item.openFlags.map((flag) => (
                <div className="tr-flag" key={flag.id}>
                  <p className="tr-flag-title">{flag.officerLabel} flagged one document</p>
                  <p className="tr-flag-comment">“{flag.comment}”</p>
                  <Link className="tr-btn tr-btn-small" href={`/track/${shareCode.code}/replace?doc=${flag.documentId}`}>
                    Replace this document
                  </Link>
                  <p className="tr-soft">Your code stays the same. You are not starting again.</p>
                </div>
              ))}
            </div>
          </li>
        ))}
      </ol>

      <section className="tr-card">
        <h2 className="tr-h2">Who has opened your documents</h2>
        <ul className="tr-access">
          {store.events
            .filter(
              (event) =>
                event.documentId &&
                (event.applicationId === application.id ||
                  event.shareCode === shareCode.code),
            )
            .slice(-6)
            .reverse()
            .map((event) => (
              <li key={event.id}>
                <span className="tr-mono">{new Date(event.ts).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}</span>
                <span>
                  {event.actorLabel} — {store.documents.find((d) => d.id === event.documentId)?.plainName}
                  {event.eventType === 'ACCESS_DENIED_RATE_LIMIT' ? ' (blocked)' : ''}
                </span>
              </li>
            ))}
        </ul>
      </section>

      <div className="tr-actions">
        <Link className="tr-btn tr-btn-ghost" href={`/officer/${shareCode.code}`}>Open the officer view (demo)</Link>
        <Link className="tr-btn tr-btn-ghost" href="/whats-real">What is real here</Link>
      </div>
    </main>
  );
}
