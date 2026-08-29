'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function RevokeButton({ code, revoked }: { code: string; revoked: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  if (revoked) {
    return <span className="ac-revoked">This code is revoked. No office can open your documents through it.</span>;
  }

  async function revoke() {
    if (!confirm('Revoke this code? Offices can no longer open your documents through it. This cannot be undone in the demo.')) return;
    setBusy(true);
    try {
      await fetch('/api/trail/sharecode', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button type="button" className="tr-btn tr-btn-small" onClick={revoke} disabled={busy}
      style={{ background: 'var(--thread)', borderColor: 'var(--thread)' }}>
      {busy ? 'Revoking…' : 'Revoke this code'}
    </button>
  );
}
