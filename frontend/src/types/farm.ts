import type { Address, ContactInfo, QualityGrade } from './common';

/** A poultry farm — registered on the Farm Owner's platform */
export interface Farm {
  id: string;
  name: string;
  ownerName: string;
  address: Address;
  contact: ContactInfo;
  /** Quality grade */
  grade: QualityGrade;
  /** Total chicken capacity per rearing cycle */
  capacity: number;
  /** Average feed conversion ratio — last 3 cycles */
  avgConversionRatio: number;
  /** Years of activity */
  experienceYears: number;
  /** Average rating (1-5) */
  rating: number;
  /** Whether the farm is currently operational */
  active: boolean;
  /** Optional description */
  description?: string;
}
