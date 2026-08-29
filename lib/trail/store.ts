import * as seed from './seed';
import type {
  Application,
  ApplicationStep,
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

/**
 * Resolve one flag under the same share code: the citizen replaced a single
 * document, they did not restart the application. Writes DOC_REPLACED and
 * clears the flag so the step derives back to IN_REVIEW.
 */
export function resolveFlag(
  code: string,
  documentId: string,
): { applicationId?: string } | undefined {
  const shareCode = findShareCode(code);
  if (!shareCode) return undefined;
  const flag = state().flags.find(
    (item) =>
      item.documentId === documentId &&
      item.applicationId === shareCode.applicationId &&
      !item.resolvedAt,
  );
  if (!flag) return { applicationId: shareCode.applicationId };

  flag.resolvedAt = new Date().toISOString();
  recordEvent({
    eventType: 'DOC_REPLACED',
    documentId,
    applicationId: flag.applicationId,
    stepId: flag.stepId,
    shareCode: code,
    actorType: 'CITIZEN',
    actorLabel: state().citizen.name,
  });
  return { applicationId: shareCode.applicationId };
}

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no O/0/I/1
function randomCode(): string {
  const block = () =>
    Array.from({ length: 3 }, () =>
      CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)],
    ).join('');
  return `TRL-${block()}-${block()}`;
}

const DAY = 86_400_000;

/**
 * Create a real, trackable application from selected documents. The new file
 * enters at step 1 (received) and sits WAITING at step 2, exactly as a freshly
 * submitted application would — the reviewer can then open documents in the
 * officer view and watch the status advance.
 */
export function createApplication(
  schemeId: string,
  docIds: string[],
  purpose: string,
): { code: string; applicationId: string } | undefined {
  const store = state();
  const scheme = findScheme(schemeId);
  if (!scheme) return undefined;

  let code = randomCode();
  while (store.shareCodes.some((item) => item.code === code)) code = randomCode();

  const applicationId = `app-${Date.now()}`;
  const now = new Date().toISOString();
  const sortedSteps = [...scheme.steps].sort((a, b) => a.order - b.order);

  const steps: ApplicationStep[] = sortedSteps.map((wStep, index) => ({
    id: `${applicationId}::${wStep.id}`,
    applicationId,
    workflowStepId: wStep.id,
    // Step 1 (received) is done immediately; step 2 enters the queue now.
    enteredAt: index <= 1 ? now : undefined,
    completedAt: index === 0 ? now : undefined,
  }));

  store.applications.push({
    id: applicationId,
    citizenId: store.citizen.id,
    schemeId,
    shareCode: code,
    submittedAt: now,
    steps,
  });

  store.shareCodes.push({
    code,
    citizenId: store.citizen.id,
    applicationId,
    purpose,
    docIds,
    createdAt: now,
    expiresAt: new Date(Date.now() + 90 * DAY).toISOString(),
    maxOpens: 50,
  });

  recordEvent({
    eventType: 'SHARE_CODE_CREATED',
    applicationId,
    shareCode: code,
    actorType: 'CITIZEN',
    actorLabel: store.citizen.name,
  });
  recordEvent({
    eventType: 'STEP_ENTERED',
    applicationId,
    stepId: steps[1]?.id,
    shareCode: code,
    actorType: 'SYSTEM',
    actorLabel: 'System',
  });

  return { code, applicationId };
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
