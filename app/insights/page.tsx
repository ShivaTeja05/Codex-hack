import Link from 'next/link';
import { computeInsights, interpret, type StepInsight } from '@/lib/trail/insights';
import { state } from '@/lib/trail/store';
import { syntheticApplications } from '@/lib/trail/seed';

export const dynamic = 'force-dynamic';

const pct = (value: number) => `${Math.round(value * 100)}%`;

function SplitBar({ step }: { step: StepInsight }) {
  const total = Math.max(step.medianWaitDays + step.medianHandleDays, 0.1);
  const waitPct = Math.round((step.medianWaitDays / total) * 100);
  return (
    <div className="in-bar" role="img" aria-label={`Waiting ${step.medianWaitDays} days, being handled ${step.medianHandleDays} days`}>
      {waitPct > 0 ? <span className="in-bar-wait" style={{ width: `${waitPct}%` }} /> : null}
      {100 - waitPct > 0 ? <span className="in-bar-handle" style={{ width: `${100 - waitPct}%` }} /> : null}
    </div>
  );
}

export default function InsightsPage() {
  const store = state();
  // Real applications + synthetic ones = the population the medians derive from.
  const applications = [...store.applications, ...syntheticApplications];
  const insights = computeInsights(store.schemes, applications, Date.now());

  const totalApps = new Set(applications.map((app) => app.id)).size;
  const worst = insights
    .flatMap((scheme) => scheme.steps)
    .filter((step) => step.n > 0)
    .sort((a, b) => b.medianTotalDays - a.medianTotalDays)[0];

  return (
    <main className="tr-shell">
      <p className="tr-eyebrow">Department & public insights</p>
      <h1 className="tr-h1">Where the days actually go</h1>
      <p className="tr-sub">
        Turnaround for every step of every scheme, computed from the access-event
        timeline of {totalApps} applications. Grey is time a file spent waiting in a
        queue before anyone opened it. Blue is an officer actually working.
      </p>

      {worst ? (
        <section className="tr-now">
          <dl>
            <div>
              <dt>Slowest step right now</dt>
              <dd>{worst.plainName}</dd>
            </div>
            <div>
              <dt>Held at</dt>
              <dd>{worst.officeName}</dd>
            </div>
            <div>
              <dt>Median time</dt>
              <dd>{worst.medianTotalDays} days <span className="tr-soft">(target {worst.slaDays})</span></dd>
            </div>
            <div>
              <dt>Of which queue</dt>
              <dd>{worst.medianWaitDays} days <span className="tr-soft">({pct(worst.queueShare)})</span></dd>
            </div>
          </dl>
          <p className="tr-note" style={{ marginTop: 16, marginBottom: 0 }}>
            {interpret(worst)}
          </p>
        </section>
      ) : null}

      {insights.map((scheme) => (
        <section className="tr-card" key={scheme.schemeId}>
          <p className="tr-eyebrow" style={{ marginBottom: 2 }}>{scheme.department} · {scheme.state}</p>
          <h2 className="tr-h2">{scheme.schemeName}</h2>

          <div className="in-table-wrap">
            <table className="in-table">
              <thead>
                <tr>
                  <th>Step</th>
                  <th>Office</th>
                  <th className="in-num">Median</th>
                  <th className="in-num">Target</th>
                  <th className="in-split">Waiting vs handling</th>
                  <th className="in-num">Breach</th>
                </tr>
              </thead>
              <tbody>
                {scheme.steps.map((step) => (
                  <tr key={step.order} className={step.queueDominated ? 'in-queue' : ''}>
                    <td>
                      <span className="in-step-name">{step.plainName}</span>
                      {step.queueDominated ? <span className="in-tag">queue bottleneck</span> : null}
                    </td>
                    <td className="in-office">{step.officeName}</td>
                    <td className="in-num tr-mono">{step.medianTotalDays}d</td>
                    <td className="in-num tr-mono">{step.slaDays}d</td>
                    <td className="in-split">
                      <SplitBar step={step} />
                      <span className="in-split-key tr-mono">
                        {step.medianWaitDays}d · {step.medianHandleDays}d
                      </span>
                    </td>
                    <td className={`in-num tr-mono ${step.breachRate > 0.3 ? 'in-breach' : ''}`}>
                      {pct(step.breachRate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="tr-note" style={{ marginBottom: 0 }}>{interpret(scheme.bottleneck)}</p>
        </section>
      ))}

      <section className="tr-card">
        <h2 className="tr-h2">One engine, every department</h2>
        <p style={{ margin: '0 0 8px', color: 'var(--tr-muted)', fontSize: 15, lineHeight: 1.5 }}>
          These two schemes sit in different departments — Social Welfare and Revenue — and
          share zero custom code. A scheme is a list of steps in a table: a name, an office,
          a target, and the documents each step needs. Adding a department is a row, not a rebuild.
        </p>
        <p style={{ margin: 0, color: 'var(--tr-muted)', fontSize: 15, lineHeight: 1.5 }}>
          The same is true across states. The workflow rows change; the tracking layer does not.
        </p>
      </section>

      <div className="tr-actions">
        <Link className="tr-btn tr-btn-ghost" href="/track/TRL-4K9-2XQ">See a citizen&apos;s view</Link>
        <Link className="tr-btn tr-btn-ghost" href="/whats-real">What is real here</Link>
      </div>
    </main>
  );
}
