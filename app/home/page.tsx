'use client';

import Link from 'next/link';
import { IdentityCard } from '@/components/IdentityCard';
import { SessionGate } from '@/components/SessionGate';
import { buildVerdict } from '@/lib/engine/verdict';
import { getCitizen } from '@/lib/seed/citizens';
import { POST_MATRIC_SCHOLARSHIP_ID } from '@/lib/seed/entitlements';

const actions = [
  { label: 'Applying for a scholarship', detail: 'Check it against the rules before you submit', href: '/check' },
  { label: "Money didn't arrive", detail: 'See routing problems and what they cost', href: '/issues' },
  { label: 'Just show me my records', detail: 'Open the fixed-order record table', href: '/records' },
];

const sections = [
  { label: 'Check before you apply', href: '/check', note: 'Will this be rejected?' },
  { label: 'Records', href: '/records', note: 'What agrees and what does not' },
  { label: 'Issues', href: '/issues', note: 'Problems and one next action' },
  { label: 'Activity', href: '/activity', note: 'Who verified your details' },
  { label: 'Documents', href: '/documents', note: 'Your synthetic wallet list' },
];

export default function HomePage() {
  return (
    <SessionGate>
      {(profile) => {
        const verdict = buildVerdict(getCitizen(profile.id), POST_MATRIC_SCHOLARSHIP_ID);
        const blocked = verdict.blocking.length;
        const money = profile.issues.find((issue) => issue.cost)?.cost;
        return (
        <main className="page-shell home-shell">
          <div className="home-heading">
            <div><p className="eyebrow">Your synthetic record</p><h1>Check before it costs you.</h1></div>
            <p>Nothing on this page is saved. Reveal lasts only for this session.</p>
          </div>
          <IdentityCard profile={profile} />
          <Link className={`verdict-strip ${blocked ? 'verdict-strip-blocked' : 'verdict-strip-clear'}`} href="/check">
            <span className="verdict-strip-copy">
              <strong>
                {blocked
                  ? 'Your scholarship will be rejected today.'
                  : 'Nothing blocks your scholarship.'}
              </strong>
              <small>
                {blocked
                  ? `${blocked} rule${blocked === 1 ? '' : 's'} block it${money ? ` · ${money}` : ''}. Tap to see which.`
                  : 'Tap to see every rule that was checked.'}
              </small>
            </span>
            <span aria-hidden="true">→</span>
          </Link>
          <section className="home-section">
            <div className="section-heading"><p className="eyebrow">Choose a goal</p><h2>What you can do</h2></div>
            <div className="action-grid">
              {actions.map((action, index) => (
                <Link className="action-card" href={action.href} key={action.label}>
                  <span className="action-number">0{index + 1}</span>
                  <strong>{action.label}</strong>
                  <small>{action.detail}</small>
                </Link>
              ))}
            </div>
          </section>
          <section className="home-section">
            <div className="section-heading"><p className="eyebrow">Browse</p><h2>Sections</h2></div>
            <div className="section-grid">
              {sections.map((section) => (
                <Link className="section-link" href={section.href} key={section.label}>
                  <strong>{section.label}</strong><span>{section.note}</span><b aria-hidden="true">↗</b>
                </Link>
              ))}
            </div>
          </section>
        </main>
        );
      }}
    </SessionGate>
  );
}
