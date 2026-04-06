import { SettingsRecord } from '../models/Settings';

export function formatCurrency(amount: number, settings: SettingsRecord): string {
  const localeMap: Record<string, string> = {
    BRL: 'pt-BR',
    USD: 'en-US',
    EUR: 'de-DE',
  };

  const locale = localeMap[settings.currencyFormat] || 'pt-BR';
  const currency = settings.currencyFormat || 'BRL';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateStr: string, settings: SettingsRecord): string {
  if (!dateStr) return '';

  // SQLite returns "YYYY-MM-DD HH:MM:SS" (UTC without 'Z').
  // Append 'Z' so JavaScript parses it as UTC, preventing day-off errors.
  let normalized = dateStr.trim();
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(normalized)) {
    normalized = normalized.replace(' ', 'T') + 'Z';
  }

  const date = new Date(normalized);
  if (isNaN(date.getTime())) return dateStr;

  const pad = (n: number) => String(n).padStart(2, '0');
  const year = date.getUTCFullYear();
  const month = pad(date.getUTCMonth() + 1);
  const day = pad(date.getUTCDate());

  switch (settings.dateFormat) {
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`;
    case 'MM/DD/YYYY':
      return `${month}/${day}/${year}`;
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`;
    default:
      return `${day}/${month}/${year}`;
  }
}

export function formatCnpj(cnpj: string): string {
  const cleaned = (cnpj || '').replace(/\D/g, '');
  if (cleaned.length !== 14) return cnpj;
  return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}

export function sanitizeCnpj(cnpj: string): string {
  return (cnpj || '').replace(/\D/g, '');
}
