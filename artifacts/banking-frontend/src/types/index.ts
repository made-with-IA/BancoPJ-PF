export type ClientCategory = "standard" | "premium" | "vip";
export type BusinessCategory = "standard" | "corporate" | "enterprise";
export type TransactionType = "withdrawal" | "deposit";
export type Language = "pt" | "en";
export type CurrencyFormat = "BRL" | "USD" | "EUR";
export type DateFormat = "DD/MM/YYYY" | "MM/DD/YYYY" | "YYYY-MM-DD";

export interface IndividualClient {
  id: number;
  fullName: string;
  monthlyIncome: number;
  age: number;
  phone: string;
  email: string;
  category: ClientCategory;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessClient {
  id: number;
  companyName: string;
  tradeName: string;
  cnpj: string;
  phone: string;
  email: string;
  category: BusinessCategory;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: number;
  clientId: number;
  clientType: "individual" | "business";
  transactionType: TransactionType;
  amount: number;
  description: string;
  previousBalance: number;
  newBalance: number;
  createdAt: string;
}

export interface Settings {
  id: number;
  language: Language;
  currencyFormat: CurrencyFormat;
  dateFormat: DateFormat;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface StatementResponse {
  transactions: Transaction[];
  currentBalance: number;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface WithdrawResponse {
  success: boolean;
  transaction: Transaction;
  newBalance: number;
}

export interface IndividualClientFilters {
  page?: number;
  limit?: number;
  name?: string;
  email?: string;
  category?: string;
  minBalance?: number;
  maxBalance?: number;
}

export interface BusinessClientFilters {
  page?: number;
  limit?: number;
  name?: string;
  cnpj?: string;
  category?: string;
  minBalance?: number;
  maxBalance?: number;
}

export interface StatementFilters {
  page?: number;
  limit?: number;
  transactionType?: string;
  startDate?: string;
  endDate?: string;
}
