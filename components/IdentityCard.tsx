'use client';

import { useState } from 'react';
import { ReadonlyOtp, ReadonlyPhone } from '@/components/ReadonlyOtp';
import { useSession } from '@/lib/state';
import type { CitizenProfile } from '@/lib/types';

const pinDigits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'clear', '0', 'back'];

export function IdentityCard({ profile }: { profile: CitizenProfile }) {
  const { revealed, setRevealed } = useSession();
  const [showPin, setShowPin] = useState(false);
  const [forgotPin, setForgotPin] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  function pressPin(value: string) {
    setError('');
    if (value === 'clear') return setPin('');
    if (value === 'back') return setPin((current) => current.slice(0, -1));
    setPin((current) => (current.length < 4 ? `${current}${value}` : current));
  }

  function unlock() {
    if (pin === profile.demoPin) {
      setRevealed(true);
      setShowPin(false);
      setPin('');
      setError('');
      return;
    }
    setError('That PIN does not match. Try 1234 for this demo.');
    setPin('');
  }

  function revealFromOtp() {
    setRevealed(true);
    setForgotPin(false);
    setShowPin(false);
    setError('');
  }

  return (
    <section className="identity-card" aria-label="Masked synthetic identity card">
      <div className="identity-topline">
        <span className="identity-label">Identity record</span>
        <span className="synthetic-seal">Synthetic</span>
      </div>
      <dl className="identity-fields">
        <div><dt>Aadhaar</dt><dd>XXXX XXXX {profile.identity.aadhaarLast4}</dd></div>
        <div><dt>Name</dt><dd>{revealed ? profile.identity.name : 'hidden'}</dd></div>
        <div><dt>Address</dt><dd>{revealed ? profile.identity.address : 'hidden'}</dd></div>
        <div><dt>Date of birth</dt><dd>{revealed ? profile.identity.dob : 'hidden'}</dd></div>
      </dl>

      {revealed ? (
        <button className="identity-action" type="button" onClick={() => setRevealed(false)}>Hide again</button>
      ) : !showPin ? (
        <button className="identity-action" type="button" onClick={() => setShowPin(true)}>Reveal details</button>
      ) : forgotPin ? (
        <div className="unlock-panel">
          <p className="panel-title">Simulated recovery</p>
          <ReadonlyPhone />
          <ReadonlyOtp />
          <button className="primary-button" type="button" onClick={revealFromOtp}>Verify and reveal</button>
          <button className="link-button" type="button" onClick={() => setForgotPin(false)}>Back to PIN</button>
        </div>
      ) : (
        <div className="unlock-panel">
          <div className="pin-heading">
            <div><p className="panel-title">Enter your 4-digit PIN</p><p>Demo PIN: <strong>1234</strong></p></div>
            <span className="pin-dots" aria-label={`${pin.length} digits entered`}>{'●'.repeat(pin.length)}{'○'.repeat(4 - pin.length)}</span>
          </div>
          <div className="pin-pad" aria-label="PIN keypad">
            {pinDigits.map((digit) => (
              <button type="button" key={digit} onClick={() => pressPin(digit)}>
                {digit === 'clear' ? 'Clear' : digit === 'back' ? '⌫' : digit}
              </button>
            ))}
          </div>
          {error ? <p className="inline-error" role="alert">{error}</p> : null}
          <button className="primary-button" type="button" onClick={unlock} disabled={pin.length !== 4}>Unlock details</button>
          <button className="link-button" type="button" onClick={() => setForgotPin(true)}>Forgot PIN?</button>
        </div>
      )}
    </section>
  );
}
