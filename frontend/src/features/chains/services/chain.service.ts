import { get, post } from '@/services/apiClient';
import { mockChains } from '@/mocks';
import type { Chain } from '@/types';

export interface CreateChainInput {
  name: string;
  farmIds: string[];
  chickSupplierIds: string[];
  feedSupplierIds: string[];
  slaughterhouseIds: string[];
  warehouseIds: string[];
}

export const chainService = {
  getAll: () => get<Chain[]>('/api/chains', () => mockChains),

  getById: (id: string) =>
    get<Chain | undefined>(`/api/chains/${id}`, () =>
      mockChains.find((c) => c.id === id),
    ),

  create: (input: CreateChainInput) =>
    post<Chain, CreateChainInput>('/api/chains', input, () => ({
      ...mockChains[0],
      id: `chain-${Date.now()}`,
      name: input.name,
    })),
};
