import { createContext, useContext, useReducer, useEffect, type ReactNode, type Dispatch } from 'react';
import type { Contract, FarmProposal, Collateral, ContractProgressStep, WeightRequest } from '@/types';
import { makeInitialSteps } from '@/types';

export interface AppData {
  contracts: Contract[];
  proposals: FarmProposal[];
  collaterals: Collateral[];
  progressSteps: ContractProgressStep[];
  weightRequests: WeightRequest[];
}

const STORAGE_KEY = 'fonoon-app-data';
const VERSION_KEY = 'fonoon-app-version';
const CURRENT_VERSION = 6;

/** حالت خام — بدون هیچ داده‌ای (دموی خودکار حذف شد تا کاربر از صفر شروع کند). */
const EMPTY_DATA: AppData = { contracts: [], proposals: [], collaterals: [], progressSteps: [], weightRequests: [] };

function loadData(): AppData {
  try {
    const v = localStorage.getItem(VERSION_KEY);
    if (!v || Number(v) < CURRENT_VERSION) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.setItem(VERSION_KEY, String(CURRENT_VERSION));
      return EMPTY_DATA;
    }
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      // پیش‌فرض‌ها تا داده‌های قدیمی بدون کلیدهای جدید هم سالم لود شوند
      return { ...EMPTY_DATA, ...JSON.parse(raw) };
    }
  } catch { /* ignore */ }
  return EMPTY_DATA;
}

function saveData(data: AppData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// ── Actions ──

export type DataAction =
  | { type: 'ADD_CONTRACT'; payload: Contract }
  | { type: 'UPDATE_CONTRACT_STATUS'; payload: { id: string; status: Contract['status'] } }
  | { type: 'ADD_PROPOSAL'; payload: FarmProposal }
  | { type: 'UPDATE_PROPOSAL'; payload: { id: string; status: FarmProposal['status'] } }
  | { type: 'ADD_COLLATERAL'; payload: Collateral }
  | { type: 'UPSERT_PROGRESS_STEP'; payload: ContractProgressStep }
  | { type: 'ADD_WEIGHT_REQUEST'; payload: WeightRequest }
  | { type: 'ANSWER_WEIGHT_REQUEST'; payload: { id: string; answer: NonNullable<WeightRequest['answer']> } }
  | { type: 'MARK_WEIGHT_REQUESTS_SEEN'; payload: { contractId: string; seenAt: string } }
  | { type: 'SYNC'; payload: AppData };

/** ادغام events با dedupe روی id تا تاریخچه ادعا/رد/تأیید مجدد حفظ شود. */
function mergeEvents(current: ContractProgressStep['events'], next: ContractProgressStep['events']) {
  const seen = new Set(current.map((e) => e.id));
  const extra = next.filter((e) => !seen.has(e.id));
  return [...current, ...extra];
}

function reducer(state: AppData, action: DataAction): AppData {
  switch (action.type) {
    case 'ADD_CONTRACT': return { ...state, contracts: [...state.contracts, action.payload] };
    case 'UPDATE_CONTRACT_STATUS': {
      const contracts = state.contracts.map((c) => c.id === action.payload.id ? { ...c, status: action.payload.status } : c);
      // نهایی شدن قرارداد → ساخت گام‌های idle (idempotent)
      if (action.payload.status === 'finalized') {
        const missing = makeInitialSteps(action.payload.id)
          .filter((s) => !state.progressSteps.some((e) => e.id === s.id));
        return missing.length
          ? { ...state, contracts, progressSteps: [...state.progressSteps, ...missing] }
          : { ...state, contracts };
      }
      return { ...state, contracts };
    }
    case 'ADD_PROPOSAL': return { ...state, proposals: [...state.proposals, action.payload] };
    case 'UPDATE_PROPOSAL':
      return { ...state, proposals: state.proposals.map((p) => p.id === action.payload.id ? { ...p, status: action.payload.status } : p) };
    case 'ADD_COLLATERAL': return { ...state, collaterals: [...state.collaterals, action.payload] };
    case 'UPSERT_PROGRESS_STEP': {
      const exists = state.progressSteps.some((s) => s.id === action.payload.id);
      if (!exists) return { ...state, progressSteps: [...state.progressSteps, action.payload] };
      return {
        ...state,
        progressSteps: state.progressSteps.map((s) => s.id === action.payload.id
          ? { ...s, ...action.payload, events: mergeEvents(s.events, action.payload.events) }
          : s),
      };
    }
    case 'ADD_WEIGHT_REQUEST': return { ...state, weightRequests: [...state.weightRequests, action.payload] };
    case 'ANSWER_WEIGHT_REQUEST':
      // idempotent — فقط درخواست‌های pending پاسخ می‌گیرند
      return {
        ...state,
        weightRequests: state.weightRequests.map((r) => r.id === action.payload.id && r.status === 'pending'
          ? { ...r, status: 'answered', answer: action.payload.answer }
          : r),
      };
    case 'MARK_WEIGHT_REQUESTS_SEEN':
      // idempotent — پاسخ‌های answered و دیده‌نشده قرارداد، دیده‌شده علامت می‌خورند
      return {
        ...state,
        weightRequests: state.weightRequests.map((r) =>
          r.contractId === action.payload.contractId && r.status === 'answered' && !r.seenAt
            ? { ...r, seenAt: action.payload.seenAt }
            : r),
      };
    case 'SYNC': return action.payload;
    default: return state;
  }
}

// ── Context ──

interface DataContextValue { data: AppData; dispatch: Dispatch<DataAction>; }

const DataContext = createContext<DataContextValue | null>(null);
const initialData = loadData();

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, dispatch] = useReducer(reducer, initialData);

  // Persist to localStorage
  useEffect(() => { saveData(data); }, [data]);

  // Cross-tab sync
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try { dispatch({ type: 'SYNC', payload: JSON.parse(e.newValue) }); } catch { /* */ }
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  return (
    <DataContext.Provider value={{ data, dispatch }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
