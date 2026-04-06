export interface IClient {
  withdrawMoney(amount: number): Promise<WithdrawalResult>;
  getStatement(filters?: StatementFilters): Promise<StatementResult>;
}

export interface WithdrawalResult {
  success: boolean;
  message: string;
  previousBalance?: number;
  newBalance?: number;
  transactionId?: number;
}

export interface StatementFilters {
  startDate?: string;
  endDate?: string;
  transactionType?: string;
  page?: number;
  limit?: number;
}

export interface StatementResult {
  transactions: TransactionRecord[];
  currentBalance: number;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TransactionRecord {
  id: number;
  clientId: number;
  clientType: string;
  transactionType: string;
  amount: number;
  description: string;
  previousBalance: number;
  newBalance: number;
  createdAt: string;
}
