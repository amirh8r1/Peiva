import { mockContracts, mockProposals } from './contracts';
import type { Contract, ContractProgressStep } from '@/types';
import type { AppData } from '@/context/DataContext';

/**
 * داده دمو برای بازبینی فلو پیگیری — وقتی localStorage خالی/منسوخ است seed می‌شود.
 * دو قرارداد نمونه با گام‌های مختلط تا هر دو نقش بلافاصله آیتم قابل اقدام داشته باشند
 * (گیتینگ ترتیبی اجازه نمی‌دهد یک قرارداد دو گام فعال داشته باشد).
 * تاریخ‌های تقویمی با ارقام انگلیسی 'YYYY/MM/DD' (قانون ذخیره‌سازی).
 */

const demoContract1: Contract = {
  id: 'ctr-demo-1',
  name: 'قرارداد نمونه ۱ — بهار ۱۴۰۵',
  contractType: 'contract',
  selectedTermIds: ['t1', 't2', 't4'],
  profitMethodId: 'p1',
  profitSharingMin: 30,
  duration: 2,
  region: 'تهران',
  periods: [{ index: 0, chickCount: 20000, targetWeight: 2500, deliveryDate: '1405/05/10' }],
  acceptedCollateralTypes: ['cash', 'check'],
  selectedFarmIds: ['farm-1'],
  status: 'finalized',
  createdBy: 'supplier',
  createdAt: '۱۴۰۴/۰۲/۱۰',
};

const demoContract2: Contract = {
  ...demoContract1,
  id: 'ctr-demo-2',
  name: 'قرارداد نمونه ۲ — بهار ۱۴۰۵',
  createdAt: '۱۴۰۴/۰۳/۰۵',
};

// supply done → pickup done (earliestPickup=تأیید+۷) → driver rejected → delivery قفل
const demo1Steps: ContractProgressStep[] = [
  {
    id: 'supply-ctr-demo-1', contractId: 'ctr-demo-1', key: 'supply', status: 'done',
    claimedBy: 'supplier', claimedAt: '1405/05/10', confirmedAt: '1405/05/12',
    payload: { chickCount: 20000, feedAmount: 12000, suppliedAt: '1405/05/11' },
    events: [
      { id: 'evt-demo-1-1', at: '۱۴۰۴/۵/۱۰', by: 'supplier', type: 'claimed' },
      { id: 'evt-demo-1-2', at: '۱۴۰۴/۵/۱۲', by: 'farm', type: 'confirmed' },
    ],
  },
  {
    id: 'pickup-ctr-demo-1', contractId: 'ctr-demo-1', key: 'pickup', status: 'done',
    claimedBy: 'supplier', claimedAt: '1405/05/15', confirmedAt: '1405/05/18',
    payload: { chickenWeight: 52000, chickenCount: 20000, earliestPickup: '1405/05/25' },
    events: [
      { id: 'evt-demo-1-3', at: '۱۴۰۴/۵/۱۵', by: 'supplier', type: 'claimed' },
      { id: 'evt-demo-1-4', at: '۱۴۰۴/۵/۱۸', by: 'farm', type: 'confirmed' },
    ],
  },
  {
    id: 'driver-ctr-demo-1', contractId: 'ctr-demo-1', key: 'driver', status: 'rejected',
    claimedBy: 'supplier', claimedAt: '1405/05/19',
    rejectedNote: 'پلاک خودرو نامعتبر ثبت شده است؛ لطفاً مشخصات را اصلاح و دوباره ارسال کنید.',
    payload: {
      driverName: 'رضا محمدی', driverPhone: '09121234567', plateNumber: '۱۲ب۳۴۵-۶۷',
      vehicleType: 'کامیونت', isDriverSupervisor: true, pickupDate: '1405/05/27',
    },
    events: [
      { id: 'evt-demo-1-5', at: '۱۴۰۴/۵/۱۹', by: 'supplier', type: 'claimed' },
      { id: 'evt-demo-1-6', at: '۱۴۰۴/۵/۱۹', by: 'farm', type: 'rejected', note: 'پلاک خودرو نامعتبر ثبت شده است' },
    ],
  },
  {
    id: 'delivery-ctr-demo-1', contractId: 'ctr-demo-1', key: 'delivery', status: 'idle',
    payload: { supplierDocs: [], farmDocs: [], supplierConfirmed: false, farmConfirmed: false },
    events: [],
  },
];

// supply done → pickup claimed (منتظر وزن/تعداد و تأیید مزرعه‌دار)
const demo2Steps: ContractProgressStep[] = [
  {
    id: 'supply-ctr-demo-2', contractId: 'ctr-demo-2', key: 'supply', status: 'done',
    claimedBy: 'supplier', claimedAt: '1405/05/08', confirmedAt: '1405/05/10',
    payload: { chickCount: 15000, feedAmount: 9000, suppliedAt: '1405/05/09' },
    events: [
      { id: 'evt-demo-2-1', at: '۱۴۰۴/۵/۸', by: 'supplier', type: 'claimed' },
      { id: 'evt-demo-2-2', at: '۱۴۰۴/۵/۱۰', by: 'farm', type: 'confirmed' },
    ],
  },
  {
    id: 'pickup-ctr-demo-2', contractId: 'ctr-demo-2', key: 'pickup', status: 'claimed',
    claimedBy: 'supplier', claimedAt: '1405/05/20',
    payload: {},
    events: [
      { id: 'evt-demo-2-3', at: '۱۴۰۴/۵/۲۰', by: 'supplier', type: 'claimed' },
    ],
  },
  {
    id: 'driver-ctr-demo-2', contractId: 'ctr-demo-2', key: 'driver', status: 'idle',
    payload: { driverName: '', driverPhone: '', plateNumber: '', vehicleType: '', isDriverSupervisor: false, pickupDate: '' },
    events: [],
  },
  {
    id: 'delivery-ctr-demo-2', contractId: 'ctr-demo-2', key: 'delivery', status: 'idle',
    payload: { supplierDocs: [], farmDocs: [], supplierConfirmed: false, farmConfirmed: false },
    events: [],
  },
];

export function seedDemoData(): AppData {
  return {
    contracts: [...mockContracts, demoContract1, demoContract2],
    proposals: mockProposals,
    collaterals: [],
    progressSteps: [...demo1Steps, ...demo2Steps],
  };
}
