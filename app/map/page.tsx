'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { CitationLink } from '@/components/CitationLink';
import { ScreenIntro } from '@/components/ScreenIntro';
import { SessionGate } from '@/components/SessionGate';
import { buildLinkageMap, countByTier } from '@/lib/engine/linkage';
import { getCitizen } from '@/lib/seed/citizens';
import type { LinkageTier, MappedLinkage } from '@/lib/engine/linkage';
import type { AuthEvent } from '@/lib/types';

const tierCopy: Record<LinkageTier, { eyebrow: string; heading: string; blurb: string }> = {
  confirmed: {
    eyebrow: 'Confirmed',
    heading: 'You gave us these, so we can read them.',
    blurb:
      'Milaan compares these against each other. Everything on the pre-submission check comes from here.',
  },
  probable: {
    eyebrow: 'Probable',
    heading: 'Someone authenticated you. They likely hold a record.',
    blurb:
      'Authentication history is the only linkage signal a citizen can get today. It proves an organisation checked you — never what they wrote down.',
  },
  unknowable: {
    eyebrow: 'Unknowable',
    heading: 'Nobody can tell you, including the government.',
    blurb:
      'These rows are not a failure of this prototype. No authority holds this map. We show the gap instead of hiding it.',
  },
};

function LinkageCard({ item }: { item: MappedLinkage }) {
  return (
    <article className={`linkage-card tier-${item.tier}`}>
      <div className="linkage-head">
        <div>
          <h3>{item.label}</h3>
          <p className="linkage-question">{item.question}</p>
        </div>
        <span className={`status-pill obligation-${item.obligation}`}>{item.obligation}</span>
      </div>

      <p className="linkage-finding">{item.finding}</p>

      <p className="linkage-obligation">
        <strong>Is it required?</strong> {item.obligationDetail}
      </p>
      <CitationLink citation={item.source} />

      <details className="linkage-evidence">
        <summary className="text-link">How do we know?</summary>
        <p>{item.evidence}</p>
        <CitationLink citation={item.evidenceSource} />
      </details>

      <details className="linkage-contract">
        <summary className="text-link">The endpoint that would answer this properly</summary>
        <p className="contract-body">{item.probeContract}</p>
        <p className="contract-note">
          Not implemented. Nothing in Milaan calls this — it is the integration a department would
          build. It answers yes or no and returns no data, which is the pattern India already uses
          for consent-bound sharing.
        </p>
      </details>
    </article>
  );
}

function MapContent({ citizenId, activity }: { citizenId: string; activity: AuthEvent[] }) {
  const map = useMemo(() => buildLinkageMap(getCitizen(citizenId), activity), [citizenId, activity]);
  const counts = useMemo(() => countByTier(map), [map]);
  const tiers: LinkageTier[] = ['confirmed', 'probable', 'unknowable'];

  return (
    <main className="page-shell wide-shell">
      <ScreenIntro step="Linkage map" title="What you are connected to.">
        Every row says how confident this prototype is, and why. No row claims more than the
        evidence behind it.
      </ScreenIntro>

      <div className="tier-summary">
        {tiers.map((tier) => (
          <div className={`tier-count tier-${tier}`} key={tier}>
            <strong>{counts[tier]}</strong>
            <span>{tierCopy[tier].eyebrow}</span>
          </div>
        ))}
      </div>
      <p className="tier-summary-note">
        This is a count, not a score. There is no completion percentage here and there never will
        be — a score would push you to link things the law does not require.
      </p>

      {tiers.map((tier) => {
        const rows = map.filter((item) => item.tier === tier);
        if (rows.length === 0) return null;
        return (
          <section className="check-section" key={tier}>
            <div className="section-heading">
              <p className="eyebrow">{tierCopy[tier].eyebrow}</p>
              <h2>{tierCopy[tier].heading}</h2>
            </div>
            <p className="tier-blurb">{tierCopy[tier].blurb}</p>
            <div className="linkage-list">
              {rows.map((item) => (
                <LinkageCard item={item} key={item.domain} />
              ))}
            </div>
          </section>
        );
      })}

      <section className="card gap-card">
        <p className="eyebrow">Why the third column exists</p>
        <h2>India chose not to keep this map.</h2>
        <p>
          Departments do not report Aadhaar linkages to UIDAI, and UIDAI does not store them. That
          is a genuine privacy decision, and it has an unintended cost: the state cannot show you
          your own connections, because it chose not to know them.
        </p>
        <p>
          The fix does not need a new central registry — that would undo the privacy choice. It
          needs each department to expose a consent-bound endpoint that answers{' '}
          <strong>&ldquo;does this value match your record: yes or no&rdquo;</strong> and returns no
          data. India already runs this pattern in finance through Account Aggregators, and in
          health through the ABDM consent manager. Government records would be the third.
        </p>
        <div className="next-actions">
          <Link className="secondary-button" href="/real">
            What&apos;s real in this prototype
          </Link>
        </div>
      </section>

      <Link className="back-link" href="/home">
        ← Back to home
      </Link>
    </main>
  );
}

export default function MapPage() {
  return (
    <SessionGate>
      {(profile) => <MapContent citizenId={profile.id} activity={profile.activity} />}
    </SessionGate>
  );
}
