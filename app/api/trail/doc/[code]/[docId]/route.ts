import { NextResponse } from 'next/server';
import { checkAccess } from '@/lib/trail/anomaly';
import {
  findDocument,
  findShareCode,
  markStepOpened,
  recordEvent,
  state,
  stepForDocument,
} from '@/lib/trail/store';

export const dynamic = 'force-dynamic';

/**
 * The instrumented endpoint.
 *
 * Validate -> write the event -> anomaly check -> render. The document only
 * exists at the end of a logged fetch, so there is no way to view one without
 * producing an event. That is the whole architecture.
 */
export async function GET(
  request: Request,
  { params }: { params: { code: string; docId: string } },
) {
  const url = new URL(request.url);
  const office = url.searchParams.get('office') ?? 'Unknown office';
  const officeId = url.searchParams.get('officeId') ?? undefined;

  const shareCode = findShareCode(params.code);
  const document = findDocument(params.docId);
  const decision = checkAccess(shareCode, params.docId);

  if (!decision.allowed || !shareCode || !document) {
    recordEvent({
      eventType: 'ACCESS_DENIED_RATE_LIMIT',
      documentId: params.docId,
      shareCode: params.code,
      actorType: 'UNKNOWN',
      actorLabel: office,
      actorOfficeId: officeId,
      meta: { deniedReason: decision.deniedReason ?? 'Unknown document or code.' },
    });
    return NextResponse.json(
      { error: decision.deniedReason ?? 'Not available.' },
      { status: 403 },
    );
  }

  const location = stepForDocument(shareCode.applicationId ?? '', params.docId);
  const seenBefore = state().events.some(
    (event) =>
      event.documentId === params.docId &&
      event.shareCode === shareCode.code &&
      (event.eventType === 'DOC_OPENED' || event.eventType === 'DOC_REOPENED'),
  );

  recordEvent({
    eventType: seenBefore ? 'DOC_REOPENED' : 'DOC_OPENED',
    documentId: params.docId,
    applicationId: shareCode.applicationId,
    stepId: location?.stepInstanceId,
    shareCode: shareCode.code,
    actorType: 'OFFICER',
    actorLabel: office,
    actorOfficeId: officeId ?? location?.officeId,
    meta: decision.unusual ? { unusual: decision.unusual } : undefined,
  });

  if (location) markStepOpened(location.stepInstanceId);

  return NextResponse.json({
    document: {
      id: document.id,
      plainName: document.plainName,
      issuer: document.issuer,
      issuedOn: document.issuedOn,
      refMasked: document.refMasked,
      fields: document.fields,
    },
    unusual: decision.unusual ?? null,
    loggedAs: seenBefore ? 'DOC_REOPENED' : 'DOC_OPENED',
  });
}
