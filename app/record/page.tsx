'use client';

import Link from 'next/link';
import { ProvenanceBadge } from '@/components/ProvenanceBadge';
import { ScreenIntro } from '@/components/ScreenIntro';
import { fieldLabels } from '@/lib/presentation';
import { getCitizen } from '@/lib/seed/citizens';
import { useSession } from '@/lib/state';

export default function RecordPage() {
  const { citizenId } = useSession();
  const citizen = getCitizen(citizenId);
  return (
    <main className="page-shell wide-shell">
      <ScreenIntro step="3 of 8 · Your record" title={`Here is ${citizen.displayName}'s synthetic record.`}>
        Look at the same details side by side. Wallet-issued and demo-uploaded records are marked clearly.
      </ScreenIntro>
      <div className="document-grid">
        {citizen.documents.map((document, index) => (
          <article className="card document-card" key={`${document.source}-${index}`}>
            <div className="card-heading">
              <h2>{document.label}</h2>
              <ProvenanceBadge value={document.provenance} />
            </div>
            <p className="document-meta">{document.issuer} · issued {document.issuedOn}{document.validUntil ? ` · valid until ${document.validUntil}` : ''}</p>
            <dl className="field-table">
              {Object.entries(document.fields).map(([key, value]) => (
                <div className="field-row" key={key}>
                  <dt>{fieldLabels[key as keyof typeof fieldLabels]}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </article>
        ))}
      </div>
      <div style={{ marginTop: 20 }}><Link className="primary-button" href="/conflicts">Find differences <span aria-hidden="true">→</span></Link></div>
    </main>
  );
}
