/**
 * فلو پیگیری قرارداد نهایی — ۴ گام ادعا/بازخورد دوطرفه.
 * تاریخ‌های تقویمی (claimedAt/confirmedAt/suppliedAt/pickupDate/earliestPickup)
 * همیشه با ارقام انگلیسی و فرمت 'YYYY/MM/DD' ذخیره می‌شوند (jalaliday ارقام فارسی را
 * parse نمی‌کند)؛ نمایش با toPersianDigits فارسی می‌شود. Event ها صرفاً نمایشی‌اند.
 */

export type ProgressRole = 'supplier' | 'farm';
export type ProgressStepKey = 'supply' | 'pickup' | 'driver' | 'delivery';
export type ProgressStepStatus = 'idle' | 'claimed' | 'rejected' | 'done';

export const PROGRESS_STEPS: { key: ProgressStepKey; label: string }[] = [
  { key: 'supply', label: 'تأمین نهاده و جوجه' },
  { key: 'pickup', label: 'درخواست برداشت مرغ' },
  { key: 'driver', label: 'راننده و خودرو' },
  { key: 'delivery', label: 'تحویل و تأیید نهایی' },
];

/** نقش ادعاکننده و پاسخ‌دهنده هر گام — منبع واحد UI نقش‌محور. */
export const STEP_ROLES: Record<ProgressStepKey, { claimer: ProgressRole; responder: ProgressRole | 'both' }> = {
  supply: { claimer: 'supplier', responder: 'farm' },
  pickup: { claimer: 'supplier', responder: 'farm' },
  driver: { claimer: 'supplier', responder: 'farm' },
  delivery: { claimer: 'supplier', responder: 'both' },
};

export const ROLE_LABELS: Record<ProgressRole, string> = {
  supplier: 'تأمین‌کننده',
  farm: 'مزرعه‌دار',
};

/** حداقل فاصله تأیید برداشت تا مراجعه (روز). */
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
  type: 'claimed' | 'confirmed' | 'rejected' | 'document';
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
  chickenWeight?: number; // کیلوگرم — مزرعه‌دار ثبت می‌کند
  chickenCount?: number;
  /** زودترین تاریخ مجاز مراجعه = تاریخ تأیید برداشت + ۷ روز ('YYYY/MM/DD' انگلیسی). */
  earliestPickup?: string;
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
  /** تاریخ مراجعه — باید ≥ earliestPickup باشد (قانون حداقل ۷ روز). */
  pickupDate: string;
}

export interface DeliveryPayload {
  supplierDocs: UploadedDoc[];
  farmDocs: UploadedDoc[];
  supplierConfirmed: boolean;
  farmConfirmed: boolean;
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
    case 'pickup': return {};
    case 'driver': return { driverName: '', driverPhone: '', plateNumber: '', vehicleType: '', isDriverSupervisor: false, pickupDate: '' };
    case 'delivery': return { supplierDocs: [], farmDocs: [], supplierConfirmed: false, farmConfirmed: false };
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
