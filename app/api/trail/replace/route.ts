import { NextResponse } from 'next/server';
import { commitDelta } from '@/lib/trail/commit';
import { resolveFlag } from '@/lib/trail/store';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    code?: string;
    docId?: string;
  } | null;

  if (!body?.code || !body.docId) {
    return NextResponse.json({ error: 'A code and document are required.' }, { status: 400 });
  }

  const result = resolveFlag(body.code, body.docId);
  if (!result) {
    return NextResponse.json({ error: 'Unknown code.' }, { status: 400 });
  }
  return commitDelta(NextResponse.json({ ok: true }));
}
