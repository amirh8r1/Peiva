/** Shared types used across the entire Fonoon ecosystem */

export interface Address {
  province: string;
  city: string;
  address: string;
  postalCode?: string;
}

export interface ContactInfo {
  phone: string;
  email?: string;
  website?: string;
}

/** A grade-based quality tier used across all entity types */
export type QualityGrade = 'A' | 'B' | 'C' | 'D';

export const gradeColorMap: Record<QualityGrade, string> = {
  A: '#389e0d',
  B: '#1677ff',
  C: '#faad14',
  D: '#ff4d4f',
};

export const gradeLabelMap: Record<QualityGrade, string> = {
  A: 'A',
  B: 'B',
  C: 'C',
  D: 'D',
};
