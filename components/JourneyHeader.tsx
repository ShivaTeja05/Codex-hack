import Link from 'next/link';

export function JourneyHeader() {
  return (
    <header className="site-header">
      <Link href="/home" className="brand" aria-label="Milaan home">
        <span className="brand-mark">M</span>
        <span>
          <strong>Milaan</strong>
          <small>check before you apply</small>
        </span>
      </Link>
      <nav className="site-nav" aria-label="Main navigation">
        <Link href="/home">Home</Link>
        <Link href="/check">Check</Link>
        <Link href="/map">Map</Link>
        <Link href="/money">Money</Link>
        <Link href="/records">Records</Link>
        <Link href="/issues">Issues</Link>
        <Link href="/real">What&apos;s real?</Link>
      </nav>
    </header>
  );
}
