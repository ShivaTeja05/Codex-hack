import Link from 'next/link';

export function JourneyHeader() {
  return (
    <header className="site-header">
      <Link href="/" className="brand" aria-label="Nagrik Trail home">
        <span className="brand-mark">NT</span>
        <span>
          <strong>Nagrik Trail</strong>
          <small>independent prototype</small>
        </span>
      </Link>
      <nav className="site-nav" aria-label="Main navigation">
        <Link href="/">Home</Link>
        <Link href="/journey">Start</Link>
        <Link href="/track/TRL-4K9-2XQ">Track</Link>
        <Link href="/insights">Insights</Link>
        <Link href="/whats-real">What&apos;s real?</Link>
      </nav>
    </header>
  );
}
