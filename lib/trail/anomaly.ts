import { state } from './store';
import type { ShareCode } from './types';

export interface AccessDecision {
  allowed: boolean;
  deniedReason?: string;
  unusual?: string;
}

const HOUR = 3_600_000;
const DAY = 86_400_000;

/**
 * Runs inside the fetch endpoint, before anything is streamed.
 *
 * Wording matters here: this SURFACES unusual access. It does not prevent a
 * first-time misuse, and the copy must never claim otherwise.
 */
export function checkAccess(
  shareCode: ShareCode | undefined,
  documentId: string,
): AccessDecision {
  if (!shareCode) return { allowed: false, deniedReason: 'This code does not exist.' };
  if (shareCode.revokedAt)
    return { allowed: false, deniedReason: 'The citizen revoked this code.' };
  if (new Date(shareCode.expiresAt).getTime() < Date.now())
    return { allowed: false, deniedReason: 'This code has expired.' };
  if (!shareCode.docIds.includes(documentId))
    return {
      allowed: false,
      deniedReason: 'This document was not shared under this code.',
    };

  const events = state().events.filter((event) => event.shareCode === shareCode.code);
  const opens = events.filter(
    (event) => event.eventType === 'DOC_OPENED' || event.eventType === 'DOC_REOPENED',
  );
  if (opens.length >= shareCode.maxOpens)
    return { allowed: false, deniedReason: 'This code has reached its open limit.' };

  const now = Date.now();
  const recent = opens.filter(
    (event) =>
      event.documentId === documentId && now - new Date(event.ts).getTime() < 24 * HOUR,
  );
  const offices = new Set(recent.map((event) => event.actorOfficeId).filter(Boolean));

  if (offices.size > 3)
    return {
      allowed: true,
      unusual: 'Opened by more than three offices in the last 24 hours.',
    };

  const lastHour = recent.filter(
    (event) => now - new Date(event.ts).getTime() < HOUR,
  );
  if (lastHour.length > 10)
    return { allowed: true, unusual: 'Opened more than ten times in the last hour.' };

  const created = new Date(shareCode.createdAt).getTime();
  if (now - created > 120 * DAY)
    return { allowed: true, unusual: 'Opened long after this application was filed.' };

  return { allowed: true };
}
