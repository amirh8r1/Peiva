import type { Farm } from './farm';
import type {
  ChickSupplier,
  FeedSupplier,
  Slaughterhouse,
  Warehouse,
} from './supplier';
import type { Contract } from './contract';

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

export interface Chain {
  id: string;
  name: string;
  farms: Farm[];
  chickSuppliers: ChickSupplier[];
  feedSuppliers: FeedSupplier[];
  slaughterhouses: Slaughterhouse[];
  warehouses: Warehouse[];
  totalChicks: number;
  predictedConversionRatio?: number;
  currentStep: ChainStep;
  status: ChainStatus;
  createdAt: string;
}

/** All wizard steps — chain creation + contract definition */
export const CHAIN_CREATION_STEPS = [
  { title: 'مزرعه', description: 'انتخاب مزرعه' },
  { title: 'جوجه', description: 'انتخاب تأمین‌کننده جوجه' },
  { title: 'دان', description: 'انتخاب تأمین‌کننده خوراک' },
  { title: 'کشتارگاه', description: 'انتخاب کشتارگاه' },
  { title: 'انبار', description: 'انتخاب انبار مقصد' },
  { title: 'نوع قرارداد', description: 'کارمزدی یا پیمانکاری' },
  { title: 'شرایط', description: 'تعهدات طرفین' },
  { title: 'تسهیم', description: 'حداقل درصد تسهیم منافع' },
] as const;

export const TOTAL_STEPS = CHAIN_CREATION_STEPS.length; // 8

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
