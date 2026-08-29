'use client';

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { TrackedReport } from '@/lib/types';

interface SessionState {
  citizenId: string | null;
  revealed: boolean;
  reportedIssues: Record<string, TrackedReport>;
  activityChoices: Record<string, boolean>;
  /** Ids of corrections the citizen has applied in this session. Order is kept. */
  appliedCorrections: string[];
  setCitizenId(id: string): void;
  setRevealed(value: boolean): void;
  reportIssue(id: string): TrackedReport;
  setActivityChoice(id: string, recognised: boolean): TrackedReport | null;
  applyCorrection(id: string): void;
  undoCorrection(id: string): void;
  resetCorrections(): void;
}

const SessionContext = createContext<SessionState | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [citizenId, setCitizenId] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [reportedIssues, setReportedIssues] = useState<Record<string, TrackedReport>>({});
  const [activityChoices, setActivityChoices] = useState<Record<string, boolean>>({});
  const [appliedCorrections, setAppliedCorrections] = useState<string[]>([]);

  function reportIssue(id: string): TrackedReport {
    const report = reportedIssues[id] ?? {
      ref: `MLN-RPT-${id.replace(/[^a-z0-9]/gi, '').slice(-4).toUpperCase().padStart(4, '0')}`,
      status: 'received' as const,
    };
    setReportedIssues((current) => ({ ...current, [id]: report }));
    return report;
  }

  function applyCorrection(id: string) {
    setAppliedCorrections((current) => (current.includes(id) ? current : [...current, id]));
  }

  function undoCorrection(id: string) {
    setAppliedCorrections((current) => current.filter((item) => item !== id));
  }

  function resetCorrections() {
    setAppliedCorrections([]);
  }

  function setActivityChoice(id: string, recognised: boolean): TrackedReport | null {
    setActivityChoices((current) => ({ ...current, [id]: recognised }));
    return recognised ? null : reportIssue(`activity-${id}`);
  }

  const value = useMemo(
    () => ({
      citizenId,
      revealed,
      reportedIssues,
      activityChoices,
      appliedCorrections,
      setCitizenId,
      setRevealed,
      reportIssue,
      setActivityChoice,
      applyCorrection,
      undoCorrection,
      resetCorrections,
    }),
    [citizenId, revealed, reportedIssues, activityChoices, appliedCorrections],
  );
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionState {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession must be used inside SessionProvider');
  return context;
}
