import { createContext, useContext, useReducer, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Farm, ChickSupplier, FeedSupplier, Slaughterhouse, Warehouse } from '@/types';
import type { Contract } from '@/types';
import { TOTAL_STEPS } from '@/types';

// ── State ──
export interface ChainWizardState {
  currentStep: number;
  chainName: string;
  selectedFarms: Farm[];
  selectedChickSuppliers: ChickSupplier[];
  selectedFeedSuppliers: FeedSupplier[];
  selectedSlaughterhouses: Slaughterhouse[];
  selectedWarehouses: Warehouse[];
  contractType: Contract['contractType'];
  contractTerms: string;
  profitSharingMin: number;
}

const initialState: ChainWizardState = {
  currentStep: 0,
  chainName: '',
  selectedFarms: [],
  selectedChickSuppliers: [],
  selectedFeedSuppliers: [],
  selectedSlaughterhouses: [],
  selectedWarehouses: [],
  contractType: 'commission',
  contractTerms: '',
  profitSharingMin: 30,
};

// ── Actions ──
type WizardAction =
  | { type: 'SET_STEP'; payload: number }
  | { type: 'SET_NAME'; payload: string }
  | { type: 'TOGGLE_FARM'; payload: Farm }
  | { type: 'TOGGLE_CHICK_SUPPLIER'; payload: ChickSupplier }
  | { type: 'TOGGLE_FEED_SUPPLIER'; payload: FeedSupplier }
  | { type: 'TOGGLE_SLAUGHTERHOUSE'; payload: Slaughterhouse }
  | { type: 'TOGGLE_WAREHOUSE'; payload: Warehouse }
  | { type: 'SET_CONTRACT_TYPE'; payload: Contract['contractType'] }
  | { type: 'SET_CONTRACT_TERMS'; payload: string }
  | { type: 'SET_PROFIT_SHARING'; payload: number }
  | { type: 'RESET' };

function toggleItem<T extends { id: string }>(items: T[], item: T): T[] {
  const exists = items.find((i) => i.id === item.id);
  return exists ? items.filter((i) => i.id !== item.id) : [...items, item];
}

function wizardReducer(state: ChainWizardState, action: WizardAction): ChainWizardState {
  switch (action.type) {
    case 'SET_STEP': return { ...state, currentStep: action.payload };
    case 'SET_NAME': return { ...state, chainName: action.payload };
    case 'TOGGLE_FARM': return { ...state, selectedFarms: toggleItem(state.selectedFarms, action.payload) };
    case 'TOGGLE_CHICK_SUPPLIER': return { ...state, selectedChickSuppliers: toggleItem(state.selectedChickSuppliers, action.payload) };
    case 'TOGGLE_FEED_SUPPLIER': return { ...state, selectedFeedSuppliers: toggleItem(state.selectedFeedSuppliers, action.payload) };
    case 'TOGGLE_SLAUGHTERHOUSE': return { ...state, selectedSlaughterhouses: toggleItem(state.selectedSlaughterhouses, action.payload) };
    case 'TOGGLE_WAREHOUSE': return { ...state, selectedWarehouses: toggleItem(state.selectedWarehouses, action.payload) };
    case 'SET_CONTRACT_TYPE': return { ...state, contractType: action.payload };
    case 'SET_CONTRACT_TERMS': return { ...state, contractTerms: action.payload };
    case 'SET_PROFIT_SHARING': return { ...state, profitSharingMin: action.payload };
    case 'RESET': return initialState;
    default: return state;
  }
}

// ── Context ──
interface WizardContextValue {
  state: ChainWizardState;
  dispatch: React.Dispatch<WizardAction>;
  goNext: () => void;
  goPrev: () => void;
  canProceed: boolean;
  proceedBlockReason: string;
}

const ChainWizardContext = createContext<WizardContextValue | null>(null);

export function ChainWizardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(wizardReducer, initialState);

  const goNext = useCallback(() => {
    if (state.currentStep < TOTAL_STEPS - 1) {
      dispatch({ type: 'SET_STEP', payload: state.currentStep + 1 });
    }
  }, [state.currentStep]);

  const goPrev = useCallback(() => {
    if (state.currentStep > 0) {
      dispatch({ type: 'SET_STEP', payload: state.currentStep - 1 });
    }
  }, [state.currentStep]);

  const { canProceed, proceedBlockReason } = (() => {
    const s = state;
    switch (s.currentStep) {
      case 0:
        if (!s.chainName.trim()) return { canProceed: false, proceedBlockReason: 'نام زنجیره را وارد کنید' };
        if (s.selectedFarms.length === 0) return { canProceed: false, proceedBlockReason: 'حداقل یک مزرعه انتخاب کنید' };
        break;
      case 1:
        if (s.selectedChickSuppliers.length === 0) return { canProceed: false, proceedBlockReason: 'حداقل یک تأمین‌کننده جوجه انتخاب کنید' };
        break;
      case 2:
        if (s.selectedFeedSuppliers.length === 0) return { canProceed: false, proceedBlockReason: 'حداقل یک تأمین‌کننده خوراک انتخاب کنید' };
        break;
      case 3:
        if (s.selectedSlaughterhouses.length === 0) return { canProceed: false, proceedBlockReason: 'حداقل یک کشتارگاه انتخاب کنید' };
        break;
      case 4:
        if (s.selectedWarehouses.length === 0) return { canProceed: false, proceedBlockReason: 'حداقل یک انبار انتخاب کنید' };
        break;
      case 6:
        if (!s.contractTerms.trim()) return { canProceed: false, proceedBlockReason: 'شرایط قرارداد را وارد کنید' };
        break;
    }
    return { canProceed: true, proceedBlockReason: '' };
  })();

  return (
    <ChainWizardContext.Provider value={{ state, dispatch, goNext, goPrev, canProceed, proceedBlockReason }}>
      {children}
    </ChainWizardContext.Provider>
  );
}

export function useChainWizard(): WizardContextValue {
  const ctx = useContext(ChainWizardContext);
  if (!ctx) throw new Error('useChainWizard must be used within ChainWizardProvider');
  return ctx;
}
