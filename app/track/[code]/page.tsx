import Link from 'next/link';
import { days, deriveSteps, summarise } from '@/lib/trail/derive';
import {
  findApplication,
  findScheme,
  findShareCode,
  state,
} from '@/lib/trail/store';
import type { DerivedStep } from '@/lib/trail/derive';
import { asLang, LANGS, STRINGS, tScheme, tStep, type Lang } from '@/lib/trail/i18n';

export const dynamic = 'force-dynamic';

function TimeBar({ item, lang }: { item: DerivedStep; lang: Lang }) {
  const t = STRINGS[lang];
  const total = Math.max(item.waitingMs + item.handlingMs, 1);
  const waitPct = Math.round((item.waitingMs / total) * 100);
  const handlePct = 100 - waitPct;
  if (item.status === 'NOT_STARTED') return null;

  return (
    <div className="tr-bar-wrap">
      <div className="tr-bar" role="img" aria-label={`${t.waiting} ${days(item.waitingMs)}, ${t.beingChecked} ${days(item.handlingMs)}`}>
        {waitPct > 0 ? <span className="tr-bar-wait" style={{ width: `${waitPct}%` }} /> : null}
        {handlePct > 0 ? <span className="tr-bar-handle" style={{ width: `${handlePct}%` }} /> : null}
      </div>
      <p className="tr-bar-key">
        <span><i className="tr-key-wait" /> {t.waiting} {days(item.waitingMs)}{t.day === 'day' ? 'd' : ''}</span>
        <span><i className="tr-key-handle" /> {t.beingChecked} {days(item.handlingMs)}{t.day === 'day' ? 'd' : ''}</span>
      </p>
    </div>
  );
}

export default function TrackPage({
  params,
  searchParams,
}: {
  params: { code: string };
  searchParams: { lang?: string };
}) {
  const lang = asLang(searchParams.lang);
  const t = STRINGS[lang];
  const dayLabel = (value: number) => `${value} ${value === 1 ? t.day : t.days}`;
  const langHref = (code: Lang) =>
    `/track/${params.code}${code === 'en' ? '' : `?lang=${code}`}`;

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

  const headline = summary.needsCitizen
    ? t.status.ACTION_NEEDED
    : summary.doneCount === summary.totalCount && summary.totalCount > 0
      ? t.approved
      : current
        ? tStep(current.step.plainName, lang)
        : t.waitingToStart;

  return (
    <main className="tr-shell">
      <nav className="tr-lang" aria-label="Language">
        {LANGS.map((l) => (
          <Link
            key={l.code}
            href={langHref(l.code)}
            className={`tr-lang-btn ${l.code === lang ? 'tr-lang-on' : ''}`}
            aria-current={l.code === lang ? 'true' : undefined}
          >
            {l.label}
          </Link>
        ))}
      </nav>

      <p className="tr-eyebrow">{tScheme(scheme.name, lang)}</p>
      <p className="tr-sub">
        {t.submitted} {new Date(application.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
        {' · '}<span className="tr-mono">{shareCode.code}</span>
      </p>

      <section className={`tr-now ${summary.needsCitizen ? 'tr-now-action' : ''}`}>
        <dl>
          <div><dt>{t.nowAt}</dt><dd>{headline}</dd></div>
          {current ? (
            <>
              <div><dt>{t.sittingAt}</dt><dd>{current.step.officeName}</dd></div>
              <div>
                <dt>{t.forLabel}</dt>
                <dd>
                  {dayLabel(days(current.totalMs))}{' '}
                  <span className="tr-soft">({t.usuallyTakes} {current.step.slaDays})</span>
                </dd>
              </div>
            </>
          ) : null}
          <div>
            <dt>{t.youNeed}</dt>
            <dd>{summary.needsCitizen ? t.replaceOne : t.nothing}</dd>
          </div>
        </dl>
        {current?.slaBreached ? (
          <p className="tr-breach">{t.breach(current.overdueDays)}</p>
        ) : null}
      </section>

      <ol className="tr-timeline">
        {derived.map((item, index) => (
          <li className={`tr-step tr-${item.status.toLowerCase()}`} key={item.step.id} style={{ animationDelay: `${index * 55}ms` }}>
            <span className="tr-dot" aria-hidden="true" />
            <div className="tr-step-body">
              <div className="tr-step-head">
                <h2>{tStep(item.step.plainName, lang)}</h2>
                <span className={`tr-pill tr-pill-${item.status.toLowerCase()}`}>{t.status[item.status]}</span>
              </div>
              <p className="tr-office">{item.step.officeName}</p>

              {item.status === 'DONE' ? (
                <p className="tr-done">{t.doneIn} {dayLabel(days(item.totalMs))}</p>
              ) : null}
              <TimeBar item={item} lang={lang} />

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
        <div className="tr-step-head" style={{ marginBottom: 10 }}>
          <h2 className="tr-h2" style={{ margin: 0 }}>{t.whoOpened}</h2>
          <Link className="tr-link" href="/access" style={{ fontSize: 13 }}>See all →</Link>
        </div>
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
                  {event.eventType === 'ACCESS_DENIED_RATE_LIMIT' ? ` (${t.blocked})` : ''}
                </span>
              </li>
            ))}
        </ul>
      </section>

      {t.langNote ? <p className="tr-soft" style={{ marginTop: 14 }}>{t.langNote}</p> : null}

      <div className="tr-actions">
        <Link className="tr-btn tr-btn-ghost" href={`/officer/${shareCode.code}`}>Open the officer view (demo)</Link>
        <Link className="tr-btn tr-btn-ghost" href="/whats-real">What is real here</Link>
      </div>
    </main>
  );
}
