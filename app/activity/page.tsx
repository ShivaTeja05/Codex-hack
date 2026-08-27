'use client';

import Link from 'next/link';
import { ScreenIntro } from '@/components/ScreenIntro';
import { SessionGate } from '@/components/SessionGate';
import { useSession } from '@/lib/state';

export default function ActivityPage() {
  const { activityChoices, reportedIssues, setActivityChoice } = useSession();
  return (
    <SessionGate>
      {(profile) => (
        <main className="page-shell wide-shell">
          <ScreenIntro step="Activity" title="Who checked your details.">
            This is a verification log. It shows who checked you—not what is linked to you. Those are different things.
          </ScreenIntro>
          <div className="activity-list">
            {profile.activity.map((event) => {
              const choice = activityChoices[event.id] ?? event.recognised;
              const report = reportedIssues[`activity-${event.id}`];
              return (
                <article className="card activity-card" key={event.id}>
                  <div className="activity-date"><span>{event.when.split(' ')[0]}</span><small>{event.when.split(' ').slice(1).join(' ')}</small></div>
                  <div className="activity-copy"><h2>{event.agency}</h2><p>Verified {event.purpose.toLowerCase()} on {event.when}.</p></div>
                  <div className="recognition-actions" aria-label={`Do you recognise ${event.agency}?`}>
                    <button className={choice === true ? 'selected' : ''} type="button" onClick={() => setActivityChoice(event.id, true)}>Recognise</button>
                    <button className={choice === false ? 'selected warning' : ''} type="button" onClick={() => setActivityChoice(event.id, false)}>Don&apos;t recognise</button>
                  </div>
                  {report ? <div className="report-receipt"><strong>Issue created · {report.status}</strong><span>Reference {report.ref}</span><Link href="/issues">Open issues</Link></div> : null}
                </article>
              );
            })}
          </div>
          <Link className="back-link" href="/home">← Back to home</Link>
        </main>
      )}
    </SessionGate>
  );
}
