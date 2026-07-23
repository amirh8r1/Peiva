import type { Farm } from './farm';
import type {
  ChickSupplier,
  FeedSupplier,
  Slaughterhouse,
  Warehouse,
} from './supplier';

/**
 * Chain lifecycle step — where the chain currently is.
 * Mirrors the 5 creation wizard steps + post-creation states.
 */
export type ChainStep =
  | 'farm_selection'
  | 'chick_supply'
  | 'feed_supply'
  | 'slaughterhouse'
  | 'warehouse'
  | 'feed_procurement'
  | 'chick_placement'
  | 'live_delivery'
  | 'meat_delivery'
  | 'completed';

export type ChainStatus = 'draft' | 'active' | 'completed' | 'cancelled';

/** A supply chain assembled by the زنجیره‌کن on the Fonoon platform */
export interface Chain {
  id: string;
  name: string;
  /** Selected farms (one or more) */
  farms: Farm[];
  /** Selected day-old chick suppliers (one or more) */
  chickSuppliers: ChickSupplier[];
  /** Selected feed suppliers (one or more) */
  feedSuppliers: FeedSupplier[];
  /** Selected slaughterhouses (one or more) */
  slaughterhouses: Slaughterhouse[];
  /** Selected destination warehouses (one or more) */
  warehouses: Warehouse[];
  /** Total number of chicks across all selected farms */
  totalChicks: number;
  /** Predicted feed conversion ratio */
  predictedConversionRatio?: number;
  /** Current lifecycle step */
  currentStep: ChainStep;
  /** Overall chain status */
  status: ChainStatus;
  /** Creation date (shamsi) */
  createdAt: string;
}

/** Wizard steps for chain creation (one per entity selection) */
export const CHAIN_CREATION_STEPS = [
  { title: 'انتخاب مزرعه', description: 'مزارع مرغ گوشتی' },
  { title: 'خرید جوجه یکروزه', description: 'تأمین‌کنندگان جوجه' },
  { title: 'خرید خوراک دان', description: 'تأمین‌کنندگان نهاده' },
  { title: 'انتخاب کشتارگاه', description: 'کشتارگاه‌های طرف قرارداد' },
  { title: 'تعیین انبار مقصد', description: 'انبارهای سردخانه‌ای' },
] as const;

/** Display configuration for tracking steps shown on ChainCard */
export const CHAIN_TRACKING_STEPS = [
  { key: 'feed_procurement' as const, label: 'دریافت نهاده' },
  { key: 'chick_placement' as const, label: 'جوجه‌ریزی' },
  { key: 'live_delivery' as const, label: 'تحویل مرغ زنده' },
  { key: 'meat_delivery' as const, label: 'تحویل گوشت مرغ' },
  { key: 'completed' as const, label: 'تکمیل شده' },
];

export function getTrackingStepIndex(step: ChainStep): number {
  const idx = CHAIN_TRACKING_STEPS.findIndex((s) => s.key === step);
  return idx >= 0 ? idx : 0;
}
