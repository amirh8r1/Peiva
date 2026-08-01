import type { Contract, FarmProposal, Collateral } from '@/types';

export const mockContracts: Contract[] = [
  {
    id: 'ctr-1',
    chainId: 'chain-1',
    chainName: 'زنجیره بهار ۱۴۰۴',
    contractType: 'commission',
    terms: 'تأمین ۱۰۰٪ خوراک مورد نیاز توسط تأمین‌کننده. جوجه یکروزه با هزینه تأمین‌کننده. هزینه حمل به عهده مزرعه‌دار. پرداخت تسهیم پس از فروش مرغ زنده.',
    profitSharingMin: 30,
    status: 'sent',
    createdBy: 'supplier-1',
    createdAt: '۱۴۰۴/۰۲/۱۰',
  },
  {
    id: 'ctr-2',
    chainId: 'chain-2',
    chainName: 'زنجیره پاییز ۱۴۰۳',
    contractType: 'contract',
    terms: 'پیمانکاری کامل: تأمین‌کننده تمام نهاده‌ها را تأمین میکند. مزرعه‌دار مسئول نگهداری و بهداشت. تسویه در پایان هر دوره ۴۵ روزه.',
    profitSharingMin: 25,
    status: 'negotiating',
    createdBy: 'supplier-1',
    createdAt: '۱۴۰۳/۰۹/۰۱',
  },
];

export const mockProposals: FarmProposal[] = [
  {
    id: 'prop-1',
    contractId: 'ctr-1',
    contractName: 'زنجیره بهار ۱۴۰۴',
    farmId: 'farm-1',
    farmName: 'مرغداری سبز دشت',
    farmGrade: 'A',
    proposedPercentage: 35,
    status: 'accepted',
    submittedAt: '۱۴۰۴/۰۲/۱۲',
  },
  {
    id: 'prop-2',
    contractId: 'ctr-1',
    contractName: 'زنجیره بهار ۱۴۰۴',
    farmId: 'farm-3',
    farmName: 'مرغداری نوید',
    farmGrade: 'B',
    proposedPercentage: 32,
    status: 'pending',
    submittedAt: '۱۴۰۴/۰۲/۱۳',
  },
  {
    id: 'prop-3',
    contractId: 'ctr-1',
    contractName: 'زنجیره بهار ۱۴۰۴',
    farmId: 'farm-5',
    farmName: 'مرغداری ساحل',
    farmGrade: 'C',
    proposedPercentage: 28,
    status: 'rejected',
    submittedAt: '۱۴۰۴/۰۲/۱۱',
  },
  {
    id: 'prop-4',
    contractId: 'ctr-2',
    contractName: 'زنجیره پاییز ۱۴۰۳',
    farmId: 'farm-2',
    farmName: 'مرغداری طلایی پرور',
    farmGrade: 'A',
    proposedPercentage: 40,
    status: 'accepted',
    submittedAt: '۱۴۰۳/۰۹/۰۵',
  },
];

export const mockCollaterals: Collateral[] = [
  {
    id: 'col-1',
    contractId: 'ctr-1',
    farmId: 'farm-1',
    type: 'check',
    value: 500000000,
    status: 'provided',
    submittedAt: '۱۴۰۴/۰۲/۱۴',
  },
];
