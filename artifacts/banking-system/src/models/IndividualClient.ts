export interface IndividualClientRecord {
  id: number;
  fullName: string;
  monthlyIncome: number;
  age: number;
  phone: string;
  email: string;
  category: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateIndividualClientDTO {
  fullName: string;
  monthlyIncome: number;
  age: number;
  phone: string;
  email: string;
  category: string;
  balance?: number;
}

export interface UpdateIndividualClientDTO {
  fullName?: string;
  monthlyIncome?: number;
  age?: number;
  phone?: string;
  email?: string;
  category?: string;
  balance?: number;
}

export interface IndividualClientFilters {
  name?: string;
  email?: string;
  category?: string;
  minBalance?: number;
  maxBalance?: number;
}
