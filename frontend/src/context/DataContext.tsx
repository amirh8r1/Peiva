import { createContext, useContext, useReducer, useEffect, type ReactNode, type Dispatch } from 'react';
import type { Contract, FarmProposal, Collateral, ContractProgressStep } from '@/types';
import { makeInitialSteps } from '@/types';
import { seedDemoData } from '@/mocks/seed';

export interface AppData {
  contracts: Contract[];
  proposals: FarmProposal[];
  collaterals: Collateral[];
  progressSteps: ContractProgressStep[];
}

const STORAGE_KEY = 'fonoon-app-data';
const VERSION_KEY = 'fonoon-app-version';
const CURRENT_VERSION = 4;

function loadData(): AppData {
  try {
    const v = localStorage.getItem(VERSION_KEY);
    if (!v || Number(v) < CURRENT_VERSION) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.setItem(VERSION_KEY, String(CURRENT_VERSION));
      // داده دمو تا فلو پیگیری بدون طی کل مسیر قابل بازبینی باشد
      return seedDemoData();
    }
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      // پیش‌فرض‌ها تا داده‌های قدیمی بدون کلیدهای جدید هم سالم لود شوند
      return { contracts: [], proposals: [], collaterals: [], progressSteps: [], ...JSON.parse(raw) };
    }
  } catch { /* ignore */ }
  return { contracts: [], proposals: [], collaterals: [], progressSteps: [] };
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
