import { createContext, useContext, useReducer, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Farm, ChickSupplier, FeedSupplier, Slaughterhouse, Warehouse } from '@/types';

// ── State ──
export interface ChainWizardState {
  currentStep: number;
  chainName: string;
  selectedFarms: Farm[];
  selectedChickSuppliers: ChickSupplier[];
  selectedFeedSuppliers: FeedSupplier[];
  selectedSlaughterhouses: Slaughterhouse[];
  selectedWarehouses: Warehouse[];
}

const initialState: ChainWizardState = {
  currentStep: 0,
  chainName: '',
  selectedFarms: [],
  selectedChickSuppliers: [],
  selectedFeedSuppliers: [],
  selectedSlaughterhouses: [],
  selectedWarehouses: [],
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
  | { type: 'RESET' };

function toggleItem<T extends { id: string }>(items: T[], item: T): T[] {
  const exists = items.find((i) => i.id === item.id);
  return exists ? items.filter((i) => i.id !== item.id) : [...items, item];
}

function wizardReducer(
  state: ChainWizardState,
  action: WizardAction,
): ChainWizardState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.payload };
    case 'SET_NAME':
      return { ...state, chainName: action.payload };
    case 'TOGGLE_FARM':
      return {
        ...state,
        selectedFarms: toggleItem(state.selectedFarms, action.payload),
      };
    case 'TOGGLE_CHICK_SUPPLIER':
      return {
        ...state,
        selectedChickSuppliers: toggleItem(
          state.selectedChickSuppliers,
          action.payload,
        ),
      };
    case 'TOGGLE_FEED_SUPPLIER':
      return {
        ...state,
        selectedFeedSuppliers: toggleItem(
          state.selectedFeedSuppliers,
          action.payload,
        ),
      };
    case 'TOGGLE_SLAUGHTERHOUSE':
      return {
        ...state,
        selectedSlaughterhouses: toggleItem(
          state.selectedSlaughterhouses,
          action.payload,
        ),
      };
    case 'TOGGLE_WAREHOUSE':
      return {
        ...state,
        selectedWarehouses: toggleItem(
          state.selectedWarehouses,
          action.payload,
        ),
      };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

// ── Context ──
interface WizardContextValue {
  state: ChainWizardState;
  dispatch: React.Dispatch<WizardAction>;
  goNext: () => void;
  goPrev: () => void;
  goToStep: (step: number) => void;
  reset: () => void;
  /** Whether the current step has valid selection(s) */
  canProceed: boolean;
  /** Human-readable reason why can't proceed (empty if can) */
  proceedBlockReason: string;
}

const ChainWizardContext = createContext<WizardContextValue | null>(null);

export function ChainWizardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(wizardReducer, initialState);

  const goNext = useCallback(() => {
    if (state.currentStep < 4) {
      dispatch({ type: 'SET_STEP', payload: state.currentStep + 1 });
    }
  }, [state.currentStep]);

  const goPrev = useCallback(() => {
    if (state.currentStep > 0) {
      dispatch({ type: 'SET_STEP', payload: state.currentStep - 1 });
    }
  }, [state.currentStep]);

  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step <= 4) {
      dispatch({ type: 'SET_STEP', payload: step });
    }
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const { canProceed, proceedBlockReason } = (() => {
    // Step 0 requires chain name + at least one farm
    if (state.currentStep === 0) {
      if (state.chainName.trim().length === 0) {
        return {
          canProceed: false,
          proceedBlockReason: 'لطفاً نام زنجیره را وارد کنید',
        };
      }
      if (state.selectedFarms.length === 0) {
        return {
          canProceed: false,
          proceedBlockReason: 'حداقل یک مزرعه انتخاب کنید',
        };
      }
      return { canProceed: true, proceedBlockReason: '' };
    }
    if (state.currentStep === 1 && state.selectedChickSuppliers.length === 0) {
      return {
        canProceed: false,
        proceedBlockReason: 'حداقل یک تأمین‌کننده جوجه انتخاب کنید',
      };
    }
    if (state.currentStep === 2 && state.selectedFeedSuppliers.length === 0) {
      return {
        canProceed: false,
        proceedBlockReason: 'حداقل یک تأمین‌کننده خوراک انتخاب کنید',
      };
    }
    if (state.currentStep === 3 && state.selectedSlaughterhouses.length === 0) {
      return {
        canProceed: false,
        proceedBlockReason: 'حداقل یک کشتارگاه انتخاب کنید',
      };
    }
    if (state.currentStep === 4 && state.selectedWarehouses.length === 0) {
      return {
        canProceed: false,
        proceedBlockReason: 'حداقل یک انبار انتخاب کنید',
      };
    }
    return { canProceed: true, proceedBlockReason: '' };
  })();

  return (
    <ChainWizardContext.Provider
      value={{
        state,
        dispatch,
        goNext,
        goPrev,
        goToStep,
        reset,
        canProceed,
        proceedBlockReason,
      }}
    >
      {children}
    </ChainWizardContext.Provider>
  );
}

export function useChainWizard(): WizardContextValue {
  const ctx = useContext(ChainWizardContext);
  if (!ctx) {
    throw new Error('useChainWizard must be used within ChainWizardProvider');
  }
  return ctx;
}
