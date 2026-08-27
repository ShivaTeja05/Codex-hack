import { getEntitlement } from '@/lib/seed/entitlements';
import type { Bundle, Citizen, Conflict } from '@/lib/types';

function makeReference(input: string): string {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  const token = Math.abs(hash).toString(36).toUpperCase().padStart(7, '0');
  return `MLN-${token.slice(0, 4)}-${token.slice(4, 7)}`;
}

export function buildBundle(
  citizen: Citizen,
  entitlementId: string,
  conflicts: Conflict[],
): Bundle {
  const entitlement = getEntitlement(entitlementId);
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const seed = JSON.stringify({ citizenId: citizen.id, entitlementId, expiresAt });

  return {
    ref: makeReference(seed),
    entitlementId,
    documents: entitlement.requiredDocuments.filter((source) =>
      citizen.documents.some((document) => document.source === source),
    ),
    conflicts,
    physicalStillRequired: [
      'Original category certificate',
      'Bank passbook first page',
    ],
    expiresAt,
  };
}

export function encodeBundle(bundle: Bundle): string {
  const bytes = new TextEncoder().encode(JSON.stringify(bundle));
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

export function decodeBundle(code: string): Bundle | null {
  try {
    const padded = code.replace(/-/g, '+').replace(/_/g, '/').padEnd(
      Math.ceil(code.length / 4) * 4,
      '=',
    );
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes)) as Bundle;
  } catch {
    return null;
  }
}
