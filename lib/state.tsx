'use client';

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { POST_MATRIC_SCHOLARSHIP_ID } from '@/lib/seed/entitlements';

interface SessionState {
  citizenId: string | null;
  goalId: string;
  selectedFixes: string[];
  setCitizenId(id: string): void;
  setGoalId(id: string): void;
  setSelectedFixes(ids: string[]): void;
}

const SessionContext = createContext<SessionState | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [citizenId, setCitizenId] = useState<string | null>(null);
  const [goalId, setGoalId] = useState(POST_MATRIC_SCHOLARSHIP_ID);
  const [selectedFixes, setSelectedFixes] = useState<string[]>([]);
  const value = useMemo(
    () => ({
      citizenId,
      goalId,
      selectedFixes,
      setCitizenId,
      setGoalId,
      setSelectedFixes,
    }),
    [citizenId, goalId, selectedFixes],
  );
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionState {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession must be used inside SessionProvider');
  return context;
}
