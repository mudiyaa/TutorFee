export enum FeeType {
  MONTHLY = 'MONTHLY',
  PER_SESSION = 'PER_SESSION'
}

export enum TransactionType {
  PAYMENT = 'PAYMENT',
  CHARGE = 'CHARGE' // Used for logging a session or monthly fee accrual
}

export interface ClassGroup {
  id: string;
  name: string;
  feeType: FeeType;
  defaultFee: number;
  description?: string;
}

export interface Student {
  id: string;
  name: string;
  classId: string;
  email?: string;
  phone?: string;
  joinedDate: string;
}

export interface Transaction {
  id: string;
  studentId: string;
  type: TransactionType;
  amount: number;
  date: string;
  note?: string;
}

// Helper type for UI
export interface StudentWithBalance extends Student {
  balance: number;
  className: string;
  lastPaymentDate?: string;
}
