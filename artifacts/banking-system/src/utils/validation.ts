import { z } from 'zod';

export const createIndividualClientSchema = z.object({
  fullName: z.string().min(2, 'Nome completo é obrigatório'),
  monthlyIncome: z.coerce.number().min(0, 'Renda mensal não pode ser negativa'),
  age: z.coerce.number().int().min(1, 'Idade inválida').max(120, 'Idade inválida'),
  phone: z.string().optional().default(''),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')).default(''),
  category: z.string().optional().default('standard'),
  balance: z.coerce.number().min(0, 'Saldo não pode ser negativo').optional().default(0),
});

export const updateIndividualClientSchema = z.object({
  fullName: z.string().min(2, 'Nome completo é obrigatório').optional(),
  monthlyIncome: z.coerce.number().min(0, 'Renda mensal não pode ser negativa').optional(),
  age: z.coerce.number().int().min(1, 'Idade inválida').max(120, 'Idade inválida').optional(),
  phone: z.string().optional(),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  category: z.string().optional(),
  balance: z.coerce.number().min(0, 'Saldo não pode ser negativo').optional(),
});

export const createBusinessClientSchema = z.object({
  companyName: z.string().min(2, 'Razão Social é obrigatória'),
  tradeName: z.string().min(1, 'Nome Fantasia é obrigatório'),
  cnpj: z.string().min(14, 'CNPJ inválido').max(18, 'CNPJ inválido'),
  phone: z.string().optional().default(''),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')).default(''),
  category: z.string().optional().default('standard'),
  balance: z.coerce.number().min(0, 'Saldo não pode ser negativo').optional().default(0),
});

export const updateBusinessClientSchema = z.object({
  companyName: z.string().min(2, 'Razão Social é obrigatória').optional(),
  tradeName: z.string().min(1, 'Nome Fantasia é obrigatório').optional(),
  cnpj: z.string().min(14, 'CNPJ inválido').max(18, 'CNPJ inválido').optional(),
  phone: z.string().optional(),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  category: z.string().optional(),
  balance: z.coerce.number().min(0, 'Saldo não pode ser negativo').optional(),
});

export const withdrawalSchema = z.object({
  amount: z.coerce.number().positive('O valor deve ser maior que zero'),
  description: z.string().optional().default('Saque'),
});

export const updateSettingsSchema = z.object({
  language: z.enum(['pt', 'en']).optional(),
  currencyFormat: z.enum(['BRL', 'USD', 'EUR']).optional(),
  dateFormat: z.enum(['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']).optional(),
});

export type ValidationError = {
  field: string;
  message: string;
};

export function formatZodErrors(error: z.ZodError): ValidationError[] {
  return error.errors.map(err => ({
    field: err.path.join('.'),
    message: err.message,
  }));
}
