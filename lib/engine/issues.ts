import type { AuthEvent, Issue } from '@/lib/types';

const severityRank: Record<Issue['severity'], number> = {
  high: 0,
  medium: 1,
  low: 2,
};

export function sortIssues(issues: Issue[]): Issue[] {
  return [...issues].sort(
    (left, right) => severityRank[left.severity] - severityRank[right.severity],
  );
}

export function attentionCount(issues: Issue[]): number {
  return issues.filter((issue) => issue.severity !== 'low').length;
}

export function issueFromActivity(event: AuthEvent): Issue {
  return {
    id: `activity-${event.id}`,
    type: 'unknown_sim',
    severity: 'medium',
    title: 'A verification you do not recognise',
    detail: `${event.agency} checked ${event.purpose.toLowerCase()} on ${event.when}.`,
    action: { label: 'Report it' },
    source: { instrument: 'Prototype citizen-report safety rule' },
  };
}
