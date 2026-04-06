export const INDIVIDUAL_CLIENT_MAX_WITHDRAWAL = 1000;
export const BUSINESS_CLIENT_MAX_WITHDRAWAL = 5000;

export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

export const DB_PATH = process.env.DB_PATH || './banking.db';

export const CLIENT_TYPES = {
  INDIVIDUAL: 'individual',
  BUSINESS: 'business',
} as const;

export type ClientType = typeof CLIENT_TYPES[keyof typeof CLIENT_TYPES];

export const TRANSACTION_TYPES = {
  DEPOSIT: 'deposit',
  WITHDRAWAL: 'withdrawal',
  TRANSFER: 'transfer',
} as const;

export const LANGUAGES = {
  PT: 'pt',
  EN: 'en',
} as const;

export const CURRENCY_FORMATS = {
  BRL: 'BRL',
  USD: 'USD',
  EUR: 'EUR',
} as const;

export const DATE_FORMATS = {
  BR: 'DD/MM/YYYY',
  US: 'MM/DD/YYYY',
  ISO: 'YYYY-MM-DD',
} as const;
