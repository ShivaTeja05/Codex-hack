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

  function enterDemo() {
    setCitizenId('demo-priya');
    setRevealed(false);
    router.push('/home');
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
            <button className="primary-button" type="button" onClick={enterDemo}>Verify</button>
            <button className="link-button" type="button" onClick={() => setStep('phone')}>Back</button>
          </>
        )}
        <button className="skip-link" type="button" onClick={enterDemo}>Skip to demo</button>
        <p className="simulation-note">simulated login · no real Aadhaar or OTP is used</p>
      </section>
    </main>
  );
}
