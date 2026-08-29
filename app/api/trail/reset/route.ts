import { NextResponse } from 'next/server';
import { resetState } from '@/lib/trail/store';

export const dynamic = 'force-dynamic';

export async function POST() {
  const next = resetState();
  return NextResponse.json({ ok: true, seededAt: next.seededAt });
}
