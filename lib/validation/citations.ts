import type { Citation } from '@/lib/types';

export interface CitedEntry {
  id: string;
  source: Citation;
}

export function validateCitationSources(entries: CitedEntry[]): void {
  const invalid = entries.filter((entry) => !entry.source.instrument.trim());
  if (invalid.length > 0) {
    throw new Error(
      `Cited entries missing source.instrument: ${invalid.map((entry) => entry.id).join(', ')}`,
    );
  }
}
