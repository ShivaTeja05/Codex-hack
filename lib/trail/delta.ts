import type { Application, DocEvent, Flag, ShareCode } from './types';

/**
 * Serverless makes the in-memory store unreliable on its own: an event written
 * while handling one request lands in that instance's memory, and the next
 * request may be served by a different instance that never saw it.
 *
 * So every mutation is also written to a small cookie. Any instance can rebuild
 * the demo from seed plus this delta, which is what makes "open a document in
 * one tab, watch the other tab change" actually work in production.
 *
 * The cookie holds demo interactions only. There is no personal data in it, and
 * it dies with the browser session.
 */
export interface Delta {
  /** Events added since the seed. */
  e: DocEvent[];
  /** stepInstanceId -> firstOpenedAt */
  o: Record<string, string>;
  /** stepInstanceId -> completedAt */
  c: Record<string, string>;
  /** stepInstanceId -> enteredAt, for steps that began after a completion. */
  n: Record<string, string>;
  /** Flags raised since the seed. */
  f: Flag[];
  /** Ids of seeded flags the citizen has resolved. */
  r: string[];
  /** Applications created after the seed (e.g. a new /apply submission). */
  a: Application[];
  /** Share codes created after the seed, paired with those applications. */
  s: ShareCode[];
  /** Codes of share codes the citizen has revoked. */
  v: string[];
}

export const DELTA_COOKIE = 'trail_demo';

export function emptyDelta(): Delta {
  return { e: [], o: {}, c: {}, n: {}, f: [], r: [], a: [], s: [], v: [] };
}

export function isEmpty(delta: Delta): boolean {
  return (
    delta.e.length === 0 &&
    delta.f.length === 0 &&
    delta.r.length === 0 &&
    delta.a.length === 0 &&
    delta.s.length === 0 &&
    delta.v.length === 0 &&
    Object.keys(delta.o).length === 0 &&
    Object.keys(delta.c).length === 0 &&
    Object.keys(delta.n).length === 0
  );
}

export function encodeDelta(delta: Delta): string {
  const json = JSON.stringify(delta);
  if (typeof Buffer !== 'undefined') return Buffer.from(json, 'utf8').toString('base64url');
  return btoa(json).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function decodeDelta(raw?: string | null): Delta {
  if (!raw) return emptyDelta();
  try {
    const json =
      typeof Buffer !== 'undefined'
        ? Buffer.from(raw, 'base64url').toString('utf8')
        : atob(raw.replace(/-/g, '+').replace(/_/g, '/'));
    const parsed = JSON.parse(json) as Partial<Delta>;
    return {
      e: parsed.e ?? [],
      o: parsed.o ?? {},
      c: parsed.c ?? {},
      n: parsed.n ?? {},
      f: parsed.f ?? [],
      r: parsed.r ?? [],
      a: parsed.a ?? [],
      s: parsed.s ?? [],
      v: parsed.v ?? [],
    };
  } catch {
    return emptyDelta();
  }
}

export function mergeDelta(base: Delta, extra: Delta): Delta {
  const seen = new Set(base.e.map((event) => event.id));
  const flagIds = new Set(base.f.map((flag) => flag.id));
  const appIds = new Set(base.a.map((app) => app.id));
  const codes = new Set(base.s.map((code) => code.code));
  return {
    e: [...base.e, ...extra.e.filter((event) => !seen.has(event.id))],
    o: { ...base.o, ...extra.o },
    c: { ...base.c, ...extra.c },
    n: { ...base.n, ...extra.n },
    f: [...base.f, ...extra.f.filter((flag) => !flagIds.has(flag.id))],
    r: Array.from(new Set([...base.r, ...extra.r])),
    a: [...base.a, ...extra.a.filter((app) => !appIds.has(app.id))],
    s: [...base.s, ...extra.s.filter((code) => !codes.has(code.code))],
    v: Array.from(new Set([...base.v, ...extra.v])),
  };
}

/** Cookies cap around 4KB. Keep the newest interactions if the demo runs long. */
export function trimDelta(delta: Delta, maxEvents = 40, maxApps = 4): Delta {
  let trimmed = delta;
  if (trimmed.e.length > maxEvents) {
    trimmed = { ...trimmed, e: trimmed.e.slice(-maxEvents) };
  }
  // Applications carry their whole step array, so keep only the newest few and
  // the share codes that point at them.
  if (trimmed.a.length > maxApps) {
    const keptApps = trimmed.a.slice(-maxApps);
    const keptIds = new Set(keptApps.map((app) => app.id));
    trimmed = {
      ...trimmed,
      a: keptApps,
      s: trimmed.s.filter((code) => !code.applicationId || keptIds.has(code.applicationId)),
    };
  }
  return trimmed;
}
