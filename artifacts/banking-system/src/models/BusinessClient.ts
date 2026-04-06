export interface BusinessClientRecord {
  id: number;
  companyName: string;
  tradeName: string;
  cnpj: string;
  phone: string;
  email: string;
  category: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBusinessClientDTO {
  companyName: string;
  tradeName: string;
  cnpj: string;
  phone: string;
  email: string;
  category: string;
  balance?: number;
}

export interface UpdateBusinessClientDTO {
  companyName?: string;
  tradeName?: string;
  cnpj?: string;
  phone?: string;
  email?: string;
  category?: string;
  balance?: number;
}

export interface BusinessClientFilters {
  name?: string;
  email?: string;
  category?: string;
  cnpj?: string;
  minBalance?: number;
  maxBalance?: number;
}
