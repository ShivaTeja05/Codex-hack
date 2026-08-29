'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function ReplaceForm({ code, docId }: { code: string; docId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/trail/replace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, docId }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error ?? 'Could not resubmit.');
      router.push(`/track/${code}`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
      setBusy(false);
    }
  }

  return (
    <div>
      {error ? (
        <p className="tr-note" style={{ background: '#FCF6F2', borderLeftColor: 'var(--thread)' }}>{error}</p>
      ) : null}
      <button type="button" className="tr-btn" onClick={submit} disabled={busy}>
        {busy ? 'Resubmitting…' : 'Resubmit the corrected document'}
      </button>
    </div>
  );
}
