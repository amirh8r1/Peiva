import { get } from '@/services/apiClient';
import {
  mockChickSuppliers,
  mockFeedSuppliers,
  mockSlaughterhouses,
  mockWarehouses,
} from '@/mocks';
import type { ChickSupplier, FeedSupplier, Slaughterhouse, Warehouse } from '@/types';

export const chickSupplierService = {
  getAll: () =>
    get<ChickSupplier[]>('/api/chick-suppliers', () => mockChickSuppliers),
};

export const feedSupplierService = {
  getAll: () =>
    get<FeedSupplier[]>('/api/feed-suppliers', () => mockFeedSuppliers),
};

export const slaughterhouseService = {
  getAll: () =>
    get<Slaughterhouse[]>('/api/slaughterhouses', () => mockSlaughterhouses),
};

export const warehouseService = {
  getAll: () =>
    get<Warehouse[]>('/api/warehouses', () => mockWarehouses),
};
