/**
 * درخواست مشارکت‌کننده — مدل زنجیره‌دار v3.
 * مشارکت‌کننده آورده‌هایش (نهاده/جوجه/اعتبار مالی) را اعلام و مرغ درخواستی، تاریخ تحویل و استان را مشخص می‌کند؛
 * سامانه در ویزارد سهم بازیگران را خودکار برآورد می‌کند (snapshot مشارکت) و زنجیره‌دار مزرعه را تطبیق می‌دهد.
 * تاریخ‌ها 'YYYY/MM/DD' انگلیسی (کانونشن اپ) — نمایش با toPersianDigits.
 */

export type RequestInputKind = 'feed' | 'chick' | 'cash';

export interface RequestInput {
  kind: RequestInputKind;
  /** feed: تن | chick: قطعه | cash: تومان — همیشه > 0 */
  amount: number;
}

export const REQUEST_INPUT_LABELS: Record<RequestInputKind, { label: string; unit: string }> = {
  feed: { label: 'دان مرغی', unit: 'تن' },
  chick: { label: 'جوجه یکروزه', unit: 'قطعه' },
  cash: { label: 'وجه نقد', unit: 'تومان' },
};

export type SupplierRequestStatus = 'pending' | 'matched' | 'in_progress' | 'completed' | 'rejected';

export interface SupplierRequest {
  /** قطعی: `rq-{ts}-{rand}` — یکتا (append-only، مثل کانونشن اپ). */
  id: string;
  inputs: RequestInput[];
  /** مرغ زنده درخواستی (کیلوگرم) */
  desiredKg: number;
  /** تاریخ تحویل هدف ('YYYY/MM/DD' انگلیسی) */
  targetDeliveryDate: string;
  province: string;
  status: SupplierRequestStatus;
  matchedFarmId?: string;
  /** پر شدن آن = قرارداد (کار) از این درخواست ساخته شده است. */
  contractId?: string;
  /** برآورد هزینه ثبت‌شده توسط زنجیره‌دار — برای مشارکت‌کننده شفاف است. */
  estimation?: CostEstimation;
  /** برآورد خودکار ویزارد (سهم بازیگران + تعداد مرغ) — ثبت هنگام ارسال قرارداد */
  participation?: ParticipationSnapshot;
  createdAt: string; // 'YYYY/MM/DD'
}

export const REQUEST_STATUS_LABELS: Record<SupplierRequestStatus, string> = {
  pending: 'در انتظار بررسی',
  matched: 'تطبیق شده',
  in_progress: 'در حال اجرا',
  completed: 'تکمیل شده',
  rejected: 'رد شده',
};

// ── برآورد هزینه و سهم ──

export type EstimationRowOwner = 'supplier' | 'farm' | 'admin';
/** value = مبلغ ثابت (تومان) | percent = درصد از ارزش تولید */
export type EstimationRowKind = 'value' | 'percent';

export interface EstimationRow {
  key: 'feed' | 'chick' | 'cash' | 'logistics' | 'farmFee' | 'adminFee';
  label: string;
  kind: EstimationRowKind;
  /** مبنای محاسبه سهم: ردیف‌های supplier ارزش نهاده مشارکت‌کننده‌اند. */
  owner: EstimationRowOwner;
  /** value → تومان | percent → درصد (0-100) */
  amount: number;
}

export interface CostEstimation {
  /** تخمین تولید مرغ زنده (کیلوگرم) — قابل تنظیم توسط زنجیره‌دار */
  productionKg: number;
  /** productionKg × قیمت بازار مرغ زنده */
  productionValue: number;
  rows: EstimationRow[];
  /** جمع مبالغ همه ردیف‌ها (percent → مبلغ) */
  totalCost: number;
  /** ارزش نهاده‌های مشارکت‌کننده ÷ کل هزینه تولید */
  supplierSharePercent: number;
  /** productionKg × sharePercent */
  supplierShareKg: number;
  version: 1;
}

// ── مشارکت خودکار (ویزارد قرارداد جدید) ──

export type ParticipationBucketKey = 'participant' | 'feed' | 'chick' | 'cash' | 'farm' | 'platform';

export interface ParticipationShares {
  participant: number;
  farm: number;
  platform: number;
}

export interface ParticipationBucket {
  key: ParticipationBucketKey;
  label: string;
  /** سهم از مرغ تولیدی (درصد) — جمع همه سطل‌ها + سهم مشارکت‌کننده = ۱۰۰ */
  percent: number;
  /** معادل تومانی سهم (از ارزش تولید) */
  amountToman: number;
}

/**
 * snapshot برآورد خودکار ویزارد — روی درخواست ذخیره می‌شود تا هم مشارکت‌کننده و هم
 * زنجیره‌دار بعداً همان اعداد را ببینند. additive است و با estimation ادمین تداخل ندارد.
 */
export interface ParticipationSnapshot {
  /** تعداد حدودی مرغ زنده تحویلی */
  estimatedBirds: number;
  /** مرغ زنده درخواستی (کیلوگرم) — گردش‌رفته از وزن مطلوب */
  productionKg: number;
  /** productionKg × قیمت بازار مرغ زنده */
  productionValue: number;
  shares: ParticipationShares;
  buckets: ParticipationBucket[];
}

export const IRAN_PROVINCES = [
  'تهران', 'اصفهان', 'خراسان رضوی', 'فارس', 'آذربایجان شرقی',
  'مازندران', 'البرز', 'خوزستان', 'گیلان', 'کرمان',
  'قم', 'قزوین', 'سمنان', 'یزد', 'همدان', 'کردستان', 'کرمانشاه',
];
