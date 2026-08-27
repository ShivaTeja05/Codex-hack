'use client';

import { useRouter } from 'next/navigation';
import { MockChip } from '@/components/MockChip';
import { ScreenIntro } from '@/components/ScreenIntro';
import { walletAdapter } from '@/lib/mock/walletAdapter';
import { useSession } from '@/lib/state';

export default function ConnectPage() {
  const router = useRouter();
  const { setCitizenId } = useSession();

  function selectProfile(id: string) {
    if (!walletAdapter.connect(id)) return;
    setCitizenId(id);
    router.push('/record');
  }

  return (
    <main className="page-shell connect-shell">
      <ScreenIntro step="2 of 8 · Connect" title="Choose a fictional record set.">
        This simulated wallet shows how consent could work. It never contacts DigiLocker or a government system.
      </ScreenIntro>
      <div className="consent">
        By choosing a profile, you allow this in-memory demo to compare its synthetic records during this browser session.
      </div>
      <div className="card-heading" style={{ marginBottom: 14 }}>
        <h2>Simulated document wallet</h2>
        <MockChip>Mock wallet</MockChip>
      </div>
      <div className="profile-grid">
        {walletAdapter.listProfiles().map((profile) => (
          <button className="profile-button" type="button" key={profile.id} onClick={() => selectProfile(profile.id)}>
            <div className="card profile-card">
              <h2>{profile.displayName}</h2>
              <p>{profile.id === 'demo-priya' ? 'Contains deliberate conflicts for the demo.' : 'A clean record set that passes the checks.'}</p>
              <div className="profile-meta"><span>6 synthetic records</span><span aria-hidden="true">•</span><span>Nothing saved</span></div>
            </div>
          </button>
        ))}
      </div>
    </main>
  );
}
