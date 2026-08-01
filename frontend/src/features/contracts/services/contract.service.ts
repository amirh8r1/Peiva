import { get, post } from '@/services/apiClient';
import { mockContracts, mockProposals, mockCollaterals } from '@/mocks';
import type { Contract, FarmProposal, Collateral } from '@/types';

export const contractService = {
  getAll: () => get<Contract[]>('/api/contracts', () => mockContracts),

  getById: (id: string) =>
    get<Contract | undefined>(`/api/contracts/${id}`, () =>
      mockContracts.find((c) => c.id === id),
    ),
};

export const proposalService = {
  getByFarmId: (farmId: string) =>
    get<FarmProposal[]>('/api/proposals', () =>
      mockProposals.filter((p) => p.farmId === farmId),
    ),

  getAllForContract: (contractId: string) =>
    get<FarmProposal[]>(`/api/proposals?contractId=${contractId}`, () =>
      mockProposals.filter((p) => p.contractId === contractId),
    ),

  submit: (proposal: Partial<FarmProposal>) =>
    post<FarmProposal, any>('/api/proposals', proposal, () => ({
      ...(proposal as FarmProposal),
      id: `prop-${Date.now()}`,
      submittedAt: 'اکنون',
    })),
};

export const collateralService = {
  getByFarmId: (farmId: string) =>
    get<Collateral[]>('/api/collaterals', () =>
      mockCollaterals.filter((c) => c.farmId === farmId),
    ),

  getByContractId: (contractId: string) =>
    get<Collateral[]>(`/api/collaterals?contractId=${contractId}`, () =>
      mockCollaterals.filter((c) => c.contractId === contractId),
    ),

  submit: (data: Partial<Collateral>) =>
    post<Collateral, any>('/api/collaterals', data, () => ({
      ...(data as Collateral),
      id: `col-${Date.now()}`,
      status: 'provided',
      submittedAt: 'اکنون',
    })),
};
