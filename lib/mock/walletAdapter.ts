import { citizens } from '@/lib/seed/citizens';
import type { Citizen } from '@/lib/types';

export interface MockWalletAdapter {
  kind: 'simulated-wallet';
  listProfiles(): Pick<Citizen, 'id' | 'displayName'>[];
  connect(profileId: string): Citizen | null;
}

export const walletAdapter: MockWalletAdapter = {
  kind: 'simulated-wallet',
  listProfiles: () =>
    citizens.map(({ id, displayName }) => ({ id, displayName })),
  connect: (profileId) =>
    citizens.find((citizen) => citizen.id === profileId) ?? null,
};
