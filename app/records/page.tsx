'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CitationLink } from '@/components/CitationLink';
import { ScreenIntro } from '@/components/ScreenIntro';
import { SessionGate } from '@/components/SessionGate';
import { cascadeSentence, sortRecords } from '@/lib/engine/records';
import { getCitizen } from '@/lib/seed/citizens';
import { POST_MATRIC_SCHOLARSHIP_ID } from '@/lib/seed/entitlements';

export default function RecordsPage() {
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    setOpenId(new URLSearchParams(window.location.search).get('open'));
  }, []);

  return (
    <SessionGate>
      {(profile) => {
        const citizen = getCitizen(profile.id);
        const records = sortRecords(profile.records);
        return (
          <main className="page-shell records-shell">
            <ScreenIntro step="Records" title="What is connected, and what disagrees.">
              The order is fixed by impact. It is never alphabetical and cannot be changed.
            </ScreenIntro>
            <div className="records-table" role="table" aria-label="Synthetic connected records">
              <div className="record-header" role="row">
                <span role="columnheader">Connected to</span><span role="columnheader">What it says</span><span role="columnheader">Required</span><span role="columnheader">Status</span>
              </div>
              {records.map((record) => {
                const expanded = openId === record.id;
                const cascadeCopy = cascadeSentence(citizen, record, POST_MATRIC_SCHOLARSHIP_ID);
                return (
                  <article className={`record-row record-${record.status}`} key={record.id} role="row">
                    <button className="record-summary" type="button" aria-expanded={expanded} onClick={() => setOpenId(expanded ? null : record.id)}>
                      <span className="record-name" role="cell"><strong>{record.connectedTo}</strong><small>Tap for details</small></span>
                      <span className="record-detail" role="cell">{record.detail}</span>
                      <span className="record-required" role="cell"><small>Required</small>{record.required}</span>
                      <span className={`record-status status-${record.status}`} role="cell">{record.status}</span>
                    </button>
                    {expanded ? (
                      <div className="record-expansion">
                        {record.values ? (
                          <div className="record-values">
                            {record.values.map((value) => <div key={`${value.source}-${value.value}`}><small>{value.label}</small><strong>{value.value}</strong></div>)}
                          </div>
                        ) : <p>This row has no contradictory values to compare.</p>}
                        {cascadeCopy ? <p className="cascade-copy"><strong>If you make the correction:</strong> {cascadeCopy}</p> : null}
                        <p><strong>Action:</strong> {record.action}</p>
                        <CitationLink citation={record.source} />
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
            <div className="record-footer-actions">
              <Link className="secondary-button" href="/bundle">Share a scoped officer bundle</Link>
            </div>
            <Link className="back-link" href="/home">← Back to home</Link>
          </main>
        );
      }}
    </SessionGate>
  );
}
