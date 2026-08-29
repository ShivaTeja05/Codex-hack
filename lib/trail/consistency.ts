import type { TrailDocument } from './types';

/**
 * Pre-submission consistency checks. Pure string comparison on the fields the
 * citizen selected — no AI, no network. The useful part is not "mismatch
 * found"; it is *which step this fails at and what happens then*. That is what
 * turns a warning into something a citizen can act on before they submit.
 */

export type Severity = 'BLOCKER' | 'WARNING' | 'INFO';

export interface Finding {
  severity: Severity;
  title: string;
  message: string;
  docs: string[];
}

const ABBREV: Record<string, string> = {
  RD: 'ROAD', ROAD: 'ROAD', ST: 'STREET', STREET: 'STREET',
  NR: 'NEAR', NEAR: 'NEAR', CRS: 'CROSS', CROSS: 'CROSS',
  MAIN: 'MAIN', NGR: 'NAGAR', NAGAR: 'NAGAR',
};

export function normName(value = ''): string {
  return value
    .toUpperCase()
    .replace(/\b(MR|MRS|MS|SHRI|SMT|KUM|DR)\b/g, '')
    .replace(/[.,]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function normPhone(value = ''): string {
  const digits = value.replace(/[^0-9X]/gi, '');
  return digits.slice(-10);
}

function pincodeOf(value = ''): string | undefined {
  return value.match(/\b(\d{6})\b/)?.[1];
}

function addrTokens(value = ''): string[] {
  return value
    .toUpperCase()
    .replace(/[.,]/g, ' ')
    .split(/\s+/)
    .filter((token) => token && !/^\d{6}$/.test(token))
    .map((token) => ABBREV[token] ?? token);
}

/** Two names match if one is an initial-form / reordering of the other. */
function namesMatch(a: string, b: string): boolean {
  if (!a || !b) return true;
  if (a === b) return true;
  const at = a.split(' ').filter(Boolean);
  const bt = b.split(' ').filter(Boolean);
  const shared = at.filter((t) => bt.some((u) => u === t || u[0] === t[0]));
  // e.g. "M SABANNAVAR" vs "MEENA SABANNAVAR": surname shared, initial shared.
  return shared.length >= Math.min(at.length, bt.length);
}

export function checkConsistency(docs: TrailDocument[]): Finding[] {
  const findings: Finding[] = [];
  const named = (ids: string[]) =>
    ids.map((id) => docs.find((d) => d.id === id)?.plainName ?? id);

  const pair = <T>(
    pick: (d: TrailDocument) => T | undefined,
    equal: (a: T, b: T) => boolean,
  ): [TrailDocument, TrailDocument] | null => {
    for (let i = 0; i < docs.length; i += 1) {
      for (let j = i + 1; j < docs.length; j += 1) {
        const a = pick(docs[i]);
        const b = pick(docs[j]);
        if (a !== undefined && b !== undefined && !equal(a, b)) {
          return [docs[i], docs[j]];
        }
      }
    }
    return null;
  };

  const dobMismatch = pair((d) => d.fields.dob, (a, b) => a === b);
  if (dobMismatch) {
    findings.push({
      severity: 'BLOCKER',
      title: 'Date of birth does not match',
      message:
        'Your date of birth is different on two documents. Applications are rejected at the identity check for this. Fix it before you submit.',
      docs: named([dobMismatch[0].id, dobMismatch[1].id]),
    });
  }

  const nameMismatch = pair(
    (d) => (d.fields.name ? normName(d.fields.name) : undefined),
    namesMatch,
  );
  if (nameMismatch) {
    findings.push({
      severity: 'BLOCKER',
      title: 'Name is spelled differently',
      message:
        'Your name is spelled differently across two documents. This is caught at the identity check and the application is sent back.',
      docs: named([nameMismatch[0].id, nameMismatch[1].id]),
    });
  }

  const pinMismatch = pair((d) => pincodeOf(d.fields.address ? `${d.fields.address} ${d.fields.pincode ?? ''}` : d.fields.pincode ?? ''), (a, b) => a === b);
  if (pinMismatch) {
    const a = pincodeOf(`${pinMismatch[0].fields.address ?? ''} ${pinMismatch[0].fields.pincode ?? ''}`);
    const b = pincodeOf(`${pinMismatch[1].fields.address ?? ''} ${pinMismatch[1].fields.pincode ?? ''}`);
    findings.push({
      severity: 'WARNING',
      title: 'PIN codes do not match',
      message:
        `One document shows PIN ${a}, another shows PIN ${b}. This is usually caught at the "confirming you live in this district" step and sent back. Correct it now to avoid a round trip.`,
      docs: named([pinMismatch[0].id, pinMismatch[1].id]),
    });
  } else {
    const addrMismatch = pair(
      (d) => (d.fields.address ? addrTokens(d.fields.address).join(' ') : undefined),
      (a, b) => {
        const at = a.split(' ');
        const bt = b.split(' ');
        const shared = at.filter((t) => bt.includes(t)).length;
        return shared / Math.max(at.length, bt.length) >= 0.5;
      },
    );
    if (addrMismatch) {
      findings.push({
        severity: 'WARNING',
        title: 'Addresses do not match',
        message:
          'Your address does not match across two documents. The domicile check usually sends this back.',
        docs: named([addrMismatch[0].id, addrMismatch[1].id]),
      });
    }
  }

  const phoneMismatch = pair(
    (d) => (d.fields.phone ? normPhone(d.fields.phone) : undefined),
    (a, b) => a === b,
  );
  if (phoneMismatch) {
    findings.push({
      severity: 'INFO',
      title: 'Two different phone numbers on file',
      message:
        'Two different phone numbers are on your documents. Updates about this application may go to the wrong one.',
      docs: named([phoneMismatch[0].id, phoneMismatch[1].id]),
    });
  }

  const order: Record<Severity, number> = { BLOCKER: 0, WARNING: 1, INFO: 2 };
  return findings.sort((a, b) => order[a.severity] - order[b.severity]);
}
