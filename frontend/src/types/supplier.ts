import type { Address, ContactInfo, QualityGrade } from './common';

/** Day-old chick supplier — registered on the Chick Supplier platform */
export interface ChickSupplier {
  id: string;
  name: string;
  address: Address;
  contact: ContactInfo;
  grade: QualityGrade;
  rating: number;
  /** Chicken breed (e.g., Ross 308, Cobb 500) */
  breed: string;
  /** Number of available day-old chicks */
  availableChicks: number;
  /** Price per chick (Toman) */
  pricePerChick: number;
  /** Years of activity */
  experienceYears: number;
  active: boolean;
  description?: string;
}

/** Feed/nutrient supplier — registered on the Feed Supplier platform */
export interface FeedSupplier {
  id: string;
  name: string;
  address: Address;
  contact: ContactInfo;
  grade: QualityGrade;
  rating: number;
  /** Feed type(s) offered */
  feedType: string;
  /** Available capacity in tons */
  capacityTons: number;
  /** Price per kg (Toman) */
  pricePerKg: number;
  /** Years of activity */
  experienceYears: number;
  active: boolean;
  description?: string;
}

/** Slaughterhouse — registered on the Slaughterhouse platform */
export interface Slaughterhouse {
  id: string;
  name: string;
  address: Address;
  contact: ContactInfo;
  grade: QualityGrade;
  rating: number;
  /** Daily processing capacity (chickens) */
  dailyCapacity: number;
  /** Operating hours window (e.g., "۶ صبح تا ۱۰ شب") */
  operatingWindow: string;
  /** Price per chicken (Toman) */
  pricePerChicken: number;
  /** Price per kg (Toman) */
  pricePerKg: number;
  /** Years of activity */
  experienceYears: number;
  active: boolean;
  description?: string;
}

/** Cold storage warehouse — registered on the Warehouse platform */
export interface Warehouse {
  id: string;
  name: string;
  address: Address;
  contact: ContactInfo;
  grade: QualityGrade;
  rating: number;
  /** Storage capacity in tons */
  capacityTons: number;
  /** Operating hours window */
  operatingWindow: string;
  /** Years of activity */
  experienceYears: number;
  active: boolean;
  description?: string;
}
