import Link from 'next/link';
import { PRIMARY_CODE, FLAGGED_CODE } from '@/lib/trail/seed';

export default function TrackEntry() {
  return (
    <main className="tr-shell">
      <p className="tr-eyebrow">Track an application</p>
      <h1 className="tr-h1">Enter your code.</h1>
      <p className="tr-sub">Codes look like TRL-4K9-2XQ. The same code you used to submit is the code you track with.</p>
      <form action="/track" className="tr-card">
        <label style={{ display: 'grid', gap: 8, fontSize: 13, fontWeight: 700 }}>
          <span>Your code</span>
          <input name="code" placeholder="TRL-4K9-2XQ" className="tr-mono" style={{ padding: '12px 13px', fontSize: 17, border: '1px solid #DEDDD6', borderRadius: 8, minHeight: 48 }} />
        </label>
      </form>
      <div className="tr-actions">
        <Link className="tr-btn" href={`/track/${PRIMARY_CODE}`}>Open the demo application</Link>
        <Link className="tr-btn tr-btn-ghost" href={`/track/${FLAGGED_CODE}`}>Open one that needs action</Link>
      </div>
      <p className="tr-soft" style={{ marginTop: 16 }}>
        Both codes are pre-filled demo data. No login, no access request.
      </p>
    </main>
  );
}
