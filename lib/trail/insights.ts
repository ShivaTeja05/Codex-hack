import { handlingMs, totalMs, waitingMs } from './derive';
import type { Application, Scheme } from './types';

const DAY_MS = 86_400_000;

export interface StepInsight {
  schemeId: string;
  schemeName: string;
  department: string;
  order: number;
  plainName: string;
  officeName: string;
  slaDays: number;
  /** How many applications have reached this step. */
  n: number;
  medianTotalDays: number;
  medianWaitDays: number;
  medianHandleDays: number;
  /** Share of total time spent waiting in a queue, 0..1. */
  queueShare: number;
  /** Share of applications where total time exceeded the SLA, 0..1. */
  breachRate: number;
  /** waiting is the majority of the delay — a staffing decision, not training. */
  queueDominated: boolean;
}

export interface SchemeInsight {
  schemeId: string;
  schemeName: string;
  department: string;
  state: string;
  steps: StepInsight[];
  /** The slowest step by median total time. */
  bottleneck: StepInsight;
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

const round1 = (value: number) => Math.round(value * 10) / 10;

/**
 * Aggregate per-step turnaround from the raw application timeline. Every number
 * here is computed from timestamps by the same functions the citizen page uses.
 * Nothing is stored or hardcoded — swap the applications and the medians move.
 */
export function computeInsights(
  schemes: Scheme[],
  applications: Application[],
  now: number = Date.now(),
): SchemeInsight[] {
  return schemes.map((scheme) => {
    const relevant = applications.filter((app) => app.schemeId === scheme.id);

    const steps: StepInsight[] = [...scheme.steps]
      .sort((a, b) => a.order - b.order)
      .map((wStep) => {
        const instances = relevant
          .flatMap((app) => app.steps)
          .filter((inst) => inst.workflowStepId === wStep.id && inst.enteredAt);

        const totals = instances.map((inst) => totalMs(inst, now) / DAY_MS);
        const waits = instances.map((inst) => waitingMs(inst, now) / DAY_MS);
        const handles = instances.map((inst) => handlingMs(inst, now) / DAY_MS);

        const medianTotal = median(totals);
        const medianWait = median(waits);
        const breaches = totals.filter((t) => t > wStep.slaDays).length;
        const queueShare = medianTotal > 0 ? medianWait / medianTotal : 0;

        return {
          schemeId: scheme.id,
          schemeName: scheme.name,
          department: scheme.department,
          order: wStep.order,
          plainName: wStep.plainName,
          officeName: wStep.officeName,
          slaDays: wStep.slaDays,
          n: instances.length,
          medianTotalDays: round1(medianTotal),
          medianWaitDays: round1(medianWait),
          medianHandleDays: round1(median(handles)),
          queueShare,
          breachRate: instances.length ? breaches / instances.length : 0,
          queueDominated: queueShare > 0.6 && medianTotal >= 1,
        };
      });

    const bottleneck = steps.reduce((slowest, step) =>
      step.medianTotalDays > slowest.medianTotalDays ? step : slowest,
    steps[0]);

    return {
      schemeId: scheme.id,
      schemeName: scheme.name,
      department: scheme.department,
      state: scheme.state,
      steps,
      bottleneck,
    };
  });
}

/** One-line, data-generated interpretation for a step row. */
export function interpret(step: StepInsight): string {
  if (step.n === 0) return 'No applications have reached this step yet.';
  if (step.queueDominated) {
    return `Averages ${step.medianTotalDays} days. ${step.medianWaitDays} of them are queue time before any officer opens the file — a staffing decision, not a training one.`;
  }
  if (step.medianHandleDays >= step.medianWaitDays * 2 && step.medianTotalDays >= 1) {
    return `Averages ${step.medianTotalDays} days, mostly hands-on review. Time here is the work itself, not the queue.`;
  }
  if (step.breachRate > 0.3) {
    return `Misses its ${step.slaDays}-day target in ${Math.round(step.breachRate * 100)}% of applications.`;
  }
  return `Averages ${step.medianTotalDays} days against a ${step.slaDays}-day target. Within tolerance.`;
}
