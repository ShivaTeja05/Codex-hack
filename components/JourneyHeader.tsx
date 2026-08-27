import Link from 'next/link';

export function JourneyHeader() {
  return (
    <header className="site-header">
      <Link href="/" className="brand" aria-label="Milaan home">
        <span className="brand-mark">M</span>
        <span>
          <strong>Milaan</strong>
          <small>check before you apply</small>
        </span>
      </Link>
      <Link href="/real" className="text-link">
        What&apos;s real?
      </Link>
    </header>
  );
}
