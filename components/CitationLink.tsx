import type { Citation } from '@/lib/types';

export function CitationLink({ citation }: { citation: Citation }) {
  return (
    <details className="citation">
      <summary>Why does this apply?</summary>
      <p>
        Source: <strong>{citation.instrument}</strong>
      </p>
      {citation.notifiedOn ? <p>Notified on: {citation.notifiedOn}</p> : null}
      {citation.url ? (
        <a href={citation.url} target="_blank" rel="noreferrer">
          Open source
        </a>
      ) : citation.instrument === 'TODO_CITATION' ? (
        <p className="citation-warning">Official citation must be verified before launch.</p>
      ) : null}
    </details>
  );
}
