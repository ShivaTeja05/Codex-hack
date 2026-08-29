import { NextResponse } from 'next/server';
import { findDocument, findShareCode, recordEvent, state, stepForDocument } from '@/lib/trail/store';
import type { FlagReason } from '@/lib/trail/types';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    code?: string;
    docId?: string;
    reason?: FlagReason;
    comment?: string;
    office?: string;
  } | null;

  const shareCode = body?.code ? findShareCode(body.code) : undefined;
  const document = body?.docId ? findDocument(body.docId) : undefined;
  if (!shareCode || !document || !body?.comment?.trim()) {
    return NextResponse.json(
      { error: 'A code, a document and a comment are required.' },
      { status: 400 },
    );
  }

  const location = stepForDocument(shareCode.applicationId ?? '', document.id);
  const officer = body.office ?? location?.officeName ?? 'Reviewing office';

  state().flags.push({
    id: `flag-${Date.now()}`,
    documentId: document.id,
    applicationId: shareCode.applicationId ?? '',
    stepId: location?.stepInstanceId ?? '',
    officerLabel: officer,
    reason: body.reason ?? 'MISMATCH',
    comment: body.comment.trim(),
    createdAt: new Date().toISOString(),
  });

  recordEvent({
    eventType: 'DOC_FLAGGED',
    documentId: document.id,
    applicationId: shareCode.applicationId,
    stepId: location?.stepInstanceId,
    shareCode: shareCode.code,
    actorType: 'OFFICER',
    actorLabel: officer,
    actorOfficeId: location?.officeId,
    meta: { reason: body.reason ?? 'MISMATCH', comment: body.comment.trim() },
  });

  return NextResponse.json({ ok: true });
}
