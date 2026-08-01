/** Contract entity — between feed supplier and farm owner(s) */
export interface Contract {
  id: string;
  /** نام قرارداد (اختیاری — معمولاً توسط تأمین‌کننده ست میشه) */
  name: string;
  contractType: 'commission' | 'contract';
  /** Selected terms (IDs from TERM_TEMPLATES) */
  selectedTermIds: string[];
  /** Selected profit method (ID from PROFIT_METHODS) */
  profitMethodId: string;
  /** Minimum profit sharing percentage for farm owners */
  profitSharingMin: number;
  status: ContractStatus;
  createdBy: string; // 'supplier'
  createdAt: string;
}

export type ContractStatus =
  | 'draft'
  | 'sent'
  | 'negotiating'
  | 'approved'
  | 'finalized';

/** A farm owner's bid/proposal on a contract */
export interface FarmProposal {
  id: string;
  contractId: string;
  contractName: string;
  farmId: string;
  farmName: string;
  farmGrade: string;
  proposedPercentage: number;
  status: 'pending' | 'accepted' | 'rejected';
  submittedAt: string;
}

export interface Collateral {
  id: string;
  contractId: string;
  farmId: string;
  type: 'cash' | 'check' | 'property' | 'guarantee';
  value?: number;
  status: 'pending' | 'provided' | 'verified';
  submittedAt: string;
}

// ── Pre-written templates ──

export interface TermTemplate {
  id: string;
  label: string;
  description: string;
}

export const TERM_TEMPLATES: TermTemplate[] = [
  { id: 't1', label: 'تأمین ۱۰۰٪ خوراک', description: 'تمام خوراک مورد نیاز دوره توسط تأمین‌کننده فراهم میشود' },
  { id: 't2', label: 'تأمین جوجه یکروزه', description: 'جوجه یکروزه با هزینه تأمین‌کننده خریداری و ارسال میشود' },
  { id: 't3', label: 'حمل به عهده مزرعه‌دار', description: 'هزینه و مسئولیت حمل نهاده و جوجه با مزرعه‌دار است' },
  { id: 't4', label: 'پرداخت پس از فروش', description: 'تسویه حساب پس از فروش مرغ زنده انجام میشود' },
  { id: 't5', label: 'بیمه طیور', description: 'بیمه طیور در برابر تلفات توسط تأمین‌کننده پرداخت میشود' },
  { id: 't6', label: 'خدمات دامپزشکی', description: 'خدمات دامپزشکی و واکسیناسیون توسط مزرعه‌دار انجام میشود' },
];

export interface ProfitMethod {
  id: string;
  label: string;
  description: string;
}

export const PROFIT_METHODS: ProfitMethod[] = [
  { id: 'p1', label: 'تسهیم بر اساس سرمایه‌گذاری', description: 'هر طرف به نسبت سهم و سرمایه‌ای که گذاشته از سود برداشت میکند' },
  { id: 'p2', label: 'تسهیم ریسک‌محور', description: 'طرفی که ریسک بیشتری پذیرفته (مثلاً تأمین‌کننده) سهم بیشتری از سود دارد' },
  { id: 'p3', label: 'تسهیم بلندمدت', description: 'تخفیف درصد برای همکاری‌های بیش از ۳ دوره متوالی' },
  { id: 'p4', label: 'تسهیم عملکردی', description: 'بر اساس ضریب تبدیل و درصد تلفات — مزرعه با عملکرد بهتر، سهم بیشتر' },
];

export const CONTRACT_TYPE_LABELS = {
  commission: 'کارمزدی',
  contract: 'پیمانکاری',
} as const;

export const COLLATERAL_TYPE_LABELS = {
  cash: 'نقدی',
  check: 'چک',
  property: 'سند ملکی',
  guarantee: 'ضمانت‌نامه بانکی',
} as const;
