import { get } from '@/services/apiClient';
import { mockFarms } from '@/mocks';
import type { Farm } from '@/types';

export const farmService = {
  getAll: () => get<Farm[]>('/api/farms', () => mockFarms),

  getById: (id: string) =>
    get<Farm | undefined>(`/api/farms/${id}`, () =>
      mockFarms.find((f) => f.id === id),
    ),
};
