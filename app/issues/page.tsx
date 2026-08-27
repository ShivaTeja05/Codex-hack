'use client';

import Link from 'next/link';
import { CitationLink } from '@/components/CitationLink';
import { ScreenIntro } from '@/components/ScreenIntro';
import { SessionGate } from '@/components/SessionGate';
import { issueFromActivity, sortIssues } from '@/lib/engine/issues';
import { useSession } from '@/lib/state';

export default function IssuesPage() {
  const { activityChoices, reportedIssues, reportIssue } = useSession();
  return (
    <SessionGate>
      {(profile) => {
        const activityIssues = profile.activity
          .filter((event) => activityChoices[event.id] === false)
          .map(issueFromActivity);
        const issues = sortIssues([...profile.issues, ...activityIssues]);
        return (
          <main className="page-shell wide-shell">
            <ScreenIntro step="Issues" title="Problems that can cost time or money.">
              Each card names the problem, the real consequence in this demo, and one next action.
            </ScreenIntro>
            <div className="issue-list">
              {issues.map((issue) => {
                const report = reportedIssues[issue.id];
                return (
                  <article className={`issue-card severity-${issue.severity}`} key={issue.id}>
                    <div className="issue-marker" aria-hidden="true" />
                    <div className="issue-body">
                      <div className="issue-heading">
                        <div><span className="issue-type">{issue.type.replace(/_/g, ' ')}</span><h2>{issue.title}</h2></div>
                        <span className={`status-pill severity-label-${issue.severity}`}>{issue.severity}</span>
                      </div>
                      <p>{issue.detail}</p>
                      {issue.cost ? <p className="issue-cost">{issue.cost}</p> : null}
                      <div className="issue-actions">
                        {issue.action.href ? (
                          <Link className="secondary-button" href={issue.action.href}>{issue.action.label}</Link>
                        ) : (
                          <button className="secondary-button" type="button" onClick={() => reportIssue(issue.id)}>{issue.action.label}</button>
                        )}
                        <CitationLink citation={issue.source} />
                      </div>
                      {report ? <div className="report-receipt" role="status"><strong>Report {report.status}</strong><span>Reference {report.ref}</span></div> : null}
                    </div>
                  </article>
                );
              })}
            </div>
            <Link className="back-link" href="/home">← Back to home</Link>
          </main>
        );
      }}
    </SessionGate>
  );
}
