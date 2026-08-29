import { AUTH_HISTORY, linkageDomains, UIDAI_NO_REGISTRY } from '@/lib/seed/linkages';
import type { LinkageDomain } from '@/lib/seed/linkages';
import { sourceLabels } from '@/lib/presentation';
import type { AuthEvent, Citation, Citizen } from '@/lib/types';

/**
 * How much this prototype can honestly claim about one linkage.
 *
 * confirmed  — the citizen supplied a record; we can read what it says.
 * probable   — an organisation authenticated this identity, so it likely holds
 *              a record. Authentication history proves contact, never content.
 * unknowable — no signal exists. No authority publishes this map.
 */
export type LinkageTier = 'confirmed' | 'probable' | 'unknowable';

export interface MappedLinkage {
  domain: string;
  label: string;
  question: string;
  tier: LinkageTier;
  obligation: LinkageDomain['obligation'];
  obligationDetail: string;
  /** What this prototype can actually say, in plain language. */
  finding: string;
  /** Why it sits in this tier. */
  evidence: string;
  source: Citation;
  /** Citation for the evidence that placed it in this tier. */
  evidenceSource: Citation;
  probeContract: string;
}

const tierRank: Record<LinkageTier, number> = {
  confirmed: 0,
  probable: 1,
  unknowable: 2,
};

function matchingEvent(events: AuthEvent[], domain: LinkageDomain): AuthEvent | undefined {
  return events.find((event) =>
    domain.suggestedBy.some((word) => event.agency.toLocaleLowerCase('en-IN').includes(word)),
  );
}

export function buildLinkageMap(citizen: Citizen, activity: AuthEvent[]): MappedLinkage[] {
  const present = new Set(citizen.documents.map((document) => document.source));

  return linkageDomains
    .map<MappedLinkage>((domain) => {
      const confirming = domain.confirmedBy.filter((source) => present.has(source));

      if (confirming.length > 0) {
        return {
          ...domain,
          tier: 'confirmed',
          finding: `You supplied ${confirming
            .map((source) => sourceLabels[source])
            .join(' and ')}, so OpenTrail can read this and compare it.`,
          evidence: 'Confirmed from a record you provided.',
          evidenceSource: domain.source,
        };
      }

      const event = matchingEvent(activity, domain);
      if (event) {
        return {
          ...domain,
          tier: 'probable',
          finding: `${event.agency} authenticated this identity on ${event.when}. An organisation that authenticates you almost always holds a record about you.`,
          evidence:
            'Inferred from authentication history. This proves contact, not content — OpenTrail cannot see what the record says.',
          evidenceSource: AUTH_HISTORY,
        };
      }

      return {
        ...domain,
        tier: 'unknowable',
        finding: 'OpenTrail cannot tell you whether this is connected to you.',
        evidence:
          'No authority publishes this. Departments do not report linkages to UIDAI, and UIDAI does not store them — a deliberate privacy choice with an unintended cost.',
        evidenceSource: UIDAI_NO_REGISTRY,
      };
    })
    .sort(
      (left, right) =>
        tierRank[left.tier] - tierRank[right.tier] ||
        linkageDomains.findIndex((item) => item.domain === left.domain) -
          linkageDomains.findIndex((item) => item.domain === right.domain),
    );
}

export function countByTier(map: MappedLinkage[]): Record<LinkageTier, number> {
  return map.reduce(
    (counts, item) => ({ ...counts, [item.tier]: counts[item.tier] + 1 }),
    { confirmed: 0, probable: 0, unknowable: 0 } as Record<LinkageTier, number>,
  );
}
