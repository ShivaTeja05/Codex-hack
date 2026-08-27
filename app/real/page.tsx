import Link from 'next/link';
import { ScreenIntro } from '@/components/ScreenIntro';
import type { CapabilityDisclosure } from '@/lib/types';

const capabilities: CapabilityDisclosure[] = [
  { capability: 'Conflict detection', status: 'real', reason: 'Pure TypeScript compares the synthetic records in this browser session.' },
  { capability: 'Rule evaluation', status: 'real', reason: 'Deterministic functions produce every pass, block and warning.' },
  { capability: 'Fix ranking', status: 'real', reason: 'The queue is sorted by the number of configured checks each fix unlocks.' },
  { capability: 'Share bundle', status: 'real', reason: 'The URL carries a self-contained, expiring payload. Nothing is saved.' },
  { capability: 'Document wallet', status: 'mocked', reason: 'It uses two local fictional profiles and never contacts DigiLocker.' },
  { capability: 'Government submission', status: 'mocked', reason: 'Milaan does not submit applications or contact a government system.' },
  { capability: 'AI explanation', status: 'mocked', reason: 'Optional text rewriting only. The deterministic fallback works without a key.' },
  { capability: 'Legal citations', status: 'mocked', reason: 'Unverified sources are shown as TODO_CITATION and must be replaced before launch.' },
];

export default function RealPage() {
  return (
    <main className="page-shell wide-shell">
      <ScreenIntro step="8 of 8 · Honesty" title="What works, and what is simulated.">
        This table is rendered from one config object. It names every important boundary of the prototype.
      </ScreenIntro>
      <div className="honesty-table">
        {capabilities.map((item) => <article className="card honesty-row" key={item.capability}><h2>{item.capability}</h2><span className={`status-pill status-${item.status}`}>{item.status}</span><p>{item.reason}</p></article>)}
      </div>
      <div className="card" style={{ marginTop: 20 }}><h2>Journey complete</h2><p>This was a fictional demonstration. No personal information was collected or saved.</p><Link className="secondary-button" href="/" style={{ marginTop: 16 }}>Try another demo profile</Link></div>
    </main>
  );
}
