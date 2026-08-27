import { MockChip } from '@/components/MockChip';

export function ReadonlyPhone() {
  return (
    <label className="demo-field">
      <span>Sample mobile number</span>
      <span className="input-with-chip">
        <input value="98••••••32" readOnly aria-readonly="true" />
        <MockChip>Sample data</MockChip>
      </span>
    </label>
  );
}

export function ReadonlyOtp() {
  return (
    <fieldset className="otp-fieldset">
      <legend>Simulated OTP</legend>
      <div className="otp-boxes">
        {'123456'.split('').map((digit, index) => (
          <input
            key={`${digit}-${index}`}
            value={digit}
            readOnly
            aria-label={`OTP digit ${index + 1}`}
            aria-readonly="true"
          />
        ))}
      </div>
    </fieldset>
  );
}
