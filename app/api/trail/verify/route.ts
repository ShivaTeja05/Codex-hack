import { NextResponse } from 'next/server';
import { commitDelta } from '@/lib/trail/commit';
import {
  findApplication,
  findDocument,
  findScheme,
  findShareCode,
  markStepCompleted,
  recordEvent,
  state,
  stepForDocument,
} from '@/lib/trail/store';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    code?: string;
    docId?: string;
    office?: string;
  } | null;

  const shareCode = body?.code ? findShareCode(body.code) : undefined;
  const document = body?.docId ? findDocument(body.docId) : undefined;
  if (!shareCode || !document) {
    return NextResponse.json({ error: 'Unknown code or document.' }, { status: 400 });
  }

  const location = stepForDocument(shareCode.applicationId ?? '', document.id);
  recordEvent({
    eventType: 'DOC_VERIFIED',
    documentId: document.id,
    applicationId: shareCode.applicationId,
    stepId: location?.stepInstanceId,
    shareCode: shareCode.code,
    actorType: 'OFFICER',
    actorLabel: body?.office ?? location?.officeName ?? 'Reviewing office',
    actorOfficeId: location?.officeId,
  });

  // A step completes when every document it requires has been verified.
  const application = findApplication(shareCode.applicationId);
  const scheme = findScheme(application?.schemeId);
  const step = scheme?.steps.find((item) =>
    item.requiredDocTypes.includes(document.docType),
  );
  if (application && step && location) {
    const verifiedTypes = new Set(
      state()
        .events.filter(
          (event) =>
            event.stepId === location.stepInstanceId &&
            event.eventType === 'DOC_VERIFIED',
        )
        .map((event) => findDocument(event.documentId)?.docType)
        .filter(Boolean),
    );
    if (step.requiredDocTypes.every((type) => verifiedTypes.has(type))) {
      markStepCompleted(location.stepInstanceId);
    }
  }

  return commitDelta(NextResponse.json({ ok: true }));
}
