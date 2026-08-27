import { NextResponse } from 'next/server';
import { explain } from '@/lib/ai/explain';

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { deterministic?: unknown } | null;
  if (!body || typeof body.deterministic !== 'string' || !body.deterministic.trim()) {
    return NextResponse.json({ error: 'A deterministic explanation is required.' }, { status: 400 });
  }
  return NextResponse.json({ explanation: await explain(body.deterministic) });
}
