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

export interface CreateTransactionDTO {
  clientId: number;
  clientType: string;
  transactionType: string;
  amount: number;
  description: string;
  previousBalance: number;
  newBalance: number;
}
