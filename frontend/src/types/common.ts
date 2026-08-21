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

/** رنگ گریدها از preset های antd (توکن محور — بدون hex). */
export const gradeColorMap: Record<QualityGrade, string> = {
  A: 'green',
  B: 'blue',
  C: 'orange',
  D: 'red',
};

export const gradeLabelMap: Record<QualityGrade, string> = {
  A: 'A',
  B: 'B',
  C: 'C',
  D: 'D',
};
