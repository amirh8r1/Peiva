import type { Contract, FarmProposal, Collateral } from '@/types';

export const mockContracts: Contract[] = [
  {
    id: 'ctr-mock-1',
    name: 'قرارداد بهار ۱۴۰۴', contractType: 'commission',
    selectedTermIds: ['t1', 't2', 't4'], profitMethodId: 'p1', profitSharingMin: 30,
    duration: 2, region: 'تهران',
    periods: [
      { index: 0, chickCount: 20000, targetWeight: 2500, deliveryDate: '۱۴۰۴/۰۳/۰۱' },
      { index: 1, chickCount: 20000, targetWeight: 2500, deliveryDate: '۱۴۰۴/۰۴/۱۵' },
    ],
    acceptedCollateralTypes: ['cash', 'check'],
    selectedFarmIds: ['farm-1'],
    status: 'sent', createdBy: 'supplier', createdAt: '۱۴۰۴/۰۲/۱۰',
  },
];

export const mockProposals: FarmProposal[] = [
  { id: 'prop-mock-1', contractId: 'ctr-mock-1', contractName: 'قرارداد بهار ۱۴۰۴', farmId: 'farm-1', farmName: 'مرغداری سبز دشت', farmGrade: 'A', status: 'pending', submittedAt: '۱۴۰۴/۰۲/۱۲' },
];

export const mockCollaterals: Collateral[] = [];
