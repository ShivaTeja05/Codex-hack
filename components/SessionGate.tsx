'use client';

import { useEffect, type ReactNode } from 'react';
import { getCitizenProfile } from '@/lib/seed/profiles';
import { useSession } from '@/lib/state';
import type { CitizenProfile } from '@/lib/types';

export function SessionGate({
  children,
}: {
  children(profile: CitizenProfile): ReactNode;
}) {
  const { citizenId, setCitizenId } = useSession();

  useEffect(() => {
    // The Nagrik Trail landing links straight in, so open the sample record
    // rather than bouncing a reviewer back to a login they did not ask for.
    if (!citizenId) setCitizenId('demo-priya');
  }, [citizenId, setCitizenId]);

  if (!citizenId) {
    return (
      <main className="page-shell">
        <div className="card empty-state">
          <p>Opening the sample record…</p>
        </div>
      </main>
    );
  }

  return children(getCitizenProfile(citizenId));
}
