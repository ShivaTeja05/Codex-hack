import { NextResponse } from 'next/server';
import { clearDelta } from '@/lib/trail/commit';
import { resetState } from '@/lib/trail/store';

export const dynamic = 'force-dynamic';

export async function POST() {
  const next = resetState();
  return clearDelta(NextResponse.json({ ok: true, seededAt: next.seededAt }));
}
