import type {
  ApplicationStep,
  DocEvent,
  Flag,
  StepStatus,
  TrailDocument,
  WorkflowStep,
} from './types';

/**
 * Status is a computed value, not a column an officer sets.
 *
 * Every function here is pure: it takes step config plus an event array and
 * returns a value. No database, no clock outside `now`, no side effects. That
 * is what makes the claim demonstrable rather than asserted.
 */

const DAY_MS = 86_400_000;

export interface DerivedStep {
  step: WorkflowStep;
  instance: ApplicationStep;
  status: StepStatus;
  waitingMs: number;
  handlingMs: number;
  totalMs: number;
  slaBreached: boolean;
  overdueDays: number;
  openFlags: Flag[];
  verifiedDocIds: string[];
}

export function deriveStepStatus(
  step: WorkflowStep,
  instance: ApplicationStep,
  events: DocEvent[],
  flags: Flag[],
  documents: TrailDocument[],
): StepStatus {
  if (!instance.enteredAt) return 'NOT_STARTED';

  const openFlags = flags.filter(
    (flag) => flag.stepId === instance.id && !flag.resolvedAt,
  );
  if (openFlags.length > 0) return 'ACTION_NEEDED';

  const stepEvents = events.filter((event) => event.stepId === instance.id);
  const docTypeOf = (id?: string) =>
    documents.find((document) => document.id === id)?.docType;

  const verifiedTypes = new Set(
    stepEvents
      .filter((event) => event.eventType === 'DOC_VERIFIED')
      .map((event) => docTypeOf(event.documentId))
      .filter(Boolean),
  );

  const allVerified =
    step.requiredDocTypes.length > 0 &&
    step.requiredDocTypes.every((type) => verifiedTypes.has(type));

  // Steps with no required documents complete when they are marked complete.
  if (step.requiredDocTypes.length === 0 && instance.completedAt) return 'DONE';
  if (allVerified) return 'DONE';

  const opened = stepEvents.some(
    (event) => event.eventType === 'DOC_OPENED' || event.eventType === 'DOC_REOPENED',
  );
  return opened ? 'IN_REVIEW' : 'WAITING';
}

const ms = (value?: string) => (value ? new Date(value).getTime() : undefined);

/** Queue time: the file reached the office and nobody opened it. */
export function waitingMs(instance: ApplicationStep, now: number): number {
  const entered = ms(instance.enteredAt);
  if (entered === undefined) return 0;
  return Math.max(0, (ms(instance.firstOpenedAt) ?? now) - entered);
}

/** Handling time: an officer was actually working on it. */
export function handlingMs(instance: ApplicationStep, now: number): number {
  const opened = ms(instance.firstOpenedAt);
  if (opened === undefined) return 0;
  return Math.max(0, (ms(instance.completedAt) ?? now) - opened);
}

export function totalMs(instance: ApplicationStep, now: number): number {
  const entered = ms(instance.enteredAt);
  if (entered === undefined) return 0;
  return Math.max(0, (ms(instance.completedAt) ?? now) - entered);
}

export function slaBreached(
  instance: ApplicationStep,
  slaDays: number,
  now: number,
): boolean {
  return totalMs(instance, now) > slaDays * DAY_MS;
}

export function overdueDays(
  instance: ApplicationStep,
  slaDays: number,
  now: number,
): number {
  // Round, not ceil: seeded timestamps driftpast the day boundary and
  // ceil() would report an extra overdue day.
  return Math.max(0, Math.round(totalMs(instance, now) / DAY_MS) - slaDays);
}

export function days(value: number): number {
  return Math.max(0, Math.round((value / DAY_MS) * 10) / 10);
}

export function deriveSteps(
  steps: WorkflowStep[],
  instances: ApplicationStep[],
  events: DocEvent[],
  flags: Flag[],
  documents: TrailDocument[],
  now: number = Date.now(),
): DerivedStep[] {
  return [...steps]
    .sort((left, right) => left.order - right.order)
    .map((step) => {
      const instance =
        instances.find((item) => item.workflowStepId === step.id) ??
        ({ id: `missing-${step.id}`, applicationId: '', workflowStepId: step.id } as ApplicationStep);

      return {
        step,
        instance,
        status: deriveStepStatus(step, instance, events, flags, documents),
        waitingMs: waitingMs(instance, now),
        handlingMs: handlingMs(instance, now),
        totalMs: totalMs(instance, now),
        slaBreached: slaBreached(instance, step.slaDays, now),
        overdueDays: overdueDays(instance, step.slaDays, now),
        openFlags: flags.filter(
          (flag) => flag.stepId === instance.id && !flag.resolvedAt,
        ),
        verifiedDocIds: events
          .filter(
            (event) =>
              event.stepId === instance.id && event.eventType === 'DOC_VERIFIED',
          )
          .map((event) => event.documentId as string)
          .filter(Boolean),
      };
    });
}

export interface ApplicationSummary {
  headline: string;
  needsCitizen: boolean;
  current?: DerivedStep;
  doneCount: number;
  totalCount: number;
}

/**
 * The application-level answer. Never the words "Under Process".
 */
export function summarise(derived: DerivedStep[]): ApplicationSummary {
  const actionNeeded = derived.find((item) => item.status === 'ACTION_NEEDED');
  const doneCount = derived.filter((item) => item.status === 'DONE').length;

  if (actionNeeded) {
    return {
      headline: 'Action needed from you',
      needsCitizen: true,
      current: actionNeeded,
      doneCount,
      totalCount: derived.length,
    };
  }

  if (doneCount === derived.length && derived.length > 0) {
    return {
      headline: 'Approved',
      needsCitizen: false,
      doneCount,
      totalCount: derived.length,
    };
  }

  const current =
    derived.find((item) => item.status === 'IN_REVIEW') ??
    derived.find((item) => item.status === 'WAITING') ??
    derived.find((item) => item.status === 'NOT_STARTED');

  return {
    headline: current ? current.step.plainName : 'Waiting to start',
    needsCitizen: false,
    current,
    doneCount,
    totalCount: derived.length,
  };
}
