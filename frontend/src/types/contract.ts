import type { CostEstimation } from './request';

/**
 * قرارداد (کار) — مدل زنجیره‌دار v3.
 * زنجیره‌دار از روی درخواست تأمین‌کننده قرارداد می‌سازد و مزرعه انتخاب‌شده را مشخص می‌کند؛
 * با تأیید هماهنگی مزرعه‌دار قرارداد نهایی و وارد فلو ۴ گامی اجرا می‌شود.
 */
export type ContractStatus = 'awaiting_farm' | 'finalized' | 'completed' | 'cancelled';

export interface Contract {
  /** قطعی: `ctr-{ts}-{rand}` — یکتا */
  id: string;
  name: string;
  requestId: string;
  farmId: string;
  /** نام مزرعه denormalized — کارت‌ها بدون lookup mockFarms نمایش می‌دهند. */
  farmName: string;
  province: string;
  /** تاریخ تحویل هدف ('YYYY/MM/DD' انگلیسی) */
  targetDeliveryDate: string;
  /** snapshot برآورد هزینه زمان ایجاد — منبع شفافیت سهم تأمین‌کننده */
  estimation: CostEstimation;
  status: ContractStatus;
  createdAt: string; // 'YYYY/MM/DD'
  /** لحظه تأیید هماهنگی مزرعه‌دار ('YYYY/MM/DD') */
  finalizedAt?: string;
}

export const CONTRACT_STATUS_LABELS: Record<ContractStatus, string> = {
  awaiting_farm: 'در انتظار تأیید مزرعه',
  finalized: 'در جریان',
  completed: 'تکمیل شده',
  cancelled: 'لغو شده',
};

/** رنگ Tag وضعیت از preset های antd (توکن‌محور — بدون hex). */
export const CONTRACT_STATUS_COLORS: Record<ContractStatus, string> = {
  awaiting_farm: 'gold',
  finalized: 'processing',
  completed: 'success',
  cancelled: 'default',
};
