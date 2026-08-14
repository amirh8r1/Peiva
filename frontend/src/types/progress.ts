/**
 * فلو پیگیری قرارداد نهایی — ۴ گام.
 * نقش‌ها: supply/pickup ادعای تأمین‌کننده + پاسخ مزرعه‌دار؛ driver اعلام صرف تأمین‌کننده
 * (مزرعه‌دار فقط نوتیف می‌گیرد)؛ delivery ادعای مزرعه‌دار + تأیید تأمین‌کننده.
 * تاریخ‌های تقویمی (claimedAt/confirmedAt/suppliedAt/pickupDate/requestedAt/answeredAt)
 * همیشه با ارقام انگلیسی و فرمت 'YYYY/MM/DD' ذخیره می‌شوند (jalaliday ارقام فارسی را
 * parse نمی‌کند)؛ نمایش با toPersianDigits فارسی می‌شود. Event ها صرفاً نمایشی‌اند.
 */

export type ProgressRole = 'supplier' | 'farm';
export type ProgressStepKey = 'supply' | 'pickup' | 'driver' | 'delivery';
export type ProgressStepStatus = 'idle' | 'claimed' | 'rejected' | 'done';

export const PROGRESS_STEPS: { key: ProgressStepKey; label: string }[] = [
  { key: 'supply', label: 'تحویل نهاده و جوجه' },
  { key: 'pickup', label: 'درخواست برداشت مرغ زنده' },
  { key: 'driver', label: 'اعلام مشخصات دریافت‌کننده' },
  { key: 'delivery', label: 'تحویل و تأیید نهایی' },
];

/** نقش ثبت‌کننده و پاسخ‌دهنده هر گام — منبع واحد UI نقش‌محور. */
export const STEP_ROLES: Record<ProgressStepKey, { claimer: ProgressRole; responder: ProgressRole | 'both' | null }> = {
  supply: { claimer: 'supplier', responder: 'farm' },
  pickup: { claimer: 'supplier', responder: 'farm' },
  /** اعلام صرف — مزرعه‌دار اقدامی ندارد، فقط نوتیف می‌گیرد. */
  driver: { claimer: 'supplier', responder: null },
  delivery: { claimer: 'farm', responder: 'supplier' },
};

export const ROLE_LABELS: Record<ProgressRole, string> = {
  supplier: 'تأمین‌کننده',
  farm: 'مزرعه‌دار',
};

/** فاصله پیشنهادی درخواست برداشت تا تاریخ بارگیری (روز) — هشدار نرم، نه قانون سخت. */
export const PICKUP_MIN_WAIT_DAYS = 7;

export function getProgressStepIndex(key: ProgressStepKey): number {
  return PROGRESS_STEPS.findIndex((s) => s.key === key);
}

// ── Audit log ──

export interface ProgressEvent {
  id: string;
  /** تاریخ نمایشی fa-IR (کانونشن timestamps اپ) — فقط برای نمایش، هرگز parse نشود. */
  at: string;
  by: ProgressRole;
  type: 'claimed' | 'confirmed' | 'rejected' | 'document' | 'announced' | 'updated';
  note?: string;
}

// ── اسناد تحویل ──

export interface UploadedDoc {
  id: string;
  name: string; // sanitized basename
  size: number; // bytes
  type: string; // MIME
  uploadedBy: ProgressRole;
  uploadedAt: string; // fa-IR
}

// ── پیلود هر گام ──

export interface SupplyPayload {
  chickCount: number;
  feedAmount: number; // کیلوگرم
  suppliedAt: string; // 'YYYY/MM/DD' انگلیسی
}

export interface PickupPayload {
  /** تاریخ بارگیری پیشنهادی تأمین‌کننده ('YYYY/MM/DD' انگلیسی). راهنمای نرم: ~۷ روز بعد از درخواست. */
  pickupDate: string;
}

export interface DriverPayload {
  driverName: string;
  driverPhone: string;
  plateNumber: string;
  vehicleType: string;
  supervisorName?: string;
  supervisorPhone?: string;
  /** وقتی true، ناظر همان راننده است و فیلدهای ناظر حذف می‌شوند. */
  isDriverSupervisor: boolean;
  /** تاریخ بارگیری مرغ زنده — مشخصات باید ~۲۴ ساعت قبل اعلام شود. */
  pickupDate: string;
}

export interface DeliveryPayload {
  /** تعداد مرغ تحویلی (قطعه) — مزرعه‌دار ثبت می‌کند. */
  chickenCount: number;
  /** وزن کل تحویلی (کیلوگرم) — مزرعه‌دار ثبت می‌کند. */
  totalWeight: number;
  /** اسناد مزرعه‌دار (وزن‌کشی/باسکول و...) */
  farmDocs: UploadedDoc[];
  /** تأیید تأمین‌کننده — با ثبت آن گام done می‌شود. */
  supplierConfirmed: boolean;
}

// ── درخواست اعلام وزن (فلو مستقل، غیرگامی، چندباره) ──

export interface WeightRequestAnswer {
  /** میانگین وزن هر مرغ (کیلوگرم) */
  avgWeight: number;
  /** تعداد برآوردی مرغ (قطعه) */
  estimatedCount: number;
  note?: string;
  answeredBy: ProgressRole;
  answeredAt: string; // 'YYYY/MM/DD' انگلیسی
}

export interface WeightRequest {
  id: string; // wr-{ts}-{rand} — یکتا
  contractId: string;
  requestedBy: ProgressRole;
  requestedAt: string; // 'YYYY/MM/DD' انگلیسی
  status: 'pending' | 'answered';
  answer?: WeightRequestAnswer;
  /** زمان مشاهده پاسخ توسط تأمین‌کننده (fa-IR نمایشی) — تا وقتی نباشد، نوتیف پاسخ باز می‌ماند. */
  seenAt?: string;
}

// ── گام (union تمایزیافته روی key) ──

interface ProgressStepBase {
  /** قطعی: `${key}-${contractId}` — منحصربه‌فرد و idempotent برای UPSERT. */
  id: string;
  contractId: string;
  key: ProgressStepKey;
  status: ProgressStepStatus;
  claimedBy?: ProgressRole;
  claimedAt?: string; // 'YYYY/MM/DD'
  confirmedAt?: string; // 'YYYY/MM/DD'
  rejectedNote?: string;
  events: ProgressEvent[];
}

export type ContractProgressStep =
  | (ProgressStepBase & { key: 'supply'; payload: SupplyPayload })
  | (ProgressStepBase & { key: 'pickup'; payload: PickupPayload })
  | (ProgressStepBase & { key: 'driver'; payload: DriverPayload })
  | (ProgressStepBase & { key: 'delivery'; payload: DeliveryPayload });

/** پیلود اولیه هر گام بر اساس نوعش. */
function initialPayload(key: ProgressStepKey): ContractProgressStep['payload'] {
  switch (key) {
    case 'supply': return { chickCount: 0, feedAmount: 0, suppliedAt: '' };
    case 'pickup': return { pickupDate: '' };
    case 'driver': return { driverName: '', driverPhone: '', plateNumber: '', vehicleType: '', isDriverSupervisor: false, pickupDate: '' };
    case 'delivery': return { chickenCount: 0, totalWeight: 0, farmDocs: [], supplierConfirmed: false };
  }
}

/** ۴ گام idle با id قطعی — در reducer هنگام نهایی شدن قرارداد و lazy-ensure صفحه استفاده می‌شود. */
export function makeInitialSteps(contractId: string): ContractProgressStep[] {
  return PROGRESS_STEPS.map(({ key }) => ({
    id: `${key}-${contractId}`,
    contractId,
    key,
    status: 'idle',
    events: [],
    payload: initialPayload(key),
  })) as ContractProgressStep[];
}

export function isProgressComplete(steps: ContractProgressStep[]): boolean {
  return steps.length === PROGRESS_STEPS.length && steps.every((s) => s.status === 'done');
}
