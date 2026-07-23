import type { Chain } from '@/types';
import { mockFarms } from './farms';
import { mockChickSuppliers, mockFeedSuppliers, mockSlaughterhouses, mockWarehouses } from './suppliers';

export const mockChains: Chain[] = [
  {
    id: 'chain-1',
    name: 'زنجیره بهار ۱۴۰۴',
    farms: [mockFarms[0], mockFarms[3]],
    chickSuppliers: [mockChickSuppliers[0], mockChickSuppliers[1]],
    feedSuppliers: [mockFeedSuppliers[0]],
    slaughterhouses: [mockSlaughterhouses[0]],
    warehouses: [mockWarehouses[0]],
    totalChicks: 70000,
    predictedConversionRatio: 1.65,
    currentStep: 'chick_placement',
    status: 'active',
    createdAt: '۱۴۰۴/۰۱/۱۵',
  },
  {
    id: 'chain-2',
    name: 'زنجیره پاییز ۱۴۰۳',
    farms: [mockFarms[1], mockFarms[2]],
    chickSuppliers: [mockChickSuppliers[1]],
    feedSuppliers: [mockFeedSuppliers[1], mockFeedSuppliers[3]],
    slaughterhouses: [mockSlaughterhouses[1]],
    warehouses: [mockWarehouses[1]],
    totalChicks: 50000,
    predictedConversionRatio: 1.72,
    currentStep: 'live_delivery',
    status: 'active',
    createdAt: '۱۴۰۳/۰۸/۱۰',
  },
  {
    id: 'chain-3',
    name: 'زنجیره تابستان ۱۴۰۳',
    farms: [mockFarms[4]],
    chickSuppliers: [mockChickSuppliers[2]],
    feedSuppliers: [mockFeedSuppliers[2]],
    slaughterhouses: [mockSlaughterhouses[2], mockSlaughterhouses[3]],
    warehouses: [mockWarehouses[2]],
    totalChicks: 25000,
    predictedConversionRatio: 1.95,
    currentStep: 'completed',
    status: 'completed',
    createdAt: '۱۴۰۳/۰۴/۰۱',
  },
];
