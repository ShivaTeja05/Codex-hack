'use client';

import Link from 'next/link';
import { ProvenanceBadge } from '@/components/ProvenanceBadge';
import { ScreenIntro } from '@/components/ScreenIntro';
import { SessionGate } from '@/components/SessionGate';

export default function DocumentsPage() {
  return (
    <SessionGate>
      {(profile) => (
        <main className="page-shell wide-shell">
          <ScreenIntro step="Documents" title="Your synthetic document wallet.">
            Issuer-signed means the issuer signed the digital record. Uploaded means it is only a scan with no verified status.
          </ScreenIntro>
          <div className="wallet-list">
            {profile.documents.map((document) => (
              <article className="card wallet-row" key={`${document.source}-${document.label}`}>
                <div className="wallet-icon" aria-hidden="true">▱</div>
                <div className="wallet-copy"><h2>{document.label}</h2><p>{document.issuer}</p><small>Issued: {document.issuedOn}{document.validUntil ? ` · Valid until: ${document.validUntil}` : ''}</small></div>
                <div className="wallet-badges"><ProvenanceBadge value={document.provenance} /><span className={`status-pill document-${document.state}`}>{document.state}</span></div>
                <a className="secondary-button" href={document.digilockerUrl} target="_blank" rel="noreferrer">Open in DigiLocker ↗</a>
              </article>
            ))}
          </div>
          <p className="ownership-note">OpenTrail does not fetch or display the file. DigiLocker remains the document owner.</p>
          <Link className="back-link" href="/home">← Back to home</Link>
        </main>
      )}
    </SessionGate>
  );
}
