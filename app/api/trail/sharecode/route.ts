import { NextResponse } from 'next/server';
import { commitDelta } from '@/lib/trail/commit';
import { createApplication, revokeShareCode } from '@/lib/trail/store';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    schemeId?: string;
    docIds?: string[];
    purpose?: string;
  } | null;

  if (!body?.schemeId || !Array.isArray(body.docIds) || body.docIds.length === 0) {
    return NextResponse.json(
      { error: 'A scheme and at least one document are required.' },
      { status: 400 },
    );
  }

  const created = createApplication(
    body.schemeId,
    body.docIds,
    body.purpose ?? 'Application',
  );
  if (!created) {
    return NextResponse.json({ error: 'Unknown scheme.' }, { status: 400 });
  }

  return commitDelta(NextResponse.json({ ok: true, code: created.code }));
}

export async function DELETE(request: Request) {
  const body = (await request.json().catch(() => null)) as { code?: string } | null;
  const shareCode = body?.code ? revokeShareCode(body.code) : undefined;
  if (!shareCode) {
    return NextResponse.json({ error: 'Unknown code.' }, { status: 400 });
  }
  return commitDelta(NextResponse.json({ ok: true }));
}
