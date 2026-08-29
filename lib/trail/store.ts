import * as seed from './seed';
import type {
  Application,
  Citizen,
  DocEvent,
  Flag,
  Scheme,
  ShareCode,
  TrailDocument,
} from './types';

/**
 * In-memory demo store.
 *
 * CONTEXT.md §4 permits this in place of Postgres provided a reset control
 * exists and the honesty page says so. Both are true. The trade is stated
 * plainly on /whats-real: state is per server instance and resets on a cold
 * start, which is why the demo seeds a rich application rather than depending
 * on the reviewer generating one.
 */

export interface TrailState {
  citizen: Citizen;
  documents: TrailDocument[];
  schemes: Scheme[];
  applications: Application[];
  shareCodes: ShareCode[];
  events: DocEvent[];
  flags: Flag[];
  seededAt: string;
}

function fresh(): TrailState {
  return {
    citizen: structuredClone(seed.citizen),
    documents: structuredClone(seed.documents),
    schemes: structuredClone(seed.schemes),
    applications: structuredClone(seed.applications),
    shareCodes: structuredClone(seed.shareCodes),
    events: structuredClone(seed.events),
    flags: structuredClone(seed.flags),
    seededAt: new Date().toISOString(),
  };
}

// Survives hot reload in dev and warm invocations in production.
const globalRef = globalThis as unknown as { __trailState?: TrailState };

export function state(): TrailState {
  if (!globalRef.__trailState) globalRef.__trailState = fresh();
  return globalRef.__trailState;
}

export function resetState(): TrailState {
  globalRef.__trailState = fresh();
  return globalRef.__trailState;
}

let counter = 0;
export function recordEvent(event: Omit<DocEvent, 'id' | 'ts'> & { ts?: string }): DocEvent {
  counter += 1;
  const stored: DocEvent = {
    ...event,
    id: `ev-${Date.now()}-${counter}`,
    ts: event.ts ?? new Date().toISOString(),
  };
  state().events.push(stored);
  return stored;
}

export function findShareCode(code: string): ShareCode | undefined {
  return state().shareCodes.find(
    (item) => item.code.toUpperCase() === code.toUpperCase(),
  );
}

export function findApplication(id?: string): Application | undefined {
  if (!id) return undefined;
  return state().applications.find((item) => item.id === id);
}

export function findScheme(id?: string): Scheme | undefined {
  return state().schemes.find((item) => item.id === id);
}

export function findDocument(id?: string): TrailDocument | undefined {
  return state().documents.find((item) => item.id === id);
}

/** Which workflow step of this application requires the given document. */
export function stepForDocument(
  applicationId: string,
  documentId: string,
): { stepInstanceId: string; officeName: string; officeId: string } | undefined {
  const application = findApplication(applicationId);
  const document = findDocument(documentId);
  if (!application || !document) return undefined;

  const scheme = findScheme(application.schemeId);
  const step = scheme?.steps.find((item) =>
    item.requiredDocTypes.includes(document.docType),
  );
  if (!step) return undefined;

  const instance = application.steps.find(
    (item) => item.workflowStepId === step.id,
  );
  if (!instance) return undefined;

  return {
    stepInstanceId: instance.id,
    officeName: step.officeName,
    officeId: step.officeId,
  };
}

/** Stamp firstOpenedAt the first time anyone opens a document for a step. */
export function markStepOpened(stepInstanceId: string): void {
  for (const application of state().applications) {
    const instance = application.steps.find((item) => item.id === stepInstanceId);
    if (instance && !instance.firstOpenedAt) {
      instance.firstOpenedAt = new Date().toISOString();
    }
  }
}

export function markStepCompleted(stepInstanceId: string): void {
  for (const application of state().applications) {
    const index = application.steps.findIndex((item) => item.id === stepInstanceId);
    if (index === -1) continue;
    const instance = application.steps[index];
    if (!instance.completedAt) instance.completedAt = new Date().toISOString();

    // The next step enters the queue the moment this one completes.
    const next = application.steps[index + 1];
    if (next && !next.enteredAt) next.enteredAt = new Date().toISOString();
  }
}
