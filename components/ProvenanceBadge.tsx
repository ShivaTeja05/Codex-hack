export function ProvenanceBadge({ value }: { value: 'issued' | 'uploaded' }) {
  return (
    <span className={`provenance provenance-${value}`}>
      {value === 'issued' ? 'Issuer-signed' : 'Uploaded scan'}
    </span>
  );
}
