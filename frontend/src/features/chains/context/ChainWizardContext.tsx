import { createContext, useContext, useReducer, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Contract, ContractPeriod } from '@/types';

export interface ChainWizardState {
  currentStep: number;
  contractName: string;
  duration: number;
  region: string;
  periods: ContractPeriod[];
  contractType: Contract['contractType'];
  selectedTermIds: string[];
  profitMethodId: string;
  profitSharingMin: number;
  acceptedCollateralTypes: string[];
  selectedFarmIds: string[];
}

const initialState: ChainWizardState = {
  currentStep: 0,
  contractName: '',
  duration: 0,
  region: '',
  periods: [],
  contractType: 'commission',
  selectedTermIds: [],
  profitMethodId: 'p1',
  profitSharingMin: 10,
  acceptedCollateralTypes: [],
  selectedFarmIds: [],
};

// Steps: 0=name+duration+region, 1..N=periods, N+1=contractType, N+2=terms, N+3=profit, N+4=collateralTypes, N+5=farms

function totalSteps(s: ChainWizardState) {
  // step 0: name/duration/region, then periods, then 4 contract steps, then farms
  return 1 + s.duration + 4 + 1;
}

function currentTotalSteps(s: ChainWizardState) { return totalSteps(s); }
function isPeriodStep(s: ChainWizardState) { return s.currentStep >= 1 && s.currentStep <= s.duration; }
function periodIndex(s: ChainWizardState) { return s.currentStep - 1; }
function contractStepOffset(s: ChainWizardState) { return 1 + s.duration; }
function isLast(s: ChainWizardState) { return s.currentStep === totalSteps(s) - 1; }

type WizardAction =
  | { type: 'SET_STEP'; payload: number }
  | { type: 'SET_NAME'; payload: string }
  | { type: 'SET_DURATION'; payload: number }
  | { type: 'SET_REGION'; payload: string }
  | { type: 'SET_PERIOD'; payload: { index: number; data: Partial<ContractPeriod> } }
  | { type: 'SET_CONTRACT_TYPE'; payload: Contract['contractType'] }
  | { type: 'TOGGLE_TERM'; payload: string }
  | { type: 'SET_PROFIT_METHOD'; payload: string }
  | { type: 'SET_PROFIT_SHARING'; payload: number }
  | { type: 'TOGGLE_COLLATERAL_TYPE'; payload: string }
  | { type: 'TOGGLE_FARM'; payload: string }
  | { type: 'RESET' };

function wizardReducer(state: ChainWizardState, action: WizardAction): ChainWizardState {
  switch (action.type) {
    case 'SET_STEP': return { ...state, currentStep: action.payload };
    case 'SET_NAME': return { ...state, contractName: action.payload };
    case 'SET_DURATION': {
      const d = action.payload ?? 0;
      const periods = Array.from({ length: d }, (_, i) => state.periods[i] || { index: i, chickCount: 0, targetWeight: 0, deliveryDate: '' });
      return { ...state, duration: d, periods };
    }
    case 'SET_REGION': return { ...state, region: action.payload };
    case 'SET_PERIOD': {
      const periods = [...state.periods];
      periods[action.payload.index] = { ...periods[action.payload.index], ...action.payload.data };
      return { ...state, periods };
    }
    case 'SET_CONTRACT_TYPE': return { ...state, contractType: action.payload };
    case 'TOGGLE_TERM': return { ...state, selectedTermIds: state.selectedTermIds.includes(action.payload) ? state.selectedTermIds.filter((id) => id !== action.payload) : [...state.selectedTermIds, action.payload] };
    case 'SET_PROFIT_METHOD': return { ...state, profitMethodId: action.payload };
    case 'SET_PROFIT_SHARING': return { ...state, profitSharingMin: action.payload };
    case 'TOGGLE_COLLATERAL_TYPE': return { ...state, acceptedCollateralTypes: state.acceptedCollateralTypes.includes(action.payload) ? state.acceptedCollateralTypes.filter((id) => id !== action.payload) : [...state.acceptedCollateralTypes, action.payload] };
    case 'TOGGLE_FARM': return { ...state, selectedFarmIds: state.selectedFarmIds.includes(action.payload) ? state.selectedFarmIds.filter((id) => id !== action.payload) : [...state.selectedFarmIds, action.payload] };
    case 'RESET': return initialState;
    default: return state;
  }
}

interface WizardContextValue {
  state: ChainWizardState;
  dispatch: React.Dispatch<WizardAction>;
  goNext: () => void;
  goPrev: () => void;
  canProceed: boolean;
  proceedBlockReason: string;
  isPeriodStep: boolean;
  periodIndex: number;
  totalStepCount: number;
}

const ChainWizardContext = createContext<WizardContextValue | null>(null);

export function ChainWizardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(wizardReducer, initialState);
  const total = totalSteps(state);

  const goNext = useCallback(() => {
    if (state.currentStep < total - 1) dispatch({ type: 'SET_STEP', payload: state.currentStep + 1 });
  }, [state.currentStep, total]);

  const goPrev = useCallback(() => {
    if (state.currentStep > 0) dispatch({ type: 'SET_STEP', payload: state.currentStep - 1 });
  }, [state.currentStep]);

  const { canProceed, proceedBlockReason } = (() => {
    const s = state;
    if (s.currentStep === 0) {
      if (!s.contractName.trim()) return { canProceed: false, proceedBlockReason: 'نام قرارداد را وارد کنید' };
      if (!s.duration || s.duration < 1) return { canProceed: false, proceedBlockReason: 'مدت قرارداد را وارد کنید' };
      if (!s.region) return { canProceed: false, proceedBlockReason: 'منطقه را انتخاب کنید' };
      return { canProceed: true, proceedBlockReason: '' };
    }
    if (isPeriodStep(state)) {
      const p = s.periods[periodIndex(state)];
      if (!p || !p.chickCount) return { canProceed: false, proceedBlockReason: 'تعداد جوجه‌ریزی را وارد کنید' };
      if (!p.targetWeight) return { canProceed: false, proceedBlockReason: 'وزن هدف را وارد کنید' };
      if (!p.deliveryDate) return { canProceed: false, proceedBlockReason: 'تاریخ تحویل را وارد کنید' };
      return { canProceed: true, proceedBlockReason: '' };
    }
    if (s.currentStep === contractStepOffset(s)) { // contract type
      if (!s.contractType) return { canProceed: false, proceedBlockReason: 'نوع قرارداد را انتخاب کنید' };
      return { canProceed: true, proceedBlockReason: '' };
    }
    if (s.currentStep === contractStepOffset(s) + 1) { // terms
      if (s.selectedTermIds.length === 0) return { canProceed: false, proceedBlockReason: 'حداقل یک شرط انتخاب کنید' };
      return { canProceed: true, proceedBlockReason: '' };
    }
    if (s.currentStep === contractStepOffset(s) + 3) { // collateral types
      if (s.acceptedCollateralTypes.length === 0) return { canProceed: false, proceedBlockReason: 'حداقل یک نوع تضمین انتخاب کنید' };
      return { canProceed: true, proceedBlockReason: '' };
    }
    if (isLast(state)) {
      if (s.selectedFarmIds.length === 0) return { canProceed: false, proceedBlockReason: 'حداقل یک مزرعه انتخاب کنید' };
      return { canProceed: true, proceedBlockReason: '' };
    }
    return { canProceed: true, proceedBlockReason: '' };
  })();

  return (
    <ChainWizardContext.Provider value={{
      state, dispatch, goNext, goPrev, canProceed, proceedBlockReason,
      isPeriodStep: isPeriodStep(state), periodIndex: periodIndex(state), totalStepCount: total,
    }}>
      {children}
    </ChainWizardContext.Provider>
  );
}

export function useChainWizard(): WizardContextValue {
  const ctx = useContext(ChainWizardContext);
  if (!ctx) throw new Error('useChainWizard must be used within ChainWizardProvider');
  return ctx;
}
