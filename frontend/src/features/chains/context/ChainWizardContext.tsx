import { createContext, useContext, useReducer, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Contract } from '@/types';

// ── State (only 4 steps for contract creation) ──

export interface ChainWizardState {
  currentStep: number; // 0-3
  contractName: string;
  contractType: Contract['contractType'];
  selectedTermIds: string[];
  profitMethodId: string;
  profitSharingMin: number;
}

const initialState: ChainWizardState = {
  currentStep: 0,
  contractName: '',
  contractType: 'commission',
  selectedTermIds: [],
  profitMethodId: 'p1',
  profitSharingMin: 30,
};

const TOTAL_STEPS = 4;

// ── Actions ──

type WizardAction =
  | { type: 'SET_STEP'; payload: number }
  | { type: 'SET_NAME'; payload: string }
  | { type: 'SET_CONTRACT_TYPE'; payload: Contract['contractType'] }
  | { type: 'TOGGLE_TERM'; payload: string }
  | { type: 'SET_PROFIT_METHOD'; payload: string }
  | { type: 'SET_PROFIT_SHARING'; payload: number }
  | { type: 'RESET' };

function wizardReducer(state: ChainWizardState, action: WizardAction): ChainWizardState {
  switch (action.type) {
    case 'SET_STEP': return { ...state, currentStep: action.payload };
    case 'SET_NAME': return { ...state, contractName: action.payload };
    case 'SET_CONTRACT_TYPE': return { ...state, contractType: action.payload };
    case 'TOGGLE_TERM': {
      const exists = state.selectedTermIds.includes(action.payload);
      return {
        ...state,
        selectedTermIds: exists
          ? state.selectedTermIds.filter((id) => id !== action.payload)
          : [...state.selectedTermIds, action.payload],
      };
    }
    case 'SET_PROFIT_METHOD': return { ...state, profitMethodId: action.payload };
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
    switch (state.currentStep) {
      case 0: return { canProceed: true, proceedBlockReason: '' }; // type always selected
      case 1: return { canProceed: state.selectedTermIds.length > 0, proceedBlockReason: state.selectedTermIds.length === 0 ? 'حداقل یک شرط انتخاب کنید' : '' };
      case 2: return { canProceed: !!state.profitMethodId, proceedBlockReason: '' };
      default: return { canProceed: true, proceedBlockReason: '' };
    }
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
