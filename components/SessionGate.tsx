'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { getCitizenProfile } from '@/lib/seed/profiles';
import { useSession } from '@/lib/state';
import type { CitizenProfile } from '@/lib/types';

export function SessionGate({
  children,
}: {
  children(profile: CitizenProfile): ReactNode;
}) {
  const router = useRouter();
  const { citizenId } = useSession();

  useEffect(() => {
    if (!citizenId) router.replace('/');
  }, [citizenId, router]);

  if (!citizenId) {
    return (
      <main className="page-shell">
        <div className="card empty-state">
          <p>Opening the simulated login…</p>
        </div>
      </main>
    );
  }

  return children(getCitizenProfile(citizenId));
}
