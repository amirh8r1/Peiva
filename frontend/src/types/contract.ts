/** Contract entity — created by feed supplier, sent to farm owners */
export interface Contract {
  id: string;
  chainId: string;
  chainName: string;
  /** نوع قرارداد: کارمزدی یا پیمانکاری */
  contractType: 'commission' | 'contract';
  /** شرایط و تعهدات دو طرف */
  terms: string;
  /** حداقل درصد تسهیم منافع (تعیین شده توسط تأمین‌کننده) */
  profitSharingMin: number;
  status: ContractStatus;
  createdBy: string;
  createdAt: string;
}

export type ContractStatus =
  | 'draft'
  | 'sent'
  | 'negotiating'
  | 'approved'
  | 'finalized';

/** A farm owner's proposal/bid on a contract */
export interface FarmProposal {
  id: string;
  contractId: string;
  contractName: string;
  farmId: string;
  farmName: string;
  farmGrade: string;
  /** درصد مشارکت پیشنهادی مزرعه‌دار */
  proposedPercentage: number;
  status: 'pending' | 'accepted' | 'rejected';
  submittedAt: string;
}

/** Collateral provided by farm owner to finalize contract */
export interface Collateral {
  id: string;
  contractId: string;
  farmId: string;
  type: 'cash' | 'check' | 'property' | 'guarantee';
  /** Value in Toman (only for cash/check) */
  value?: number;
  status: 'pending' | 'provided' | 'verified';
  submittedAt: string;
}

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
