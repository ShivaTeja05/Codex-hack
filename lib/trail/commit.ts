import type { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  DELTA_COOKIE,
  decodeDelta,
  encodeDelta,
  isEmpty,
  mergeDelta,
  trimDelta,
} from './delta';
import { clearPending, pendingDelta } from './store';

/**
 * Write this request's mutations back to the caller's cookie, so the next
 * request sees them regardless of which serverless instance serves it.
 */
export function commitDelta<T>(response: NextResponse<T>): NextResponse<T> {
  const pending = pendingDelta();
  if (isEmpty(pending)) return response;

  let existing;
  try {
    existing = decodeDelta(cookies().get(DELTA_COOKIE)?.value);
  } catch {
    existing = undefined;
  }

  const merged = trimDelta(
    existing ? mergeDelta(existing, pending) : pending,
  );

  response.cookies.set({
    name: DELTA_COOKIE,
    value: encodeDelta(merged),
    path: '/',
    sameSite: 'lax',
    httpOnly: false,
    maxAge: 60 * 60 * 6,
  });
  clearPending();
  return response;
}

/** Drop the demo delta so /whats-real "Reset" genuinely resets. */
export function clearDelta<T>(response: NextResponse<T>): NextResponse<T> {
  clearPending();
  response.cookies.set({ name: DELTA_COOKIE, value: '', path: '/', maxAge: 0 });
  return response;
}
