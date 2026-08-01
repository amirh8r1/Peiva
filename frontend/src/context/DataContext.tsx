import { createContext, useContext, useReducer, useEffect, type ReactNode, type Dispatch } from 'react';
import type { Contract, FarmProposal, Collateral } from '@/types';

// ── App-level data that persists across role switches ──

export interface AppData {
  contracts: Contract[];
  proposals: FarmProposal[];
  collaterals: Collateral[];
}

const STORAGE_KEY = 'fonoon-app-data';
const VERSION_KEY = 'fonoon-app-version';
const CURRENT_VERSION = 2; // bump when data schema changes

function loadData(): AppData {
  try {
    const storedVersion = localStorage.getItem(VERSION_KEY);
    // Clear stale data from older versions
    if (!storedVersion || Number(storedVersion) < CURRENT_VERSION) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.setItem(VERSION_KEY, String(CURRENT_VERSION));
      return { contracts: [], proposals: [], collaterals: [] };
    }
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { contracts: [], proposals: [], collaterals: [] };
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
  | { type: 'ADD_COLLATERAL'; payload: Collateral };

function reducer(state: AppData, action: DataAction): AppData {
  switch (action.type) {
    case 'ADD_CONTRACT':
      return { ...state, contracts: [...state.contracts, action.payload] };
    case 'UPDATE_CONTRACT_STATUS':
      return {
        ...state,
        contracts: state.contracts.map((c) =>
          c.id === action.payload.id ? { ...c, status: action.payload.status } : c,
        ),
      };
    case 'ADD_PROPOSAL':
      return { ...state, proposals: [...state.proposals, action.payload] };
    case 'UPDATE_PROPOSAL':
      return {
        ...state,
        proposals: state.proposals.map((p) =>
          p.id === action.payload.id ? { ...p, status: action.payload.status } : p,
        ),
      };
    case 'ADD_COLLATERAL':
      return { ...state, collaterals: [...state.collaterals, action.payload] };
    default:
      return state;
  }
}

// ── Context ──

interface DataContextValue {
  data: AppData;
  dispatch: Dispatch<DataAction>;
}

const DataContext = createContext<DataContextValue | null>(null);

const initialData = loadData();

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, dispatch] = useReducer(reducer, initialData);

  // Persist to localStorage on every change
  useEffect(() => {
    saveData(data);
  }, [data]);

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
