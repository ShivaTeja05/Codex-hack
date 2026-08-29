import Link from 'next/link';

export function JourneyHeader() {
  return (
    <header className="site-header">
      <Link href="/home" className="brand" aria-label="Milaan home">
        <span className="brand-mark">NT</span>
        <span>
          <strong>Nagrik Trail</strong>
          <small>independent prototype</small>
        </span>
      </Link>
      <nav className="site-nav" aria-label="Main navigation">
        <Link href="/">Home</Link>
        <Link href="/track/TRL-4K9-2XQ">Track</Link>
        <Link href="/check">Check</Link>
        <Link href="/map">Map</Link>
        <Link href="/money">Money</Link>
        <Link href="/records">Records</Link>
        <Link href="/issues">Issues</Link>
        <Link href="/whats-real">What&apos;s real?</Link>
      </nav>
    </header>
  );
}
