import { sourceLabels } from '@/lib/presentation';
import type { Citizen } from '@/lib/types';

/**
 * Where scheme money will actually land.
 *
 * NPCI's mapper holds one Aadhaar against one account at a time, so the last
 * bank to seed wins. The account named on an application form has no say in it.
 * This is derived from the seeded records, not asserted.
 */
export interface RoutingStatus {
  /** The account the mapper points at — modelled by the issuer-signed bank record. */
  mapperAccount: string;
  mapperLabel: string;
  seededOn: string;
  seededYearsAgo: number;
  /** What the citizen wrote on the application. */
  formAccount?: string;
  formLabel?: string;
  agrees: boolean;
  /** One sentence answering "where does the money go". */
  landing: string;
}

function yearsSince(iso: string): number {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return 0;
  return Math.max(0, Math.floor((Date.now() - then) / (365.25 * 24 * 60 * 60 * 1000)));
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function buildRouting(citizen: Citizen): RoutingStatus | null {
  const bank = citizen.documents.find((document) => document.source === 'bank');
  if (!bank?.fields.bankAccount) return null;

  const form = citizen.documents.find((document) => document.source === 'applicationForm');
  const formAccount = form?.fields.bankAccount;
  const agrees = !formAccount || formAccount === bank.fields.bankAccount;

  return {
    mapperAccount: bank.fields.bankAccount,
    mapperLabel: sourceLabels.bank,
    seededOn: formatDate(bank.issuedOn),
    seededYearsAgo: yearsSince(bank.issuedOn),
    formAccount,
    formLabel: form ? sourceLabels.applicationForm : undefined,
    agrees,
    landing: agrees
      ? `Money for this scheme will land in ${bank.fields.bankAccount}, which is the account your application names.`
      : `Money for this scheme will land in ${bank.fields.bankAccount} — not ${formAccount}, the account your application names.`,
  };
}
