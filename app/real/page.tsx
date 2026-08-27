import Link from 'next/link';
import { ScreenIntro } from '@/components/ScreenIntro';
import { capabilities } from '@/lib/seed/capabilities';

export default function RealPage() {
  return (
    <main className="page-shell wide-shell">
      <ScreenIntro step="Honesty" title="What works, and what is simulated.">
        This table comes from one config object. It names every important boundary of the prototype.
      </ScreenIntro>
      <div className="honesty-table">
        {capabilities.map((item) => (
          <article className="card honesty-row" key={item.capability}>
            <h2>{item.capability}</h2>
            <span className={`status-pill status-${item.status}`}>{item.status}</span>
            <p>{item.reason}</p>
          </article>
        ))}
      </div>
      <div className="card honesty-close">
        <h2>No personal information is collected.</h2>
        <p>This is a fictional demonstration. Closing or refreshing the session removes its in-memory choices.</p>
        <Link className="secondary-button" href="/home">Return home</Link>
      </div>
    </main>
  );
}
