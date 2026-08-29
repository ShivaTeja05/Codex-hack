'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MockChip } from '@/components/MockChip';
import { ReadonlyOtp, ReadonlyPhone } from '@/components/ReadonlyOtp';
import { useSession } from '@/lib/state';

export default function LoginPage() {
  const router = useRouter();
  const { setCitizenId, setRevealed } = useSession();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');

  function enterDemo(citizenId: string) {
    setCitizenId(citizenId);
    setRevealed(false);
    router.push('/check');
  }

  return (
    <main className="login-shell">
      <section className="login-copy">
        <p className="eyebrow">Milaan · record clarity</p>
        <h1>See what could stop your application.</h1>
        <p>Compare fictional records, find contradictions and understand the next action before a delay costs money.</p>
      </section>
      <section className="card login-card" aria-label="Simulated login">
        <div className="card-heading">
          <div>
            <p className="eyebrow">Step {step === 'phone' ? '1' : '2'} of 2</p>
            <h2>{step === 'phone' ? 'Use the sample number' : 'Check the sample OTP'}</h2>
          </div>
          <MockChip>Simulated</MockChip>
        </div>
        {step === 'phone' ? (
          <>
            <ReadonlyPhone />
            <button className="primary-button" type="button" onClick={() => setStep('otp')}>Send OTP</button>
          </>
        ) : (
          <>
            <ReadonlyOtp />
            <button className="primary-button" type="button" onClick={() => enterDemo('demo-priya')}>Verify</button>
            <button className="link-button" type="button" onClick={() => setStep('phone')}>Back</button>
          </>
        )}
        <div className="persona-picker">
          <p className="persona-title">Skip the login. Open a sample record:</p>
          <button className="persona-button" type="button" onClick={() => enterDemo('demo-priya')}>
            <strong>Priya</strong>
            <small>3 rules block her scholarship. Two are fixable.</small>
          </button>
          <button className="persona-button" type="button" onClick={() => enterDemo('demo-arun')}>
            <strong>Arun</strong>
            <small>Nothing blocks his. See what &ldquo;ready&rdquo; looks like.</small>
          </button>
        </div>
        <p className="simulation-note">simulated login · no real Aadhaar or OTP is used</p>
      </section>
    </main>
  );
}
