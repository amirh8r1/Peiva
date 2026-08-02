export interface ContractPeriod {
  index: number;
  chickCount: number;
  targetWeight: number;
  deliveryDate: string;
}

export interface Contract {
  id: string;
  name: string;
  contractType: 'commission' | 'contract';
  selectedTermIds: string[];
  profitMethodId: string;
  profitSharingMin: number;
  /** Contract duration in periods (each period ~45 days) */
  duration: number;
  /** Selected province */
  region: string;
  /** Per-period production specs */
  periods: ContractPeriod[];
  /** Accepted collateral types (IDs from COLLATERAL_TYPE_LIST) */
  acceptedCollateralTypes: string[];
  /** Farm IDs selected by supplier to send notification to */
  selectedFarmIds: string[];
  status: ContractStatus;
  createdBy: string;
  createdAt: string;
}

export type ContractStatus = 'draft' | 'sent' | 'finalized';

export interface FarmProposal {
  id: string;
  contractId: string;
  contractName: string;
  farmId: string;
  farmName: string;
  farmGrade: string;
  status: 'pending' | 'accepted' | 'rejected';
  submittedAt: string;
}

export interface Collateral {
  id: string;
  contractId: string;
  farmId: string;
  type: string;
  value?: number;
  status: 'pending' | 'provided' | 'verified';
  submittedAt: string;
}

// ── Templates ──

export interface TermTemplate { id: string; label: string; description: string; }

export const TERM_TEMPLATES: TermTemplate[] = [
  { id: 't1', label: 'تأمین ۱۰۰٪ خوراک', description: 'تمام خوراک مورد نیاز دوره توسط تأمین‌کننده فراهم میشود' },
  { id: 't2', label: 'تأمین جوجه یکروزه', description: 'جوجه یکروزه با هزینه تأمین‌کننده خریداری و ارسال میشود' },
  { id: 't3', label: 'حمل به عهده مزرعه‌دار', description: 'هزینه حمل با مزرعه‌دار است' },
  { id: 't4', label: 'پرداخت پس از فروش', description: 'تسویه پس از فروش مرغ زنده' },
  { id: 't5', label: 'بیمه طیور', description: 'بیمه تلفات توسط تأمین‌کننده' },
  { id: 't6', label: 'خدمات دامپزشکی', description: 'واکسیناسیون توسط مزرعه‌دار' },
];

export interface ProfitMethod { id: string; label: string; description: string; }

export const PROFIT_METHODS: ProfitMethod[] = [
  { id: 'p1', label: 'تسهیم بر اساس سرمایه‌گذاری', description: 'هر طرف به نسبت سهم خود از سود برداشت میکند' },
  { id: 'p2', label: 'تسهیم ریسک‌محور', description: 'طرفی که ریسک بیشتری پذیرفته سهم بیشتری دارد' },
  { id: 'p3', label: 'تسهیم بلندمدت', description: 'تخفیف درصد برای همکاری‌های بیش از ۳ دوره' },
  { id: 'p4', label: 'تسهیم عملکردی', description: 'بر اساس ضریب تبدیل و درصد تلفات' },
];

export interface CollateralType { id: string; label: string; icon: string; }

export const COLLATERAL_TYPE_LIST: CollateralType[] = [
  { id: 'cash', label: 'نقدی', icon: '💵' },
  { id: 'check', label: 'چک', icon: '📝' },
  { id: 'property', label: 'سند ملکی', icon: '🏠' },
  { id: 'guarantee', label: 'ضمانت‌نامه بانکی', icon: '🏦' },
];

export const CONTRACT_TYPE_LABELS = { commission: 'کارمزدی', contract: 'پیمانکاری' } as const;

export const IRAN_PROVINCES = [
  'تهران', 'اصفهان', 'خراسان رضوی', 'فارس', 'آذربایجان شرقی',
  'مازندران', 'البرز', 'خوزستان', 'گیلان', 'کرمان',
  'قم', 'قزوین', 'سمنان', 'یزد', 'همدان', 'کردستان', 'کرمانشاه',
];
