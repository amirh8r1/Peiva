import type { Contract, FarmProposal, Collateral } from '@/types';

export const mockContracts: Contract[] = [
  {
    id: 'ctr-1',
    name: 'قرارداد بهار ۱۴۰۴',
    contractType: 'commission',
    selectedTermIds: ['t1', 't2', 't4'],
    profitMethodId: 'p1',
    profitSharingMin: 30,
    status: 'sent',
    createdBy: 'supplier',
    createdAt: '۱۴۰۴/۰۲/۱۰',
  },
  {
    id: 'ctr-2',
    name: 'قرارداد پاییز ۱۴۰۳',
    contractType: 'contract',
    selectedTermIds: ['t1', 't5'],
    profitMethodId: 'p2',
    profitSharingMin: 25,
    status: 'negotiating',
    createdBy: 'supplier',
    createdAt: '۱۴۰۳/۰۹/۰۱',
  },
];

export const mockProposals: FarmProposal[] = [
  { id: 'prop-1', contractId: 'ctr-1', contractName: 'قرارداد بهار ۱۴۰۴', farmId: 'farm-1', farmName: 'مرغداری سبز دشت', farmGrade: 'A', proposedPercentage: 35, status: 'pending', submittedAt: '۱۴۰۴/۰۲/۱۲' },
  { id: 'prop-2', contractId: 'ctr-1', contractName: 'قرارداد بهار ۱۴۰۴', farmId: 'farm-3', farmName: 'مرغداری نوید', farmGrade: 'B', proposedPercentage: 32, status: 'pending', submittedAt: '۱۴۰۴/۰۲/۱۳' },
  { id: 'prop-3', contractId: 'ctr-2', contractName: 'قرارداد پاییز ۱۴۰۳', farmId: 'farm-2', farmName: 'مرغداری طلایی پرور', farmGrade: 'A', proposedPercentage: 40, status: 'pending', submittedAt: '۱۴۰۳/۰۹/۰۵' },
];

export const mockCollaterals: Collateral[] = [
  { id: 'col-1', contractId: 'ctr-1', farmId: 'farm-1', type: 'check', value: 500000000, status: 'provided', submittedAt: '۱۴۰۴/۰۲/۱۴' },
];
