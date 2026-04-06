import type { Settings, CurrencyFormat, DateFormat } from "@/types";

export function formatCurrency(amount: number, settings?: Pick<Settings, "currencyFormat">): string {
  const format: CurrencyFormat = settings?.currencyFormat ?? "BRL";
  const localeMap: Record<CurrencyFormat, string> = {
    BRL: "pt-BR",
    USD: "en-US",
    EUR: "de-DE",
  };
  const locale = localeMap[format];
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: format,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateStr: string | null | undefined, settings?: Pick<Settings, "dateFormat">): string {
  if (!dateStr) return "-";
  const format: DateFormat = settings?.dateFormat ?? "DD/MM/YYYY";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  if (format === "DD/MM/YYYY") return `${day}/${month}/${year}`;
  if (format === "MM/DD/YYYY") return `${month}/${day}/${year}`;
  return `${year}-${month}-${day}`;
}

export function formatCNPJ(cnpj: string): string {
  const digits = cnpj.replace(/\D/g, "");
  if (digits.length !== 14) return cnpj;
  return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
}
