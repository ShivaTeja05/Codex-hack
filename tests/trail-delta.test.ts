import { describe, expect, it } from 'vitest';
import { createApplication, pendingDelta, resetState, revokeShareCode } from '@/lib/trail/store';
import { decodeDelta, encodeDelta } from '@/lib/trail/delta';
import { PRIMARY_CODE } from '@/lib/trail/seed';

describe('a freshly created application survives the serverless cookie round-trip', () => {
  it('records the new application and its code into the pending delta', () => {
    resetState();
    const created = createApplication('ka-post-matric', ['doc-id', 'doc-bank'], 'Test');
    expect(created).toBeDefined();

    const delta = pendingDelta();
    expect(delta.a.map((app) => app.id)).toContain(created!.applicationId);
    expect(delta.s.map((code) => code.code)).toContain(created!.code);
  });

  it('preserves the application and code through encode/decode', () => {
    resetState();
    const created = createApplication('ka-post-matric', ['doc-id'], 'Test')!;

    const roundTripped = decodeDelta(encodeDelta(pendingDelta()));
    const app = roundTripped.a.find((a) => a.id === created.applicationId);
    const code = roundTripped.s.find((s) => s.code === created.code);

    expect(app).toBeDefined();
    expect(app!.steps.length).toBe(7); // the scheme's full workflow travels with it
    expect(code?.applicationId).toBe(created.applicationId);
  });
});

describe('a revocation survives the serverless cookie round-trip', () => {
  it('records the revoked code into the pending delta', () => {
    resetState();
    const revoked = revokeShareCode(PRIMARY_CODE);
    expect(revoked?.revokedAt).toBeTruthy();

    const roundTripped = decodeDelta(encodeDelta(pendingDelta()));
    expect(roundTripped.v).toContain(PRIMARY_CODE);
  });
});
